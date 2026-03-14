'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  danger = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] sm:max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-lg)] rounded-[var(--radius-lg)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <div className="flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-[var(--status-danger)]/10 text-[var(--status-danger)]' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2 relative pr-8">
              <Dialog.Title className="text-lg font-medium text-[var(--text-primary)] leading-tight tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[var(--text-secondary)]">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <Dialog.Close asChild>
              <button 
                type="button" 
                disabled={isLoading}
                className="inline-flex justify-center items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent px-4 py-2 font-medium text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button 
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex justify-center items-center rounded-[var(--radius-md)] px-4 py-2 font-medium text-sm transition-colors disabled:opacity-50 ${danger ? 'bg-[var(--status-danger)] hover:bg-[#E53E3E] text-white shadow-sm' : 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] shadow-sm'}`}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
          
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm transition-opacity hover:opacity-100 disabled:pointer-events-none p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
