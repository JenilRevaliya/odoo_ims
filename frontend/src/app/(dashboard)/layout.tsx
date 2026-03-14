import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-base)]">
      {/* Desktop Sidebar container */}
      <div className="hidden lg:block lg:w-[240px] shrink-0 pointer-events-auto z-40 relative border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <Sidebar />
      </div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen pb-[60px] lg:pb-0 relative">
        <Header />

        <div className="flex-1 p-4 md:p-6 mx-auto w-full max-w-[1240px] transition-all duration-300 ease-[var(--ease-out)] animate-in fade-in slide-in-from-bottom-2">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
