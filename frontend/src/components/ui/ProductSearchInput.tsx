'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';

interface ProductSearchInputProps {
  onSelect: (productId: string, product: Product) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ProductSearchInput({ onSelect, disabled, placeholder = "Search SKU or Name..." }: ProductSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: productsData, isLoading } = useProducts(debouncedTerm ? { q: debouncedTerm } : undefined);
  const products = productsData?.data || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-secondary)]">
          {isLoading && searchTerm !== '' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input 
          type="text" 
          disabled={disabled}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] pl-10 pr-4 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] max-h-60 overflow-y-auto">
          {products.length === 0 && !isLoading ? (
            <div className="p-4 text-sm text-[var(--text-secondary)] text-center">
              No products found.
            </div>
          ) : (
            <ul className="py-1">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)] text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between outline-none"
                    onClick={() => {
                      onSelect(product.id, product);
                      setSearchTerm('');
                      setIsOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{product.name}</div>
                      <div className="font-mono text-xs text-[var(--text-muted)] mt-0.5">{product.sku}</div>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] sm:text-right mt-1 sm:mt-0">
                      Stock: <span className="text-[var(--text-primary)] font-medium">{product.total_stock} {product.unit_of_measure}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
