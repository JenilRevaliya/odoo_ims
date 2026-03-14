'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signup.mutateAsync({ name, email, password });
      router.push('/login');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.error?.message || 'Failed to create account');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-subtle)]">
          <Hexagon className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-xl text-[var(--text-primary)] font-medium">CoreInventory</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-[var(--text-lg)] font-medium text-[var(--text-primary)]">Create an account</h2>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] text-sm outline-none transition-colors"
              required 
            />
          </div>

          <div>
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-primary)] text-sm outline-none transition-colors"
              required 
            />
          </div>
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-3 pr-12 text-[var(--text-primary)] text-sm outline-none transition-colors" 
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-[var(--status-danger)]/10 text-[var(--status-danger)] px-4 py-3 rounded-[var(--radius-md)] text-sm mb-4 border border-[var(--status-danger)]/20">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={signup.isPending}
            className="w-full bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] transition-colors rounded-[var(--radius-md)] py-3 px-4 font-medium text-sm shadow-[var(--shadow-sm)] tracking-wider mt-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {signup.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SIGN UP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/login')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </main>
  );
}
