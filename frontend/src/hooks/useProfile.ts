import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useBackendStore } from '../store/backend';
const isOfflineOrMock = () => { const s = useBackendStore.getState(); return s.isMockMode || !s.isOnline; };
import { User, ApiResponse } from '../types';


export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ApiResponse<User>> => {
      if (isOfflineOrMock()) {
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
      if (isOfflineOrMock()) {
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
