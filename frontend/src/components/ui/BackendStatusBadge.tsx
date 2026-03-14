import React, { useEffect } from 'react';
import { useBackendStore } from '@/store/backend';
import { Database, Zap, RefreshCw } from 'lucide-react';

export default function BackendStatusBadge() {
  const { isOnline, isMockMode, toggleMockMode, setOnlineStatus } = useBackendStore();

  const handlePingBackend = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('[StatusCheck] Pinging:', apiUrl + '/health');
      
      if (!apiUrl) {
        console.error('[StatusCheck] NEXT_PUBLIC_API_URL is undefined');
        return;
      }
      
      const res = await fetch(apiUrl + '/health', { 
        cache: 'no-store',
        mode: 'cors' 
      });
      
      if (res.ok) {
        console.log('[StatusCheck] Backend Online');
        setOnlineStatus(true);
      } else {
        console.warn('[StatusCheck] Backend returned status:', res.status);
        setOnlineStatus(false);
      }
    } catch (err) {
      console.error('[StatusCheck] Connection failed:', err);
      setOnlineStatus(false);
    }
  };

  useEffect(() => {
    handlePingBackend();
    // Re-check every 30 seconds
    const interval = setInterval(handlePingBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div 
        onClick={handlePingBackend}
        className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)] transition-colors group"
      >
        <span className="relative flex h-2 w-2">
          {isOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-danger)]"></span>
          )}
        </span>
        <span className="hidden sm:inline-block">{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      <button
        onClick={toggleMockMode}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] border text-xs font-medium transition-colors ${
          isMockMode 
            ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' 
            : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'
        }`}
      >
        {isMockMode ? <Zap className="w-3.5 h-3.5 fill-current" /> : <Database className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline-block">{isMockMode ? 'Mock Data' : 'Live Data'}</span>
      </button>
    </div>
  );
}
