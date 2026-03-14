import db from '../../config/db';

export class DashboardService {
  static async getKPIs(warehouseId?: string) {
    // Total products in stock
    let totalStockQuery = db('stock_balances as sb')
      .join('products as p', 'sb.product_id', 'p.id')
      .where('p.is_deleted', false);

    if (warehouseId) {
      totalStockQuery = totalStockQuery
        .join('locations as l', 'sb.location_id', 'l.id')
        .where('l.warehouse_id', warehouseId);
    }

    const totalResult = await totalStockQuery
      .countDistinct('sb.product_id as count')
      .first();

    // Low stock: products where total stock <= minimum_stock AND stock > 0
    const lowStockResult = await db.raw(`
      SELECT COUNT(*) as count FROM (
        SELECT p.id
        FROM products p
        LEFT JOIN stock_balances sb ON p.id = sb.product_id
        ${warehouseId ? 'LEFT JOIN locations l ON sb.location_id = l.id' : ''}
        WHERE p.is_deleted = false
        ${warehouseId ? `AND l.warehouse_id = '${warehouseId}'` : ''}
        GROUP BY p.id, p.minimum_stock
        HAVING COALESCE(SUM(sb.quantity), 0) <= p.minimum_stock
        AND COALESCE(SUM(sb.quantity), 0) > 0
      ) as low_stock
    `);

    // Out of stock: products with 0 total stock
    const outOfStockResult = await db.raw(`
      SELECT COUNT(*) as count FROM (
        SELECT p.id
        FROM products p
        LEFT JOIN stock_balances sb ON p.id = sb.product_id
        ${warehouseId ? 'LEFT JOIN locations l ON sb.location_id = l.id' : ''}
        WHERE p.is_deleted = false
        ${warehouseId ? `AND l.warehouse_id = '${warehouseId}'` : ''}
        GROUP BY p.id
        HAVING COALESCE(SUM(sb.quantity), 0) = 0
      ) as out_of_stock
    `);

    // Pending receipts
    const pendingReceipts = await db('operations')
      .where({ type: 'receipt' })
      .whereIn('status', ['draft', 'waiting', 'ready'])
      .count('id as count')
      .first();

    // Pending deliveries
    const pendingDeliveries = await db('operations')
      .where({ type: 'delivery' })
      .whereIn('status', ['draft', 'waiting', 'ready'])
      .count('id as count')
      .first();

    // Scheduled transfers
    const scheduledTransfers = await db('operations')
      .where({ type: 'transfer' })
      .whereIn('status', ['draft', 'waiting', 'ready'])
      .count('id as count')
      .first();

    return {
      total_products_in_stock: parseInt(totalResult?.count as string, 10) || 0,
      low_stock_count: parseInt(lowStockResult.rows[0].count, 10) || 0,
      out_of_stock_count: parseInt(outOfStockResult.rows[0].count, 10) || 0,
      pending_receipts: parseInt(pendingReceipts?.count as string, 10) || 0,
      pending_deliveries: parseInt(pendingDeliveries?.count as string, 10) || 0,
      scheduled_transfers: parseInt(scheduledTransfers?.count as string, 10) || 0,
      as_of: new Date().toISOString(),
    };
  }

  static async getLowStockProducts(warehouseId?: string) {
    let query = db('products as p')
      .select('p.id', 'p.name', 'p.sku', 'p.category', 'p.unit_of_measure', 'p.minimum_stock', 'p.reorder_quantity')
      .select(db.raw('COALESCE(SUM(sb.quantity), 0)::int as total_stock'))
      .leftJoin('stock_balances as sb', 'p.id', 'sb.product_id')
      .where('p.is_deleted', false)
      .groupBy('p.id');

    if (warehouseId) {
      query = query.leftJoin('locations as l', 'sb.location_id', 'l.id')
        .where('l.warehouse_id', warehouseId);
    }

    query = query.havingRaw('COALESCE(SUM(sb.quantity), 0) <= p.minimum_stock');

    return query.orderBy('p.name');
  }

  static async getRecentOperations(limit: number = 20) {
    return db('operations as o')
      .select(
        'o.id', 'o.type', 'o.status', 'o.reference_number',
        'o.created_at', 'o.validated_at',
        'u.name as created_by_name'
      )
      .join('users as u', 'o.created_by', 'u.id')
      .orderBy('o.created_at', 'desc')
      .limit(limit);
  }
}
