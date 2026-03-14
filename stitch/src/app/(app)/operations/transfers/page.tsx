"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Plus, Search, Eye } from "lucide-react";
import Link from "next/link";

export default function TransfersPage() {
  const [status, setStatus] = useState<any>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.transfers.list.useQuery({ status, page, pageSize: 20 });
  const validate = trpc.transfers.validate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Logistics / Transfers</p>
          <h1 className="text-2xl font-bold text-gray-900">Internal Transfers</h1>
        </div>
        <Link href="/operations/transfers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />New Transfer</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <select value={status ?? ""} onChange={e => setStatus(e.target.value || undefined)}
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700">
          <option value="">All Status</option>
          {["draft","ready","done","canceled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {["Reference","From","To","Date","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No transfers found</td></tr>
            ) : data.items.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{t.reference}</td>
                <td className="px-4 py-3 text-gray-700">{t.sourceLocation?.warehouse?.name} / {t.sourceLocation?.name}</td>
                <td className="px-4 py-3 text-gray-700">{t.destinationLocation?.warehouse?.name} / {t.destinationLocation?.name}</td>
                <td className="px-4 py-3 text-gray-500">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={t.status as any} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/operations/transfers/${t.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                    </Link>
                    {t.status === "ready" && (
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => validate.mutate({ id: t.id })}>Validate</Button>
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
