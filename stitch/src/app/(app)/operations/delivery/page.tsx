"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye } from "lucide-react";
import Link from "next/link";

export default function DeliveriesPage() {
  const [status, setStatus] = useState<any>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.deliveries.list.useQuery({ status, page, pageSize: 20 });
  const updateStatus = trpc.deliveries.updateStatus.useMutation({ onSuccess: () => refetch() });
  const validate = trpc.deliveries.validate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Logistics / Deliveries</p>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Orders</h1>
        </div>
        <Link href="/operations/delivery/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />New Delivery</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
        <select value={status ?? ""} onChange={e => setStatus(e.target.value || undefined)}
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700">
          <option value="">All Status</option>
          {["draft","waiting","ready","done","canceled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {["Reference","Customer","Departure","Scheduled","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No deliveries found</td></tr>
            ) : data.items.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{d.reference}</td>
                <td className="px-4 py-3 text-gray-700">{d.customerName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{d.sourceLocation?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={d.status as any} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/operations/delivery/${d.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                    </Link>
                    {d.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => updateStatus.mutate({ id: d.id, status: "waiting" })}>Pick</Button>
                    )}
                    {d.status === "waiting" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => updateStatus.mutate({ id: d.id, status: "ready" })}>Pack</Button>
                    )}
                    {d.status === "ready" && (
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => validate.mutate({ id: d.id })}>Dispatch</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Page {data?.page}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={(data?.items.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
