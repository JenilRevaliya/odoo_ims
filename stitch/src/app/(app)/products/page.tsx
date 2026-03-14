"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

function stockStatus(qty: number, min?: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty === 0) return "out_of_stock";
  if (min && qty < min) return "low_stock";
  return "in_stock";
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.products.list.useQuery({ search, page, pageSize: 20 });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Inventory / Products</p>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <Link href="/products/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Add Product</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or SKU..." className="pl-9 h-9"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              {["SKU","Product Name","Category","UoM","Total Stock","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : !data?.items.length ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products found</td></tr>
            ) : data.items.map(p => {
              const totalQty = p.stockPerLocation.reduce((s, sl) => s + (sl.quantityOnHand ?? 0), 0);
              const minQty = p.reorderRules[0]?.minQuantity;
              const st = stockStatus(totalQty, minQty);
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.uom}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{totalQty.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusPill status={st} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">View</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{data?.total?.toLocaleString() ?? "—"} products</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={(data?.items.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
