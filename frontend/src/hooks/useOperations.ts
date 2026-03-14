import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Operation, ApiResponse, OperationStatus } from '../types';
import { MOCK_OPERATIONS } from '../lib/mocks/operations';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export function useOperations(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['operations', filters],
    queryFn: async (): Promise<ApiResponse<Operation[]>> => {
      if (USE_MOCKS) {
        return new Promise((resolve) =>
          setTimeout(() => {
            let filtered = [...MOCK_OPERATIONS];
            if (filters?.type) {
              filtered = filtered.filter(o => o.type === filters.type);
            }
            if (filters?.status) {
              filtered = filtered.filter(o => o.status === filters.status);
            }
            if (filters?.warehouse_id) {
              filtered = filtered.filter(o => 
                o.source_location_id?.includes(filters.warehouse_id) || 
                o.dest_location_id?.includes(filters.warehouse_id)
              );
            }
            resolve({
              success: true,
              data: filtered,
              meta: { page: 1, per_page: 20, total: filtered.length, total_pages: 1 }
            });
          }, 600)
        );
      }
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/operations?${params}`);
      return res.data;
    },
  });
}

export function useOperation(id: string) {
  return useQuery({
    queryKey: ['operations', id],
    queryFn: async (): Promise<ApiResponse<Operation>> => {
      if (USE_MOCKS) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const op = MOCK_OPERATIONS.find(o => o.id === id);
            if (op) resolve({ success: true, data: op });
            else reject(new Error('Operation not found'));
          }, 400)
        );
      }
      const res = await api.get(`/operations/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Operation>) => {
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id: 'op-new', status: 'draft' } }), 800));
      }
      const res = await api.post('/operations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });
}

export function useUpdateOperation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Operation>) => {
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id } }), 800));
      }
      const res = await api.put(`/operations/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['operations', id] });
    },
  });
}

// State transition mutations
const createTransitionMutation = (action: string, targetStatus: OperationStatus) => {
  return function useTransitionMutation(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload?: Record<string, unknown>) => {
        if (USE_MOCKS) {
          return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { id, status: targetStatus } }), 800));
        }
        const res = await api.post(`/operations/${id}/${action}`, payload);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['operations'] });
        queryClient.invalidateQueries({ queryKey: ['operations', id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['products'] }); // Validate affects stock
      },
    });
  }
}

export const useSubmitOperation = createTransitionMutation('submit', 'waiting');
export const useMarkReadyOperation = createTransitionMutation('ready', 'ready');
export const useValidateOperation = createTransitionMutation('validate', 'done');
export const useCancelOperation = createTransitionMutation('cancel', 'canceled');
