import db from '../../config/db';

interface LedgerFilters {
  product_id?: string;
  location_id?: string;
  operation_type?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export class StockLedgerService {
  static async list(filters: LedgerFilters) {
    const page = filters.page || 1;
    const perPage = filters.per_page || 30;
    const offset = (page - 1) * perPage;

    let query = db('stock_ledger as sl')
      .select(
        'sl.*',
        'p.name as product_name',
        'p.sku',
        'l.name as location_name',
        'u.name as user_name',
        'o.reference_number'
      )
      .join('products as p', 'sl.product_id', 'p.id')
      .join('locations as l', 'sl.location_id', 'l.id')
      .join('users as u', 'sl.user_id', 'u.id')
      .join('operations as o', 'sl.operation_id', 'o.id');

    if (filters.product_id) query = query.where('sl.product_id', filters.product_id);
    if (filters.location_id) query = query.where('sl.location_id', filters.location_id);
    if (filters.operation_type) query = query.where('sl.operation_type', filters.operation_type);
    if (filters.from) query = query.where('sl.created_at', '>=', filters.from);
    if (filters.to) query = query.where('sl.created_at', '<=', filters.to);

    const countResult = await query.clone().clearSelect().clearOrder().count('sl.id as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    const entries = await query.orderBy('sl.created_at', 'desc').limit(perPage).offset(offset);

    return {
      data: entries,
      meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
    };
  }
}
