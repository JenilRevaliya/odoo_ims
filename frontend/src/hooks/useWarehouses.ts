import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useBackendStore } from '../store/backend';
const isOfflineOrMock = () => { const s = useBackendStore.getState(); return s.isMockMode || !s.isOnline; };
import { Warehouse, Location, ApiResponse } from '../types';
import { MOCK_WAREHOUSES, MOCK_LOCATIONS } from '../lib/mocks/warehouses';


export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async (): Promise<ApiResponse<Warehouse[]>> => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: MOCK_WAREHOUSES }), 400));
      }
      const res = await api.get('/warehouses');
      return res.data;
    },
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: async (): Promise<ApiResponse<Warehouse>> => {
      if (isOfflineOrMock()) {
        return new Promise((resolve, reject) => setTimeout(() => {
          const wh = MOCK_WAREHOUSES.find(w => w.id === id);
          if (wh) resolve({ success: true, data: wh });
          else reject(new Error('Warehouse not found'));
        }, 400));
      }
      const res = await api.get(`/warehouses/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useLocations(warehouseId?: string) {
  return useQuery({
    queryKey: ['locations', warehouseId],
    queryFn: async (): Promise<ApiResponse<Location[]>> => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(() => {
          let locs = MOCK_LOCATIONS;
          if (warehouseId) locs = locs.filter(l => l.warehouse_id === warehouseId);
          resolve({ success: true, data: locs });
        }, 400));
      }
      const url = warehouseId ? `/warehouses/${warehouseId}/locations` : '/locations';
      const res = await api.get(url);
      return res.data;
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Warehouse>) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id: 'wh-new' } }), 800));
      }
      const res = await api.post('/warehouses', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

export function useCreateLocation(warehouseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Location>) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id: 'loc-new', warehouse_id: warehouseId } }), 800));
      }
      const res = await api.post(`/warehouses/${warehouseId}/locations`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useDeleteLocation(warehouseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (locationId: string) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: null }), 600));
      }
      const res = await api.delete(`/warehouses/${warehouseId}/locations/${locationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
