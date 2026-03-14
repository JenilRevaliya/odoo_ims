import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

import { useBackendStore } from '../store/backend';
const isOfflineOrMock = () => { const s = useBackendStore.getState(); return s.isMockMode || !s.isOnline; };

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              data: {
                data: {
                  access_token: 'mock-jwt-token-123',
                  user: { id: 'usr-1', name: 'Jenil Revaliya', email: credentials.email, role: 'manager' }
                }
              }
            });
          }, 800)
        );
      }
      return api.post('/auth/login', credentials);
    },
  });

  const signup = useMutation({
    mutationFn: async (userData: Record<string, string>) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(resolve, 800));
      }
      return api.post('/auth/signup', userData);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(resolve, 300));
      }
      return api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const forgotPassword = useMutation({
    mutationFn: async (email: string) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(resolve, 800));
      }
      return api.post('/auth/forgot-password', { email });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (isOfflineOrMock()) {
        return new Promise((resolve) => setTimeout(resolve, 800));
      }
      return api.post('/auth/reset-password', data);
    },
  });

  return {
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };
}
