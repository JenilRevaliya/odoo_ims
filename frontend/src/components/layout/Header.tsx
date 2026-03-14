'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Bell, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';

import { useUIStore } from '@/store/ui';
import BackendStatusBadge from '@/components/ui/BackendStatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Inventory',
  '/products/new': 'New Product',
  '/operations': 'Warehouse Ops',
  '/operations/new': 'New Operation',
  '/history': 'Move History',
  '/settings': 'System Settings',
  '/profile': 'Account Profile',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profileData } = useProfile();
  const user = profileData?.data;
  
  const { title: customTitle, breadcrumbLabel } = useUIStore();

  // Determine if we should show a back button (mobile)
  const isRoot = pathname === '/dashboard' || pathname === '/products' || pathname === '/operations' || pathname === '/history' || pathname === '/settings';
  
  // Get static title or fallback to capitalize last segment
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const staticTitle = ROUTE_MAP[pathname] || ROUTE_MAP[`/${lastSegment}`];
  
  // Logic for dynamic identifiers (PRD-XXX, OP-XXX)
  const isDynamic = lastSegment?.length > 10 || lastSegment?.startsWith('prd-') || lastSegment?.startsWith('op-');
  const derivedTitle = isDynamic ? lastSegment.split('-')[0].toUpperCase() : (staticTitle || lastSegment || 'Overview');
  
  const title = customTitle || derivedTitle;

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center justify-between shrink-0 px-4 md:px-6 sticky top-0 z-30 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-4">
        {!isRoot && (
          <button 
            onClick={() => router.back()}
            className="md:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div>
          <h1 className="text-lg md:text-xl text-[var(--text-primary)] font-semibold tracking-tight capitalize">
            {title}
          </h1>
          {/* Breadcrumb on Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5">
            {breadcrumbLabel ? (
               <span className="text-[var(--text-secondary)] font-medium">{breadcrumbLabel}</span>
            ) : (
              segments.map((segment, idx) => {
                const path = `/${segments.slice(0, idx + 1).join('/')}`;
                const isLast = idx === segments.length - 1;
                const label = ROUTE_MAP[path] || segment;
                
                return (
                  <div key={path} className="flex items-center gap-1.5">
                    {idx > 0 && <span>/</span>}
                    {isLast ? (
                      <span className="text-[var(--text-secondary)] font-medium capitalize">{isDynamic ? 'Details' : label}</span>
                    ) : (
                      <Link href={path} className="hover:text-[var(--text-primary)] transition-colors capitalize">
                        {label}
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <BackendStatusBadge />
        <ThemeToggle />
        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors hidden sm:flex">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full ring-2 ring-[var(--bg-surface)]" />
        </button>
        
        <Link 
          href="/profile"
          className="flex items-center gap-3 pl-2 md:pl-4 border-l border-[var(--border-subtle)] ml-2 group"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {user?.name || 'Loading...'}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {user?.role || 'Guest'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-semibold text-[var(--text-primary)] group-hover:border-[var(--accent)] transition-all">
            {user?.name?.charAt(0) || <User className="w-4 h-4" />}
          </div>
        </Link>
      </div>
    </header>
  );
}
