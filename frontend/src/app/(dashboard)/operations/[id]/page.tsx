'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  useOperation, 
  useUpdateOperation,
  useSubmitOperation,
  useMarkReadyOperation,
  useValidateOperation,
  useCancelOperation
} from '@/hooks/useOperations';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/store/toast';
import { 
  ArrowLeft, History, Play, CheckCircle2, XCircle, FileText, Package, AlertTriangle, Loader2, Save
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { parseISO, format } from 'date-fns';

export default function OperationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const operationId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { data: profileData } = useProfile();
  const isManager = profileData?.data?.role === 'manager';

  const { data: opData, isLoading, error } = useOperation(operationId);
  const operation = opData?.data;

  // Mutations
  const updateMutation = useUpdateOperation(operationId);
  const submitMutation = useSubmitOperation(operationId);
  const readyMutation = useMarkReadyOperation(operationId);
  const validateMutation = useValidateOperation(operationId);
  const cancelMutation = useCancelOperation(operationId);

  // Dialog State
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);

  // Editable Quantities (local state, flushed to backend on blur or via explicit save)
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb customLabel="Loading..." />
        <LoadingSkeleton variant="default" count={1} />
        <LoadingSkeleton variant="product-card" />
        <LoadingSkeleton variant="table-row" count={3} />
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-[var(--status-danger)] mb-4" />
        <h2 className="text-xl font-medium text-[var(--text-primary)]">Operation not found</h2>
        <button onClick={() => router.push('/operations')} className="mt-6 flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-glow)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Operations
        </button>
      </div>
    );
  }

  const isEditable = operation.status === 'draft' || operation.status === 'waiting';
  const isDone = operation.status === 'done';
  const isCanceled = operation.status === 'canceled';

  const handleAction = async (actionFn: typeof submitMutation.mutateAsync, successMsg: string) => {
    try {
      await actionFn({});
      toast.success('Success', successMsg);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.error?.message || 'Action failed';
      toast.error('Error', msg);
    }
  };

  const handleQtyChange = (lineId: string, value: string) => {
    const val = parseFloat(value);
    setEditedQuantities(prev => ({ ...prev, [lineId]: isNaN(val) ? 0 : val }));
  };

  const saveQtyUpdates = async () => {
    // Only flush lines that were actually changed
    const newLines = operation.lines.map(l => ({
      ...l,
      done_qty: editedQuantities[l.id] !== undefined ? editedQuantities[l.id] : l.done_qty
    }));
    try {
      await updateMutation.mutateAsync({ lines: newLines });
      toast.info('Saved', 'Quantities updated successfully');
    } catch {
      toast.error('Error', 'Failed to update quantities');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel={operation.reference_number || operation.id.split('-')[0]} />
        <button 
          onClick={() => router.push('/operations')}
          className="md:hidden flex flex-row items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {isCanceled && (
        <div className="bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/20 p-4 rounded-[var(--radius-md)] flex items-center gap-3">
          <XCircle className="w-5 h-5 text-[var(--status-danger)]" />
          <p className="text-sm font-medium text-[var(--status-danger)]">This operation was canceled and cannot be modified.</p>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
              {operation.reference_number || operation.id.split('-')[0]}
            </h1>
            <StatusBadge status={operation.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--text-secondary)]">
            <span className="capitalize font-medium text-[var(--text-primary)]">{operation.type}</span>
            <span>•</span>
            <span>{format(parseISO(operation.created_at), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {operation.status === 'draft' && (
            <button 
              onClick={() => handleAction(submitMutation.mutateAsync, 'Operation marked as waiting')}
              disabled={submitMutation.isPending}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] rounded-[var(--radius-md)] transition-colors"
            >
              Mark as Waiting For Execution
            </button>
          )}

          {operation.status === 'waiting' && (
            <button 
              onClick={() => handleAction(readyMutation.mutateAsync, 'Operation is ready for validation')}
              disabled={readyMutation.isPending}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] rounded-[var(--radius-md)] transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-[#3FB950]" /> Mark Ready
            </button>
          )}

          {operation.status === 'ready' && (
            <button 
              onClick={() => setShowValidateDialog(true)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2 bg-[var(--status-warning)] hover:brightness-110 text-[var(--bg)] text-sm font-medium rounded-[var(--radius-md)] transition-all shadow-md"
            >
              <Play className="w-4 h-4 fill-[var(--bg)]" /> Validate
            </button>
          )}

          {(operation.status === 'waiting' || operation.status === 'ready') && isManager && (
            <button 
              onClick={() => setShowCancelDialog(true)}
              className="px-4 py-2 text-sm font-medium text-[var(--status-danger)] hover:bg-[var(--status-danger)]/10 rounded-[var(--radius-md)] transition-colors flex items-center justify-center border border-transparent hover:border-[var(--status-danger)]/20"
            >
              Cancel
            </button>
          )}

          {isDone && (
            <button 
              onClick={() => router.push(`/history?operation_id=${operation.id}`)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] transition-colors"
            >
              <History className="w-4 h-4" /> Move History
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 shadow-sm space-y-5 h-full">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">
              Details
            </h2>
            
            <div>
              <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Source</dt>
              <dd className="text-sm text-[var(--text-primary)]">{operation.source_location_id || 'Supplier / External'}</dd>
            </div>
            
            <div>
              <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Destination</dt>
              <dd className="text-sm text-[var(--text-primary)]">{operation.dest_location_id || 'Customer / External'}</dd>
            </div>

            {operation.notes && (
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Internal Notes</dt>
                <dd className="text-sm text-[var(--text-secondary)] italic border-l-2 border-[var(--border-subtle)] pl-3 py-1">
                  {operation.notes}
                </dd>
              </div>
            )}
            
            <div>
              <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Created By</dt>
              <dd className="text-sm text-[var(--text-primary)]">{operation.created_by}</dd>
            </div>
          </div>
        </div>

        {/* Lines Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--text-muted)]" /> Product Lines
              </h2>
              {isEditable && (
                 <button 
                  onClick={saveQtyUpdates}
                  disabled={Object.keys(editedQuantities).length === 0 || updateMutation.isPending}
                  className="text-xs font-medium px-3 py-1.5 bg-[var(--accent)] text-[var(--text-on-accent)] rounded flex items-center gap-1.5 disabled:opacity-50 disabled:grayscale transition-all"
                 >
                   {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                   Save Edits
                 </button>
              )}
            </div>
            
            <div className="flex-1 overflow-x-auto">
              {operation.lines?.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)] text-sm flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-[var(--text-muted)]" />
                  No products in this operation.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider w-[40%]">Product</th>
                      <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-right">Expected</th>
                      <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-right w-[140px]">Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operation.lines?.map((line) => {
                      const doneVal = editedQuantities[line.id] !== undefined ? editedQuantities[line.id] : (line.done_qty ?? 0);
                      const isMismatch = isDone && doneVal !== line.expected_qty;
                      
                      return (
                        <tr key={line.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors group">
                          <td className="py-3 px-4 text-sm text-[var(--text-primary)]">
                            <button 
                              onClick={() => router.push(`/products/${line.product_id}`)}
                              className="font-medium hover:text-[var(--accent)] hover:underline flex flex-col text-left focus:outline-none"
                            >
                              <span>{line.product_name}</span>
                              <span className="font-mono text-xs text-[var(--text-muted)]">{line.sku}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-right text-[var(--text-secondary)] font-medium">
                            {line.expected_qty}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-right">
                            {isEditable ? (
                              <input 
                                type="number" 
                                value={editedQuantities[line.id] !== undefined ? editedQuantities[line.id] : (line.done_qty || '')}
                                onChange={e => handleQtyChange(line.id, e.target.value)}
                                placeholder="0"
                                className="w-[80px] text-right bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-sm)] px-2 py-1 text-[var(--text-primary)] outline-none transition-colors ml-auto block"
                              />
                            ) : (
                              <span className={`px-2 py-1 rounded-[var(--radius-sm)] flex items-center justify-end gap-1.5 ${isMismatch ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]' : 'text-[var(--text-primary)]'}`}>
                                {isMismatch && <AlertTriangle className="w-3.5 h-3.5" />}
                                {line.done_qty ?? 0}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={(v) => setShowCancelDialog(v)}
        title="Cancel Operation?"
        description="Are you sure you want to cancel this operation? This action cannot be undone."
        confirmLabel="Yes, Cancel Operation"
        cancelLabel="Keep Operation"
        onConfirm={async () => {
          await handleAction(cancelMutation.mutateAsync, 'Operation canceled');
          setShowCancelDialog(false);
        }}
        danger={true}
      />
      
      <ConfirmDialog
        open={showValidateDialog}
        onOpenChange={(v) => setShowValidateDialog(v)}
        title="Validate Operation?"
        description="Validating this operation will permanently update stock ledgers and product balances. Please ensure physical counts are accurate."
        confirmLabel="Validate & Execute"
        cancelLabel="Cancel"
        onConfirm={async () => {
          await handleAction(validateMutation.mutateAsync, 'Operation validated successfully');
          setShowValidateDialog(false);
        }}
      />
    </div>
  );
}
