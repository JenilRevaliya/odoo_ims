import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BackendState {
  isOnline: boolean;
  isMockMode: boolean;
  setOnlineStatus: (status: boolean) => void;
  toggleMockMode: () => void;
}

export const useBackendStore = create<BackendState>()(
  persist(
    (set) => ({
      isOnline: true,
      isMockMode: process.env.NEXT_PUBLIC_USE_MOCKS === 'true',
      setOnlineStatus: (status) => set({ isOnline: status }),
      toggleMockMode: () => set((state) => ({ isMockMode: !state.isMockMode })),
    }),
    {
      name: 'backend-storage',
    }
  )
);
