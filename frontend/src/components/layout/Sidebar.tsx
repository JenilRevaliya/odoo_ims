'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hexagon, Home, Package, ClipboardList, Clock, Settings, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/operations', icon: ClipboardList, label: 'Operations' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ wrapperForLayout }: { wrapperForLayout?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

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
      className={`fixed left-0 top-0 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-200 z-50 ${isExpanded ? 'w-[240px]' : 'w-[60px]'}`}
      style={{ transitionTimingFunction: 'var(--ease-standard)' }}
    >
      <div className="h-16 flex items-center shrink-0 px-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <Hexagon className="w-8 h-8 shrink-0 text-[var(--accent)]" />
          <span className={`text-[var(--text-primary)] font-medium text-lg tracking-wide transition-opacity duration-150 ${isExpanded ? 'opacity-100 delay-100' : 'opacity-0 w-0 hidden'}`}>
            CoreInventory
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors
                    ${isActive 
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-l-2 border-[var(--accent)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border-l-2 border-transparent'
                    }
                  `}
                  title={!isExpanded ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`whitespace-nowrap transition-opacity duration-150 ${isExpanded ? 'opacity-100 delay-100' : 'opacity-0 w-0 hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 text-sm font-medium text-[var(--text-primary)] border border-[var(--border-subtle)]">
            RJ
          </div>
          <div className={`flex flex-col flex-1 transition-opacity duration-150 ${isExpanded ? 'opacity-100 delay-100' : 'opacity-0 w-0 hidden'}`}>
            <span className="text-[var(--text-primary)] text-sm font-medium leading-tight">Ravi Sharma</span>
            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Manager</span>
          </div>
          <button 
            className={`text-[var(--text-secondary)] hover:text-[var(--accent)] shrink-0 transition-opacity duration-150 ${isExpanded ? 'opacity-100 delay-100' : 'opacity-0 w-0 hidden'}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
