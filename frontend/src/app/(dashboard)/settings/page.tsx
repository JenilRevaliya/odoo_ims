'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWarehouses, useCreateWarehouse } from '@/hooks/useWarehouses';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toast';
import { MapPin, Building, ShieldCheck, Settings2, Plus, Loader2 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Modal from '@/components/ui/Modal';
import { format, parseISO } from 'date-fns';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const { data: warehousesData, isLoading } = useWarehouses();
  const warehouses = warehousesData?.data || [];

  const [activeTab, setActiveTab] = useState<'warehouses' | 'permissions' | 'config'>('warehouses');
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">System Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Manage warehouse facilities, access roles, and global configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-56 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('warehouses')}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'warehouses' ? 'bg-[var(--accent)]/10 text-[var(--accent)] rounded-[var(--radius-md)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)]'}`}
          >
            <Building className="w-4 h-4" /> Warehouses
          </button>
          
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'permissions' ? 'bg-[var(--accent)]/10 text-[var(--accent)] rounded-[var(--radius-md)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)]'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Access & Roles
          </button>
          
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'config' ? 'bg-[var(--accent)]/10 text-[var(--accent)] rounded-[var(--radius-md)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)]'}`}
          >
            <Settings2 className="w-4 h-4" /> Global Config
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          
          {activeTab === 'warehouses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">Warehouse Facilities</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage physical locations and storage zones.</p>
                </div>
                {isManager && (
                  <button 
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-glow)] text-[var(--text-on-accent)] px-4 py-2 rounded-[var(--radius-md)] transition-colors text-sm font-medium shrink-0 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> New Warehouse
                  </button>
                )}
              </div>
              
              {isLoading ? (
                <LoadingSkeleton variant="table-row" count={5} />
              ) : (
                <DataTable
                  data={warehouses}
                  columns={[
                    { header: 'Facility Name', accessor: 'name' },
                    { 
                      header: 'Created', 
                      accessor: (r) => <span className="text-[var(--text-secondary)]">{format(parseISO(r.created_at), 'MMM d, yyyy')}</span>,
                      className: 'hidden md:table-cell w-[160px]'
                    },
                    { 
                      header: 'Address', 
                      accessor: (r) => <span className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate max-w-[200px]"><MapPin className="w-3.5 h-3.5 shrink-0"/> {r.address || 'No address set'}</span>, 
                      className: 'hidden sm:table-cell' 
                    },
                  ]}
                  keyExtractor={(r) => r.id}
                  onRowClick={(r) => router.push(`/settings/warehouses/${r.id}`)}
                  emptyMessage="No warehouses configured."
                />
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-8 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Access Management</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Role-based access control and user permission management will be available in the next platform update.
              </p>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-8 text-center space-y-3">
              <Settings2 className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <h3 className="text-lg font-medium text-[var(--text-primary)]">System Configuration</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Advanced system parameters, API key generation, and webhook configurations are locked for your current plan.
              </p>
            </div>
          )}

        </div>
      </div>

      <NewWarehouseModal open={showNewModal} onOpenChange={setShowNewModal} />
      
    </div>
  );
}

function NewWarehouseModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const createMutation = useCreateWarehouse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Warehouse name is required');
      return;
    }

    try {
      await createMutation.mutateAsync({ name, address: address || null });
      toast.success('Warehouse Created', `${name} has been added to the system.`);
      onOpenChange(false);
      setName('');
      setAddress('');
      setError('');
    } catch {
      toast.error('Error', 'Failed to create warehouse facility.');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Create New Warehouse">
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="wh-name" className="text-sm font-medium text-[var(--text-primary)]">Facility Name *</label>
          <input 
            id="wh-name"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Main Distribution Center"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors"
          />
          {error && <p className="text-xs text-[var(--status-danger)] mt-1">{error}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="wh-addr" className="text-sm font-medium text-[var(--text-primary)]">Address</label>
          <textarea 
            id="wh-addr"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Complete physical address..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors resize-none h-20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-md)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-[var(--text-on-accent)] bg-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] transition-colors shadow-sm disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {createMutation.isPending ? 'Saving...' : 'Create Warehouse'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
