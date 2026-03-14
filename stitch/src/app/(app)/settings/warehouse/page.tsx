"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Warehouse, Plus, MapPin } from "lucide-react";

export default function WarehouseSettingsPage() {
  const { data: warehouses, isLoading, refetch } = trpc.warehouses.list.useQuery();
  const createWh = trpc.warehouses.create.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Settings / Warehouses</p>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Settings</h1>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => {
          const name = prompt("Warehouse name:");
          const shortCode = prompt("Short code (e.g. WH-NY):");
          if (name && shortCode) createWh.mutate({ name, shortCode });
        }}>
          <Plus className="w-4 h-4" />New Warehouse
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid gap-4">
          {warehouses?.map(wh => (
            <div key={wh.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Warehouse className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{wh.name}</h2>
                    <p className="text-xs text-gray-500 font-mono">{wh.shortCode}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                  wh.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                }`}>{wh.isActive ? "ACTIVE" : "INACTIVE"}</span>
              </div>

              {wh.address && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5" />{wh.address}
                </p>
              )}

              {/* Locations */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Storage Locations</p>
                <div className="grid grid-cols-3 gap-2">
                  {wh.locations.map(loc => (
                    <div key={loc.id} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                      {loc.code && <p className="text-xs text-gray-400 font-mono">{loc.code}</p>}
                    </div>
                  ))}
                  <button
                    className="bg-gray-50 rounded-lg p-2.5 border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm flex items-center gap-1.5"
                    onClick={() => {
                      const name = prompt(`Add location to ${wh.name}:`);
                      const code = prompt("Location code (optional):");
                      if (name) trpc.warehouses.addLocation.useMutation().mutate({ warehouseId: wh.id, name, code: code || undefined });
                    }}>
                    <Plus className="w-4 h-4" />Add Location
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
