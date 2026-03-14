import { cn } from "@/lib/utils";

type Status =
  | "draft" | "waiting" | "ready" | "done" | "canceled"
  | "in_stock" | "low_stock" | "out_of_stock"
  | "completed" | "pending" | "in_transit" | "flagged"
  | "optimal" | "reorder_soon" | "urgent_reorder"
  | "active" | "inactive";

const CONFIG: Record<Status, { label: string; className: string }> = {
  draft:         { label: "DRAFT",         className: "bg-gray-100 text-gray-600 border-gray-200" },
  waiting:       { label: "WAITING",       className: "bg-amber-50 text-amber-700 border-amber-200" },
  ready:         { label: "READY",         className: "bg-blue-50 text-blue-700 border-blue-200" },
  done:          { label: "DONE",          className: "bg-green-50 text-green-700 border-green-200" },
  canceled:      { label: "CANCELED",      className: "bg-red-50 text-red-600 border-red-200" },
  in_stock:      { label: "In Stock",      className: "bg-green-50 text-green-700 border-green-200" },
  low_stock:     { label: "Low Stock",     className: "bg-amber-50 text-amber-700 border-amber-200" },
  out_of_stock:  { label: "Out of Stock",  className: "bg-red-50 text-red-600 border-red-200" },
  completed:     { label: "COMPLETED",     className: "bg-green-50 text-green-700 border-green-200" },
  pending:       { label: "PENDING",       className: "bg-amber-50 text-amber-700 border-amber-200" },
  in_transit:    { label: "IN TRANSIT",    className: "bg-blue-50 text-blue-700 border-blue-200" },
  flagged:       { label: "FLAGGED",       className: "bg-red-50 text-red-600 border-red-200" },
  optimal:       { label: "Optimal",       className: "bg-green-50 text-green-700 border-green-200" },
  reorder_soon:  { label: "Reorder Soon",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  urgent_reorder:{ label: "Urgent Reorder",className: "bg-red-50 text-red-600 border-red-200" },
  active:        { label: "ACTIVE",        className: "bg-green-50 text-green-700 border-green-200" },
  inactive:      { label: "INACTIVE",      className: "bg-gray-100 text-gray-500 border-gray-200" },
};

interface StatusPillProps {
  status: Status;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const cfg = CONFIG[status] ?? { label: status.toUpperCase(), className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
      cfg.className, className
    )}>
      {cfg.label}
    </span>
  );
}
