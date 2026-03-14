'use client';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--bg-surface)] border-l-[3px] border-[var(--accent)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)]">
            <h3 className="text-[var(--text-secondary)] text-sm mb-2">Metric {i}</h3>
            <p className="text-3xl font-mono text-[var(--text-primary)]">--</p>
          </div>
        ))}
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 h-[400px] shadow-[var(--shadow-md)]">
        <h2 className="text-[var(--text-primary)] font-medium mb-4">Recent Operations Placeholder</h2>
        <div className="text-[var(--text-muted)] mt-10 text-center text-sm">Waiting for Phase 2 data integration</div>
      </div>
    </div>
  );
}
