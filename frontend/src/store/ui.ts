'use client';

import { create } from 'zustand';

interface HeaderState {
  title: string | null;
  breadcrumbLabel: string | null;
  setHeader: (data: { title?: string; breadcrumbLabel?: string }) => void;
  clearHeader: () => void;
}

export const useUIStore = create<HeaderState>((set) => ({
  title: null,
  breadcrumbLabel: null,
  setHeader: (data) => set((state) => ({ 
    title: data.title ?? state.title, 
    breadcrumbLabel: data.breadcrumbLabel ?? state.breadcrumbLabel 
  })),
  clearHeader: () => set({ title: null, breadcrumbLabel: null }),
}));
