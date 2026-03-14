'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  
  const sizeClasses = {
    sm: 'sm:max-w-[400px]',
    md: 'sm:max-w-[560px]',
    lg: 'sm:max-w-[720px]',
    xl: 'sm:max-w-[960px]',
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className={`fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-h-[100dvh] h-[100dvh] sm:h-auto sm:max-h-[85vh] ${sizeClasses[size]} translate-x-[-50%] translate-y-[-50%] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] sm:rounded-[var(--radius-lg)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] outline-none`}
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--border-subtle)] shrink-0 pr-12">
            <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              {title}
            </Dialog.Title>
            {subtitle && (
              <Dialog.Description className="text-sm text-[var(--text-secondary)] mt-1 tracking-wide">
                {subtitle}
              </Dialog.Description>
            )}
          </div>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-h-[100px]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface)] sm:bg-transparent rounded-b-[var(--radius-lg)]">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
