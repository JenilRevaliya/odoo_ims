import { format, parseISO } from 'date-fns';
import { Hexagon } from 'lucide-react';
import { Operation } from '@/types';
import { useLocations } from '@/hooks/useWarehouses';

interface OperationReceiptProps {
  operation: Operation;
}

export default function OperationReceipt({ operation }: OperationReceiptProps) {
  const { data: locationsData } = useLocations();
  const locations = locationsData?.data || [];
  
  const getLocName = (id: string | null, fallback: string) => {
    if (!id) return fallback;
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : id;
  };
  return (
    <div className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto text-sm w-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-slate-800">
        <div className="flex items-center gap-3">
          <Hexagon className="w-10 h-10 text-slate-800" strokeWidth={1.5} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">CoreInventory</h1>
            <p className="text-slate-500 text-xs">Professional Supply Chain Solutions</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest">
            {operation.type === 'receipt' ? 'Receipt Note' : 
             operation.type === 'delivery' ? 'Delivery Note' : 
             operation.type === 'transfer' ? 'Transfer Order' : 'Inventory Adj'}
          </h2>
          <p className="font-mono text-slate-900 font-semibold mt-1">
            {operation.reference_number || operation.id.split('-')[0].toUpperCase()}
          </p>
        </div>
      </div>

      {/* Meta Details */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operation Details</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-slate-500 w-24">Date:</td>
                <td className="py-1 font-medium">{format(parseISO(operation.created_at), 'MMMM do, yyyy - HH:mm')}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500">Status:</td>
                <td className="py-1 font-medium capitalize">{operation.status}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500">Created By:</td>
                <td className="py-1 font-medium">{operation.created_by}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Routing</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-slate-500 w-24">Source:</td>
                <td className="py-1 font-medium">{getLocName(operation.source_location_id, 'External Supplier')}</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500">Destination:</td>
                <td className="py-1 font-medium">{getLocName(operation.dest_location_id, 'External Customer')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lines Table */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Product Lines</h3>
      <table className="w-full text-sm mb-12 border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-slate-700 w-12 border border-slate-200">#</th>
            <th className="py-3 px-4 text-left font-semibold text-slate-700 border border-slate-200">Product Details</th>
            <th className="py-3 px-4 text-right font-semibold text-slate-700 w-24 border border-slate-200">Expected</th>
            <th className="py-3 px-4 text-right font-semibold text-slate-700 w-24 border border-slate-200">Done</th>
          </tr>
        </thead>
        <tbody>
          {operation.lines?.map((line, idx) => (
            <tr key={line.id}>
              <td className="py-3 px-4 text-center text-slate-500 border border-slate-200">{idx + 1}</td>
              <td className="py-3 px-4 border border-slate-200">
                <div className="font-semibold text-slate-900">{line.product_name}</div>
                <div className="font-mono text-xs text-slate-500 mt-0.5">{line.sku}</div>
              </td>
              <td className="py-3 px-4 text-right font-mono border border-slate-200">{line.expected_qty}</td>
              <td className="py-3 px-4 text-right font-mono font-semibold border border-slate-200">{line.done_qty || 0}</td>
            </tr>
          ))}
          {(!operation.lines || operation.lines.length === 0) && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-500 italic border border-slate-200">
                No products found in this operation.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Internal Notes */}
      {operation.notes && (
        <div className="mb-12">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks / Notes</h3>
          <div className="bg-slate-50 p-4 border border-slate-200 text-slate-700 italic">
            {operation.notes}
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-20 pt-8 flex justify-between px-8">
        <div className="w-48 text-center hidden print:block">
          <div className="border-b border-slate-400 h-16 mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Prepared By</p>
        </div>
        
        <div className="w-48 text-center hidden print:block">
          <div className="border-b border-slate-400 h-16 mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Verified / Authorized By</p>
        </div>

        <div className="w-48 text-center hidden print:block">
          <div className="border-b border-slate-400 h-16 mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Carrier / Receiver</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center text-xs text-slate-400">
        Generated on {format(new Date(), 'MMMM do, yyyy - HH:mm')} by CoreInventory System
      </div>
    </div>
  );
}
