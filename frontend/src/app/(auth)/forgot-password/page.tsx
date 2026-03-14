'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Actually hit API and redirect or show success UI, then go to /reset-password
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border-subtle)]">
          <Hexagon className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-xl text-[var(--text-primary)] font-medium">CoreInventory</h1>
        </div>

        {!submitted ? (
          <>
            <div className="mb-8">
              <h2 className="text-[var(--text-lg)] font-medium text-[var(--text-primary)]">Reset Password</h2>
              <p className="text-[var(--text-secondary)] text-[var(--text-sm)] mt-2">Enter your email and we'll send a code to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button 
                type="submit" 
                className="w-full bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] transition-colors rounded-[var(--radius-md)] py-3 px-4 font-medium text-sm shadow-[var(--shadow-sm)] uppercase tracking-wider mt-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
              >
                Send Reset Code
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <h2 className="text-[var(--text-lg)] font-medium text-[var(--text-primary)] mb-2">Check your email</h2>
            <p className="text-[var(--text-secondary)] text-[var(--text-sm)]">We have sent a 6-digit verification code to {email}</p>
            <button 
              onClick={() => router.push('/reset-password')}
              className="mt-6 text-[var(--accent)] hover:underline font-medium text-sm"
            >
              I have the code
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/login')} className="flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors w-full">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </button>
        </div>
      </div>
    </main>
  );
}
