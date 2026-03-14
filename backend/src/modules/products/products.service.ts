import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  minimum_stock?: number;
  reorder_quantity?: number;
}

interface UpdateProductInput {
  name?: string;
  category?: string;
  unit_of_measure?: string;
  minimum_stock?: number;
  reorder_quantity?: number;
}

interface ProductFilters {
  category?: string;
  status?: 'low_stock' | 'out_of_stock';
  search?: string;
  page?: number;
  per_page?: number;
}

export class ProductsService {
  static async list(filters: ProductFilters) {
    const page = filters.page || 1;
    const perPage = filters.per_page || 20;
    const offset = (page - 1) * perPage;

    let query = db('products')
      .select(
        'products.*',
        db.raw('COALESCE(SUM(sb.quantity), 0)::int as total_stock')
      )
      .leftJoin('stock_balances as sb', 'products.id', 'sb.product_id')
      .where('products.is_deleted', false)
      .groupBy('products.id');

    if (filters.category) {
      query = query.where('products.category', filters.category);
    }

    if (filters.search) {
      query = query.where(function () {
        this.whereILike('products.name', `%${filters.search}%`)
          .orWhereILike('products.sku', `%${filters.search}%`);
      });
    }

    if (filters.status === 'low_stock') {
      query = query.havingRaw('COALESCE(SUM(sb.quantity), 0) <= products.minimum_stock AND COALESCE(SUM(sb.quantity), 0) > 0');
    } else if (filters.status === 'out_of_stock') {
      query = query.havingRaw('COALESCE(SUM(sb.quantity), 0) = 0');
    }

    // Count total before pagination
    const countQuery = query.clone();
    const countResult = await db.raw(`SELECT COUNT(*) FROM (${countQuery.toQuery()}) as count_table`);
    const total = parseInt(countResult.rows[0].count, 10);

    const products = await query.orderBy('products.name', 'asc').limit(perPage).offset(offset);

    return {
      data: products,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    };
  }

  static async getById(id: string) {
    const product = await db('products').where({ id, is_deleted: false }).first();
    if (!product) return null;

    const stockByLocation = await db('stock_balances as sb')
      .select('sb.location_id', 'l.name as location', 'sb.quantity')
      .join('locations as l', 'sb.location_id', 'l.id')
      .where('sb.product_id', id);

    return { ...product, total_stock: stockByLocation.reduce((sum: number, s: any) => sum + s.quantity, 0), stock_by_location: stockByLocation };
  }

  static async searchBySku(sku: string) {
    return db('products')
      .select('*')
      .whereILike('sku', `%${sku}%`)
      .andWhere('is_deleted', false)
      .limit(10);
  }

  static async create(data: CreateProductInput) {
    // Validate SKU uniqueness
    const existing = await db('products').where({ sku: data.sku }).first();
    if (existing) {
      throw new Error('SKU already exists');
    }

    // Validate SKU format: letters-numbers pattern
    if (!/^[A-Z]{2,5}-\d{3,5}$/i.test(data.sku)) {
      throw new Error('SKU must follow format: ABC-001 (2-5 letters, dash, 3-5 digits)');
    }

    const id = uuidv4();
    const [product] = await db('products')
      .insert({
        id,
        name: data.name,
        sku: data.sku.toUpperCase(),
        category: data.category,
        unit_of_measure: data.unit_of_measure,
        minimum_stock: data.minimum_stock || 0,
        reorder_quantity: data.reorder_quantity || 0,
      })
      .returning('*');

    return product;
  }

  static async update(id: string, data: UpdateProductInput) {
    const existing = await db('products').where({ id, is_deleted: false }).first();
    if (!existing) throw new Error('Product not found');

    const [updated] = await db('products')
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');

    return updated;
  }

  static async softDelete(id: string) {
    const existing = await db('products').where({ id, is_deleted: false }).first();
    if (!existing) throw new Error('Product not found');

    await db('products').where({ id }).update({ is_deleted: true, updated_at: db.fn.now() });
    return { deleted: true };
  }
}
