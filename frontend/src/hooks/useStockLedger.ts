import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useBackendStore } from '../store/backend';
const isOfflineOrMock = () => { const s = useBackendStore.getState(); return s.isMockMode || !s.isOnline; };
import { LedgerEntry, ApiResponse } from '../types';
import { MOCK_LEDGER } from '../lib/mocks/ledger';


export function useStockLedger(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['stock-ledger', filters],
    queryFn: async (): Promise<ApiResponse<LedgerEntry[]>> => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) =>
          setTimeout(() => {
            let filtered = [...MOCK_LEDGER];
            if (filters?.product_id) {
              filtered = filtered.filter(l => l.product_id === filters.product_id);
            }
            if (filters?.operation_id) {
              filtered = filtered.filter(l => l.operation_id === filters.operation_id);
            }
            if (filters?.operation_type) {
              filtered = filtered.filter(l => l.operation_type === filters.operation_type);
            }
            resolve({
              success: true,
              data: filtered,
              meta: { page: 1, per_page: 50, total: filtered.length, total_pages: 1 }
            });
          }, 600)
        );
      }
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/stock-ledger?${params}`);
      return res.data;
    },
  });
}
