"use client";

import { trpc } from "@/lib/trpc";
import { Package, AlertTriangle, AlertCircle, Clock, Truck } from "lucide-react";

function KpiCard({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: kpis, isLoading } = trpc.dashboard.kpis.useQuery(undefined, { refetchInterval: 5000 });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  const k = kpis!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Pages / Dashboard</p>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Overview of your warehouse operations and inventory status.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Package} color="bg-indigo-50 text-indigo-600" label="Total Products" value={k.totalProducts} />
        <KpiCard icon={AlertTriangle} color="bg-amber-50 text-amber-500" label="Low Stock" value={k.lowStock} />
        <KpiCard icon={AlertCircle} color="bg-red-50 text-red-500" label="Out of Stock" value={k.outOfStock} />
        <KpiCard icon={Clock} color="bg-blue-50 text-blue-500" label="Pending Receipts" value={k.pendingReceipts} />
        <KpiCard icon={Truck} color="bg-purple-50 text-purple-500" label="Pending Deliveries" value={k.pendingDeliveries} />
      </div>

      {/* Operations */}
      <div className="grid grid-cols-2 gap-4">
        {/* Receipts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Receipt Operations</h2>
            </div>
            <a href="/operations/receipts" className="text-xs text-indigo-600 hover:underline">View All</a>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-gray-900">{k.receiptOps.toReceive}</p><p className="text-xs text-gray-500 mt-0.5">TO RECEIVE</p></div>
            <div><p className="text-2xl font-bold text-gray-900">{k.receiptOps.inInspection}</p><p className="text-xs text-gray-500 mt-0.5">IN INSPECTION</p></div>
            <div><p className="text-2xl font-bold text-gray-900">{k.receiptOps.completed}</p><p className="text-xs text-gray-500 mt-0.5">COMPLETED</p></div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">+{k.receiptOps.toReceive} New Shipments</span>
          </div>
        </div>

        {/* Deliveries */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Delivery Operations</h2>
            </div>
            <a href="/operations/delivery" className="text-xs text-indigo-600 hover:underline">View All</a>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-gray-900">{k.deliveryOps.picking}</p><p className="text-xs text-gray-500 mt-0.5">PICKING</p></div>
            <div><p className="text-2xl font-bold text-gray-900">{k.deliveryOps.packing}</p><p className="text-xs text-gray-500 mt-0.5">PACKING</p></div>
            <div><p className="text-2xl font-bold text-gray-900">{k.deliveryOps.dispatched}</p><p className="text-xs text-gray-500 mt-0.5">DISPATCHED</p></div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Live data</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" /></svg>
          <h2 className="font-semibold text-sm text-gray-900">Active Filters</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {["DOCUMENT TYPE","STATUS","WAREHOUSE","CATEGORY"].map(f => (
            <div key={f}>
              <p className="text-xs text-gray-500 mb-1">{f}</p>
              <select className="w-full h-9 border border-gray-200 rounded-lg px-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option>All {f.split(" ").map(w => w[0]+w.slice(1).toLowerCase()).join(" ")}s</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div>
            <p className="font-semibold text-indigo-600 text-sm">Warehouse performance is tracking live</p>
            <p className="text-xs text-gray-500">Dashboard KPIs refresh every 5 seconds.</p>
          </div>
        </div>
        <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Download Weekly Report
        </button>
      </div>
    </div>
  );
}
