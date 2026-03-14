'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ClipboardList, Clock } from 'lucide-react';

const tabs = [
  { href: '/dashboard', icon: Home, label: 'Dash' },
  { href: '/products', icon: Package, label: 'Items' },
  { href: '/operations', icon: ClipboardList, label: 'Ops' },
  { href: '/history', icon: Clock, label: 'History' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[60px] bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-around z-50 lg:hidden pb-[safe-area-inset-bottom]">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 relative"
          >
            <tab.icon className={`w-6 h-6 transition-all duration-200 ${isActive ? 'text-[var(--accent)] scale-110 translate-y-[-2px]' : 'text-[var(--text-secondary)]'}`} />
            <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute top-0 w-1/2 h-[2px] bg-[var(--accent)] rounded-b-full shadow-[0_2px_8px_var(--color-accent-glow)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
