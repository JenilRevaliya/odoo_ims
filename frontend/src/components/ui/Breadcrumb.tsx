'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/operations': 'Operations',
  '/history': 'History',
  '/settings': 'Settings',
  '/products/new': 'New Product',
  '/operations/new': 'New Operation',
};

// Simple ID heuristic (if segment is a UUID or matches specific patterns)
const isId = (segment: string) => {
  return segment.length > 10 || segment.startsWith('prd-') || segment.startsWith('op-');
};

export default function Breadcrumb({ customLabel }: { customLabel?: string }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1 && !customLabel) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center space-x-2 text-sm mb-6">
      <ol className="flex items-center space-x-2">
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          
          let label = ROUTE_MAP[path] || ROUTE_MAP[`/${segment}`] || segment;
          
          // ID replacement logic
          if (isId(segment)) {
            label = customLabel || 'Details';
          }
          
          // Replace trailing edit with Edit Product or similar
          if (segment === 'edit') {
            label = 'Edit';
          }

          return (
            <li key={path} className="flex items-center">
              {index > 0 && <span className="text-[var(--text-muted)] mx-2">/</span>}
              {isLast ? (
                <span className="text-[var(--text-primary)] font-medium capitalize" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link 
                  href={path}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors capitalize"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
