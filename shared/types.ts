export type UserRole = 'manager' | 'staff';

export type OperationType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';

export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  minimum_stock: number;
  reorder_quantity: number;
  total_stock: number;
  stock_by_location: { location_id: string; location: string; quantity: number }[];
}

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  warehouse_id: string;
  name: string;
  description: string | null;
}

export interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  created_by: string;
  source_location_id: string | null;
  dest_location_id: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  validated_at: string | null;
  lines: OperationLine[];
}

export interface OperationLine {
  id: string;
  operation_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  expected_qty: number;
  done_qty: number | null;
}

export interface LedgerEntry {
  id: string;
  product_id: string;
  product_name: string;
  location_id: string;
  location_name: string;
  operation_id: string;
  user_id: string;
  user_name: string;
  delta: number;
  balance_after: number;
  operation_type: string;
  created_at: string;
}

export interface DashboardKPIs {
  total_products_in_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_receipts: number;
  pending_deliveries: number;
  scheduled_transfers: number;
  as_of: string;
}
