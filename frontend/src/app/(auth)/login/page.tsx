'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate API
    router.push('/dashboard');
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

          <button 
            type="submit" 
            className="w-full bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] transition-colors rounded-[var(--radius-md)] py-3 px-4 font-medium text-sm shadow-[var(--shadow-sm)] uppercase tracking-wider mt-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/forgot-password')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
            Forgot password?
          </button>
        </div>
      </div>
    </main>
  );
}
