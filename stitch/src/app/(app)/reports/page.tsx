"use client";

import { trpc } from "@/lib/trpc";
import { BarChart2, Download, TrendingUp, TrendingDown, Package, Clock } from "lucide-react";

export default function ReportsPage() {
  const { data: kpis, isLoading } = trpc.dashboard.kpis.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Insights / Reports</p>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">Comprehensive view of your inventory movement and performance.</p>
        </div>
        <button className="bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Package className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-medium text-gray-900">Total Valuation</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                $1,245k <span className="text-sm font-medium text-green-600 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> +12%</span>
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-100 p-5">
               <div className="flex items-center gap-2 text-gray-500 mb-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-medium text-gray-900">Turnover Rate</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                4.2x <span className="text-sm font-medium text-red-500 flex items-center"><TrendingDown className="w-3 h-3 mr-0.5" /> -0.8</span>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
               <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-medium text-gray-900">Avg. Fulfillment</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                1.4 days <span className="text-sm font-medium text-green-600 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> 15%</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
               <h2 className="text-sm font-semibold text-gray-900">Recent Movement Summary</h2>
               <p className="text-xs text-gray-500">Summary of recent inventory transactions derived from ledger logic.</p>
            </div>
            {/* Placeholder Chart/Table */}
            <div className="p-8 flex items-center justify-center bg-gray-50/50">
               <div className="text-center space-y-3">
                 <BarChart2 className="w-12 h-12 text-gray-300 mx-auto" />
                 <p className="text-sm text-gray-500 font-medium">Data visualization module resolving...</p>
                 <p className="text-xs text-gray-400 max-w-sm">
                   Historical transaction plotting will be enabled once enough movement data has been generated through the Receipts and Deliveries pipelines.
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
