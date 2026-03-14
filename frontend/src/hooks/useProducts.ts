import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Product, ApiResponse } from '../types';
import { MOCK_PRODUCTS } from '../lib/mocks/products';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<ApiResponse<Product[]>> => {
      if (USE_MOCKS) {
        return new Promise((resolve) =>
          setTimeout(() => {
            let filtered = [...MOCK_PRODUCTS];
            if (filters?.category) {
              filtered = filtered.filter(p => p.category === filters.category);
            }
            if (filters?.filter === 'low_stock') {
              filtered = filtered.filter(p => p.total_stock > 0 && p.total_stock <= p.minimum_stock);
            }
            if (filters?.filter === 'out_of_stock') {
              filtered = filtered.filter(p => p.total_stock === 0);
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
      const res = await api.get(`/products?${params}`);
      return res.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<ApiResponse<Product>> => {
      if (USE_MOCKS) {
        return new Promise((resolve, reject) =>
          setTimeout(() => {
            const product = MOCK_PRODUCTS.find(p => p.id === id);
            if (product) resolve({ success: true, data: product });
            else reject(new Error('Product not found'));
          }, 400)
        );
      }
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id: 'new-id' } }), 800));
      }
      const res = await api.post('/products', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id } }), 800));
      }
      const res = await api.put(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}
