import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { DashboardKPIs, Product, Operation, ApiResponse } from '../types';
import { MOCK_DASHBOARD_KPIS } from '../lib/mocks/dashboard';
import { MOCK_PRODUCTS } from '../lib/mocks/products';
import { MOCK_OPERATIONS } from '../lib/mocks/operations';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export function useDashboardKPIs(warehouseId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', warehouseId],
    queryFn: async (): Promise<ApiResponse<DashboardKPIs>> => {
      if (USE_MOCKS) {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: MOCK_DASHBOARD_KPIS }), 600)
        );
      }
      const url = warehouseId ? `/dashboard/kpis?warehouse_id=${warehouseId}` : '/dashboard/kpis';
      const res = await api.get(url);
      return res.data;
    },
    refetchInterval: 300000, // Auto refresh every 5 minutes
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: async (): Promise<ApiResponse<Product[]>> => {
      if (USE_MOCKS) {
        return new Promise((resolve) =>
          setTimeout(() => {
            const lowStock = MOCK_PRODUCTS.filter(p => p.total_stock > 0 && p.total_stock <= p.minimum_stock);
            resolve({ success: true, data: lowStock });
          }, 400)
        );
      }
      const res = await api.get('/dashboard/low-stock');
      return res.data;
    },
  });
}

export function useRecentOperations() {
  return useQuery({
    queryKey: ['dashboard', 'recent-operations'],
    queryFn: async (): Promise<ApiResponse<Operation[]>> => {
      if (USE_MOCKS) {
        return new Promise((resolve) =>
          setTimeout(() => {
            const sorted = [...MOCK_OPERATIONS].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 20);
            resolve({ success: true, data: sorted });
          }, 400)
        );
      }
      const res = await api.get('/dashboard/recent-operations');
      return res.data;
    },
  });
}
