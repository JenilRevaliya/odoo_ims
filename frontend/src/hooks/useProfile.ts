import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { User, ApiResponse } from '../types';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ApiResponse<User>> => {
      if (USE_MOCKS) {
        // Simulating current user based on token (assuming 1 for mock)
        return new Promise((resolve) => setTimeout(() => resolve({
          success: true,
          data: {
            id: 'usr-1',
            name: 'Jenil Revaliya',
            email: 'jenil@company.com',
            role: 'manager',
            created_at: new Date(Date.now() - 31536000000).toISOString()
          }
        }), 400));
      }
      const res = await api.get('/profile');
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data }), 800));
      }
      const res = await api.put('/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
