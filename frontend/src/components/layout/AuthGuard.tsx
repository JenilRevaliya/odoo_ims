'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Exclude auth routes
    if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.includes('password')) return;

    if (!token) {
      router.push('/login');
    }
  }, [token, pathname, router]);

  // Optionally return null or loading skeleton during redirect decision
  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.includes('password')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
