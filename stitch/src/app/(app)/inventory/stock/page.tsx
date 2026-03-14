"use client";

import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { BarChart2 } from "lucide-react";

function stockStatus(qty: number, min?: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty === 0) return "out_of_stock";
  if (min && qty < min) return "low_stock";
  return "in_stock";
}

export default function StockViewPage() {
  const { data, isLoading } = trpc.products.list.useQuery({ pageSize: 100 });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-500">Inventory / Stock</p>
        <h1 className="text-2xl font-bold text-gray-900">Stock View</h1>
        <p className="text-gray-500 text-sm">Real-time stock levels across all locations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : (
        <div className="space-y-3">
          {data?.items.map(p => {
            const min = p.reorderRules[0]?.minQuantity;
            const max = p.reorderRules[0]?.maxQuantity;
            const totalQty = p.stockPerLocation.reduce((s, sl) => s + sl.quantityOnHand, 0);
            const pct = max ? Math.min(100, Math.round((totalQty / max) * 100)) : null;
            const st = stockStatus(totalQty, min);

            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.sku} · {p.uom}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">{totalQty.toLocaleString()}</span>
                    <StatusPill status={st} />
                  </div>
                </div>

                {/* Progress bar */}
                {pct !== null && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Min: {min}</span>
                      <span className={`font-semibold ${pct < 30 ? "text-red-500" : pct < 60 ? "text-amber-500" : "text-green-600"}`}>{pct}%</span>
                      <span>Max: {max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct < 30 ? "bg-red-400" : pct < 60 ? "bg-amber-400" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Per-location breakdown */}
                <div className="flex flex-wrap gap-2">
                  {p.stockPerLocation.map(sl => (
                    <div key={`${sl.productId}-${sl.locationId}`}
                      className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-gray-500">{sl.location?.warehouse?.name} / {sl.location?.name}:</span>
                      <span className="font-semibold text-gray-900">{sl.quantityOnHand}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
