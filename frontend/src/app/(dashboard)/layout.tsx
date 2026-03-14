import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-base)]">
      {/* Desktop Sidebar container */}
      <div className="hidden lg:block lg:w-[240px] shrink-0 pointer-events-auto z-40 relative border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <Sidebar wrapperForLayout />
      </div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen pb-[60px] lg:pb-0 relative">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center shrink-0 px-4 md:px-6 sticky top-0 z-30 shadow-[var(--shadow-sm)]">
          <div className="flex-1">
            <h1 className="text-xl text-[var(--text-primary)] font-medium font-mono uppercase tracking-wider">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-sm font-medium border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">RJ</div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 mx-auto w-full max-w-[1200px] transition-all duration-300 ease-[var(--ease-out)] animate-in fade-in slide-in-from-bottom-2">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
