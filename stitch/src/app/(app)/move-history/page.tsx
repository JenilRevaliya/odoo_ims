"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Input } from "@/components/ui/input";
import { History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const OP_ICONS: Record<string, string> = {
  receipt: "↑", delivery: "↓", transfer: "⇄", adjustment: "±",
};
const OP_COLOR: Record<string, string> = {
  receipt: "text-green-600", delivery: "text-red-500", transfer: "text-blue-500", adjustment: "text-amber-500",
};

export default function MoveHistoryPage() {
  const [opType, setOpType] = useState<any>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.ledger.list.useQuery({ operationType: opType, page, pageSize: 20 });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-500">Insights / Move History</p>
        <h1 className="text-2xl font-bold text-gray-900">Move History</h1>
        <p className="text-gray-500 text-sm">Immutable audit ledger — all stock movements recorded.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 flex-wrap">
        <select value={opType ?? ""} onChange={e => setOpType(e.target.value || undefined)}
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700">
          <option value="">All Operations</option>
          <option value="receipt">Receipts</option>
          <option value="delivery">Deliveries</option>
          <option value="transfer">Transfers</option>
          <option value="adjustment">Adjustments</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {["Date","Operation","Reference","Product","SKU","Location","Delta","User"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No movements recorded yet
              </td></tr>
            ) : data.items.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${OP_COLOR[e.operationType] ?? ""}`}>
                    {OP_ICONS[e.operationType]} {e.operationType.charAt(0).toUpperCase()+e.operationType.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{e.documentReference}</td>
                <td className="px-4 py-3 text-gray-900">{e.product?.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{e.product?.sku}</td>
                <td className="px-4 py-3 text-gray-500">{e.location?.warehouse?.name} / {e.location?.name}</td>
                <td className={`px-4 py-3 font-bold ${e.quantityDelta > 0 ? "text-green-600" : "text-red-500"}`}>
                  {e.quantityDelta > 0 ? "+" : ""}{e.quantityDelta}
                </td>
                <td className="px-4 py-3 text-gray-500">{e.user?.name}</td>
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
