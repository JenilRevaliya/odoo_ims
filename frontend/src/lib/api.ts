import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { useBackendStore } from '../store/backend';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Need this if refresh tokens are in httpOnly cookies
});

// Attach Authorization header automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh logic (401 catch) and offline detection
api.interceptors.response.use(
  (response) => {
    useBackendStore.getState().setOnlineStatus(true);
    return response;
  },
  async (error) => {
    if (!error.response) {
      // Network Error or server is down
      useBackendStore.getState().setOnlineStatus(false);
    } else {
      useBackendStore.getState().setOnlineStatus(true);
    }
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Assume backend relies on HttpOnly refresh token cookie on this endpoint
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        useAuthStore.getState().setAuth(data.access_token, data.user);
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        // Option: emit an event or force redirect to /login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
