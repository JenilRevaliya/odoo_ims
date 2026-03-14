import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      if (USE_MOCKS) {
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
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(resolve, 800));
      }
      return api.post('/auth/signup', userData);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      if (USE_MOCKS) {
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
      if (USE_MOCKS) {
        return new Promise((resolve) => setTimeout(resolve, 800));
      }
      return api.post('/auth/forgot-password', { email });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (USE_MOCKS) {
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
