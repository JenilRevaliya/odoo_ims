'use client';

import { useState } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toast';
import { User, Mail, Shield, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function ProfilePage() {
  const { data: profileData, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { resetPassword } = useAuth();
  
  const user = profileData?.data;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Hydrate forms on mount
  if (user && !name && !email) {
    setName(user.name);
    setEmail(user.email);
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    
    try {
      await updateMutation.mutateAsync({ name });
      toast.success('Success', 'Profile updated successfully.');
      setNameError('');
    } catch {
      toast.error('Error', 'Failed to update profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }

    try {
      // In a real app the endpoint might differ, mapping to auth hook logic here
      await resetPassword.mutateAsync({ 
        current_password: currentPassword, 
        password: newPassword, 
        password_confirmation: confirmPassword 
      });
      toast.success('Success', 'Password changed successfully. Please logic again if prompted.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.error?.message || 'Failed to update password';
      setPwdError(msg);
      toast.error('Error', msg);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        <LoadingSkeleton variant="product-card" />
        <LoadingSkeleton variant="product-card" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Your Profile</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-8 shadow-sm">
        <div className="flex items-start sm:items-center gap-6 pb-8 border-b border-[var(--border-subtle)]">
          <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-2xl font-medium shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-[var(--text-primary)]">{user?.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4"/> <span className="capitalize">{user?.role}</span> account</span>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <form className="space-y-6" onSubmit={handleUpdateProfile}>
            <div className="space-y-2">
              <label htmlFor="fullname" className="text-sm font-medium text-[var(--text-primary)]">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  id="fullname"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError(''); }}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors max-w-sm"
                />
              </div>
              {nameError && <p className="text-xs text-[var(--status-danger)] mt-1">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-[var(--text-secondary)] text-sm outline-none opacity-60 cursor-not-allowed max-w-sm"
                  title="Contact system administrator to change email."
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]"/> Verified
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={name === user?.name || updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[var(--bg)] bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-8 shadow-sm">
        <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2 mb-6">
          <KeyRound className="w-5 h-5 text-[var(--accent)]" /> Security
        </h2>

        <form className="space-y-5 max-w-sm" onSubmit={handleUpdatePassword}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Current Password</label>
            <input 
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">New Password</label>
            <input 
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Confirm New Password</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
            />
          </div>

          {pwdError && <p className="text-xs font-medium text-[var(--status-danger)] bg-[var(--status-danger)]/10 p-2 rounded">{pwdError}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={resetPassword.isPending || (!currentPassword && !newPassword && !confirmPassword)}
              className="flex items-center px-5 py-2 text-sm font-medium text-[var(--text-on-accent)] bg-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] transition-colors shadow-sm disabled:opacity-50"
            >
              {resetPassword.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
