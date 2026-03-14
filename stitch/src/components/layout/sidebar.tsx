"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Receipt, Truck, ArrowLeftRight,
  BarChart2, Settings, Warehouse, ClipboardList, History,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Inventory", icon: Package },
  { href: "/operations/receipts", label: "Receipts", icon: Receipt, group: "LOGISTICS" },
  { href: "/operations/delivery", label: "Deliveries", icon: Truck, group: "LOGISTICS" },
  { href: "/operations/transfers", label: "Transfers", icon: ArrowLeftRight, group: "LOGISTICS" },
  { href: "/inventory/stock", label: "Stock View", icon: ClipboardList, group: "INSIGHTS" },
  { href: "/move-history", label: "Move History", icon: History, group: "INSIGHTS" },
  { href: "/reports", label: "Reports", icon: BarChart2, group: "INSIGHTS" },
  { href: "/settings/warehouse", label: "Warehouses", icon: Warehouse },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const grouped = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    const g = item.group ?? "MAIN";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <aside className="w-56 shrink-0 bg-[#0F1117] text-gray-300 flex flex-col h-screen sticky top-0 border-r border-gray-800">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Package className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">CoreInventory</p>
          <p className="text-gray-500 text-xs">
            {session?.user?.role === "manager" ? "Admin Panel" : "Enterprise IMS"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            {group !== "MAIN" && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1.5">{group}</p>
            )}
            {items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-800 text-gray-400 hover:text-white"
                  )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      {session?.user && (
        <div className="border-t border-gray-800 p-3 flex items-center gap-2">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-indigo-600 text-white text-xs">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{session.user.name}</p>
            <p className="text-gray-500 text-xs capitalize">{session.user.role}</p>
          </div>
          <button onClick={() => signOut()} className="text-gray-500 hover:text-white transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
