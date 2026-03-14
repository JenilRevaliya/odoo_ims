'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const setAuth = useAuthStore(state => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await login.mutateAsync({ email, password }) as any;
      if (res?.data?.data) {
        const token = res.data.data.accessToken || res.data.data.access_token;
        setAuth(token, res.data.data.user);
        router.push('/dashboard');
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.error?.message || 'Invalid credentials');
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
          <h2 className="text-[var(--text-lg)] font-medium text-[var(--text-primary)]">Welcome back</h2>
          <p className="text-[var(--text-secondary)] text-[var(--text-sm)]">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
            disabled={login.isPending}
            className="w-full bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] transition-colors rounded-[var(--radius-md)] py-3 px-4 font-medium text-sm shadow-[var(--shadow-sm)] tracking-wider mt-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => router.push('/forgot-password')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-4">
            Forgot password?
          </button>
          <span className="text-[var(--border)] mr-4">|</span>
          <button onClick={() => router.push('/signup')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
}
