"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye } from "lucide-react";
import Link from "next/link";

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<any>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = trpc.receipts.list.useQuery({ search, status, page, pageSize: 20 });
  const updateStatus = trpc.receipts.updateStatus.useMutation({ onSuccess: () => refetch() });
  const validate = trpc.receipts.validate.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Logistics / Receipts</p>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
        </div>
        <Link href="/operations/receipts/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Create Receipt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search receipts..." className="pl-9 h-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={status ?? ""} onChange={e => setStatus(e.target.value || undefined)}
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
          <option value="">All Status</option>
          {["draft","waiting","ready","done","canceled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {["Reference","Supplier","Destination","Scheduled Date","Status","Created By","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No receipts found</td></tr>
            ) : data.items.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{r.reference}</td>
                <td className="px-4 py-3 text-gray-700">{r.supplierName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{r.sourceLocation?.name ?? "Vendor"}</td>
                <td className="px-4 py-3 text-gray-500">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={r.status as any} /></td>
                <td className="px-4 py-3 text-gray-500">{r.createdBy?.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/operations/receipts/${r.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                    </Link>
                    {r.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => updateStatus.mutate({ id: r.id, status: "waiting" })}>
                        Confirm
                      </Button>
                    )}
                    {r.status === "waiting" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => updateStatus.mutate({ id: r.id, status: "ready" })}>
                        Set Ready
                      </Button>
                    )}
                    {r.status === "ready" && (
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => validate.mutate({ id: r.id })}>
                        Validate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {data && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {data.page}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
