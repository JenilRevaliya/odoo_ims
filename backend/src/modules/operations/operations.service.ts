import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

// ---------- Types ----------

type OpType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';
type OpStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

interface CreateOperationInput {
  type: OpType;
  source_location_id?: string;
  dest_location_id?: string;
  supplier_ref?: string;
  notes?: string;
  lines: { product_id: string; expected_qty: number }[];
}

interface OperationFilters {
  type?: OpType;
  status?: OpStatus;
  warehouse_id?: string;
  from?: string;
  to?: string;
  ref?: string;
  page?: number;
  per_page?: number;
}

// ---------- State Machine ----------

const VALID_TRANSITIONS: Record<OpStatus, OpStatus[]> = {
  draft: ['waiting', 'canceled'],
  waiting: ['ready', 'canceled'],
  ready: ['done', 'canceled'],
  done: [],
  canceled: [],
};

function assertTransition(current: OpStatus, next: OpStatus) {
  if (!VALID_TRANSITIONS[current]?.includes(next)) {
    throw new Error(`OPERATION_LOCKED: Cannot transition from '${current}' to '${next}'`);
  }
}

// ---------- Reference Number Generator ----------

async function generateRefNumber(type: OpType): Promise<string> {
  const prefix: Record<OpType, string> = {
    receipt: 'REC',
    delivery: 'DEL',
    transfer: 'TRF',
    adjustment: 'ADJ',
  };
  const year = new Date().getFullYear();
  const count = await db('operations')
    .where('type', type)
    .whereRaw(`EXTRACT(YEAR FROM created_at) = ?`, [year])
    .count('id as c')
    .first();
  const seq = (parseInt(count?.c as string, 10) || 0) + 1;
  return `${prefix[type]}-${year}-${String(seq).padStart(4, '0')}`;
}

// ---------- Service ----------

export class OperationsService {

  // ---- List ----
  static async list(filters: OperationFilters) {
    const page = filters.page || 1;
    const perPage = filters.per_page || 20;
    const offset = (page - 1) * perPage;

    let query = db('operations as o')
      .select(
        'o.*',
        'u.name as created_by_name',
        db.raw('(SELECT COUNT(*) FROM operation_lines ol WHERE ol.operation_id = o.id)::int as lines_count')
      )
      .join('users as u', 'o.created_by', 'u.id');

    if (filters.type) query = query.where('o.type', filters.type);
    if (filters.status) query = query.where('o.status', filters.status);
    if (filters.ref) query = query.whereILike('o.reference_number', `%${filters.ref}%`);
    if (filters.from) query = query.where('o.created_at', '>=', filters.from);
    if (filters.to) query = query.where('o.created_at', '<=', filters.to);

    if (filters.warehouse_id) {
      query = query.where(function () {
        this.whereIn('o.source_location_id', function () {
          this.select('id').from('locations').where('warehouse_id', filters.warehouse_id!);
        }).orWhereIn('o.dest_location_id', function () {
          this.select('id').from('locations').where('warehouse_id', filters.warehouse_id!);
        });
      });
    }

    const countResult = await query.clone().clearSelect().clearOrder().count('o.id as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    const operations = await query.orderBy('o.created_at', 'desc').limit(perPage).offset(offset);

    return {
      data: operations,
      meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
    };
  }

  // ---- Get by ID ----
  static async getById(id: string) {
    const operation = await db('operations as o')
      .select('o.*', 'u.name as created_by_name')
      .join('users as u', 'o.created_by', 'u.id')
      .where('o.id', id)
      .first();
    if (!operation) return null;

    const lines = await db('operation_lines as ol')
      .select('ol.*', 'p.name as product_name', 'p.sku')
      .join('products as p', 'ol.product_id', 'p.id')
      .where('ol.operation_id', id);

    return { ...operation, lines };
  }

  // ---- Create ----
  static async create(userId: string, data: CreateOperationInput) {
    if (!data.lines || data.lines.length === 0) {
      throw new Error('At least one product line is required');
    }
    if (data.lines.length > 50) {
      throw new Error('Maximum 50 lines per operation');
    }

    const refNumber = await generateRefNumber(data.type);
    const opId = uuidv4();

    await db.transaction(async (trx) => {
      await trx('operations').insert({
        id: opId,
        type: data.type,
        status: 'draft',
        created_by: userId,
        source_location_id: data.source_location_id || null,
        dest_location_id: data.dest_location_id || null,
        reference_number: refNumber,
        supplier_ref: data.supplier_ref || null,
        notes: data.notes || null,
      });

      const lineRows = data.lines.map((line) => ({
        id: uuidv4(),
        operation_id: opId,
        product_id: line.product_id,
        expected_qty: line.expected_qty,
        done_qty: null,
      }));

      await trx('operation_lines').insert(lineRows);
    });

    return OperationsService.getById(opId);
  }

  // ---- Update (Draft/Waiting only) ----
  static async update(id: string, data: Partial<CreateOperationInput>) {
    const op = await db('operations').where({ id }).first();
    if (!op) throw new Error('Operation not found');
    if (!['draft', 'waiting'].includes(op.status)) {
      throw new Error('OPERATION_LOCKED: Can only edit Draft or Waiting operations');
    }

    await db('operations').where({ id }).update({
      source_location_id: data.source_location_id ?? op.source_location_id,
      dest_location_id: data.dest_location_id ?? op.dest_location_id,
      supplier_ref: data.supplier_ref ?? op.supplier_ref,
      notes: data.notes ?? op.notes,
      updated_at: db.fn.now(),
    });

    return OperationsService.getById(id);
  }

  // ---- State Transitions ----
  static async submit(id: string) {
    return OperationsService._transition(id, 'waiting');
  }

  static async markReady(id: string) {
    return OperationsService._transition(id, 'ready');
  }

  static async cancel(id: string, userRole: string) {
    if (userRole !== 'manager') {
      throw new Error('FORBIDDEN: Only managers can cancel operations');
    }
    return OperationsService._transition(id, 'canceled');
  }

  private static async _transition(id: string, nextStatus: OpStatus) {
    const op = await db('operations').where({ id }).first();
    if (!op) throw new Error('Operation not found');
    assertTransition(op.status, nextStatus);
    await db('operations').where({ id }).update({ status: nextStatus, updated_at: db.fn.now() });
    return OperationsService.getById(id);
  }

  // ==========================================
  //  VALIDATE — The critical stock transaction
  // ==========================================
  static async validate(id: string, userId: string) {
    const op = await db('operations').where({ id }).first();
    if (!op) throw new Error('Operation not found');
    assertTransition(op.status, 'done');

    const lines = await db('operation_lines').where({ operation_id: id });
    if (lines.length === 0) throw new Error('No lines to validate');

    // Ensure all done_qty are set
    for (const line of lines) {
      if (line.done_qty === null || line.done_qty === undefined) {
        // Default done_qty to expected_qty if not set
        await db('operation_lines').where({ id: line.id }).update({ done_qty: line.expected_qty });
        line.done_qty = line.expected_qty;
      }
    }

    await db.transaction(async (trx) => {
      for (const line of lines) {
        const doneQty = line.done_qty;

        switch (op.type) {
          case 'receipt':
            await OperationsService._upsertStock(trx, line.product_id, op.dest_location_id, doneQty);
            await OperationsService._insertLedger(trx, line.product_id, op.dest_location_id, id, userId, doneQty, 'receipt');
            break;

          case 'delivery':
            await OperationsService._decreaseStock(trx, line.product_id, op.source_location_id, doneQty);
            await OperationsService._insertLedger(trx, line.product_id, op.source_location_id, id, userId, -doneQty, 'delivery');
            break;

          case 'transfer':
            await OperationsService._decreaseStock(trx, line.product_id, op.source_location_id, doneQty);
            await OperationsService._insertLedger(trx, line.product_id, op.source_location_id, id, userId, -doneQty, 'transfer_out');
            await OperationsService._upsertStock(trx, line.product_id, op.dest_location_id, doneQty);
            await OperationsService._insertLedger(trx, line.product_id, op.dest_location_id, id, userId, doneQty, 'transfer_in');
            break;

          case 'adjustment':
            await OperationsService._adjustStock(trx, line.product_id, op.source_location_id, doneQty, id, userId);
            break;
        }
      }

      await trx('operations').where({ id }).update({
        status: 'done',
        validated_at: trx.fn.now(),
        validated_by: userId,
        updated_at: trx.fn.now(),
      });
    });

    return OperationsService.getById(id);
  }

  // ---------- Stock Helpers (within transaction) ----------

  private static async _upsertStock(trx: any, productId: string, locationId: string, qty: number) {
    const existing = await trx('stock_balances')
      .where({ product_id: productId, location_id: locationId })
      .first();

    if (existing) {
      const updated = await trx('stock_balances')
        .where({ id: existing.id, version: existing.version })
        .update({
          quantity: existing.quantity + qty,
          version: existing.version + 1,
          updated_at: trx.fn.now(),
        });
      if (updated === 0) throw new Error('CONCURRENCY_CONFLICT: Stock was modified by another transaction');
    } else {
      await trx('stock_balances').insert({
        id: uuidv4(),
        product_id: productId,
        location_id: locationId,
        quantity: qty,
        version: 0,
      });
    }
  }

  private static async _decreaseStock(trx: any, productId: string, locationId: string, qty: number) {
    const existing = await trx('stock_balances')
      .where({ product_id: productId, location_id: locationId })
      .first();

    if (!existing || existing.quantity < qty) {
      const product = await trx('products').where({ id: productId }).first();
      throw new Error(`INSUFFICIENT_STOCK: Product "${product?.name}" has ${existing?.quantity || 0} available, need ${qty}`);
    }

    const updated = await trx('stock_balances')
      .where({ id: existing.id, version: existing.version })
      .update({
        quantity: existing.quantity - qty,
        version: existing.version + 1,
        updated_at: trx.fn.now(),
      });
    if (updated === 0) throw new Error('CONCURRENCY_CONFLICT: Stock was modified by another transaction');
  }

  private static async _adjustStock(trx: any, productId: string, locationId: string, physicalCount: number, opId: string, userId: string) {
    const existing = await trx('stock_balances')
      .where({ product_id: productId, location_id: locationId })
      .first();

    const currentQty = existing?.quantity || 0;
    const delta = physicalCount - currentQty;

    if (existing) {
      await trx('stock_balances')
        .where({ id: existing.id })
        .update({ quantity: physicalCount, version: (existing.version || 0) + 1, updated_at: trx.fn.now() });
    } else {
      await trx('stock_balances').insert({
        id: uuidv4(), product_id: productId, location_id: locationId,
        quantity: physicalCount, version: 0,
      });
    }

    await OperationsService._insertLedger(trx, productId, locationId, opId, userId, delta, 'adjustment');
  }

  private static async _insertLedger(trx: any, productId: string, locationId: string, opId: string, userId: string, delta: number, opType: string) {
    const balance = await trx('stock_balances')
      .where({ product_id: productId, location_id: locationId })
      .first();

    await trx('stock_ledger').insert({
      id: uuidv4(),
      product_id: productId,
      location_id: locationId,
      operation_id: opId,
      user_id: userId,
      delta,
      balance_after: balance?.quantity || 0,
      operation_type: opType,
    });
  }
}
