'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import { ThemeProvider } from './ThemeProvider';
import ThemeInitializer from './ThemeInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 min defaults
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="data-theme" 
        defaultTheme="dark" 
        enableSystem={false}
        storageKey="theme-preference"
      >
        <ThemeInitializer>
          <AuthGuard>
            {children}
          </AuthGuard>
        </ThemeInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
