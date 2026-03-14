'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hexagon, Home, Package, ClipboardList, Clock, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/products', icon: Package, label: 'Inventory' },
  { href: '/operations', icon: ClipboardList, label: 'Warehouse Ops' },
  { href: '/history', icon: Clock, label: 'Move History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { data: profileData } = useProfile();
  const { logout } = useAuth();
  const user = profileData?.data;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsExpanded(false);
      else setIsExpanded(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 z-50 ${isExpanded ? 'w-[240px]' : 'w-[72px]'}`}
      style={{ transitionTimingFunction: 'var(--ease-spring)' }}
    >
      <div className="h-16 flex items-center justify-between shrink-0 px-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <Hexagon className="w-8 h-8 shrink-0 text-[var(--accent)] animate-pulse-subtle" />
          <span className={`text-[var(--text-primary)] font-semibold text-lg tracking-tight transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
            CoreInvent
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden no-scrollbar">
        <ul className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all group relative
                    ${isActive 
                      ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[var(--shadow-accent)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }
                  `}
                  title={!isExpanded ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`whitespace-nowrap font-medium transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
                    {item.label}
                  </span>
                  
                  {isActive && !isExpanded && (
                    <div className="absolute left-0 w-1 h-6 bg-[var(--text-on-accent)] rounded-r-full shadow-sm" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-elevated)]/30">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap px-1">
          <Link href="/profile" className="shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] group-hover:border-[var(--accent)] transition-all">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </Link>
          <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
            <span className="text-[var(--text-primary)] text-sm font-semibold leading-tight truncate">{user?.name || 'User'}</span>
            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold mt-0.5">{user?.role || 'Staff'}</span>
          </div>
          <button 
            onClick={() => logout.mutate()}
            className={`p-2 text-[var(--text-secondary)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger)]/10 rounded-full transition-all ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-sm)] transition-colors hidden lg:flex"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
