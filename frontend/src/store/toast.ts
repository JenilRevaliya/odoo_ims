import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Keep max 3 toasts
    const newToasts = [...state.toasts, { ...toast, id }].slice(-3);
    return { toasts: newToasts };
  }),
  removeToast: (id) => set((state) => ({ 
    toasts: state.toasts.filter((t) => t.id !== id) 
  })),
  clearAll: () => set({ toasts: [] }),
}));

// Convenience helper
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().addToast({ variant: 'success', title, description }),
  error: (title: string, description?: string) => useToastStore.getState().addToast({ variant: 'error', title, description }),
  warning: (title: string, description?: string) => useToastStore.getState().addToast({ variant: 'warning', title, description }),
  info: (title: string, description?: string) => useToastStore.getState().addToast({ variant: 'info', title, description }),
};
