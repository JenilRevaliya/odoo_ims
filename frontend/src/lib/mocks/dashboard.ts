import { DashboardKPIs } from '../../types';

export const MOCK_DASHBOARD_KPIS: DashboardKPIs = {
  total_products_in_stock: 1250,
  low_stock_count: 8,
  out_of_stock_count: 3,
  pending_receipts: 4,
  pending_deliveries: 7,
  scheduled_transfers: 2,
  as_of: new Date().toISOString(),
};
