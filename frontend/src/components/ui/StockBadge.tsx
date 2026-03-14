import { Package, AlertTriangle, AlertCircle } from 'lucide-react';

interface StockBadgeProps {
  quantity: number;
  minimum: number;
  unit?: string;
}

export default function StockBadge({ quantity, minimum, unit = 'pcs' }: StockBadgeProps) {
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  if (quantity === 0) {
    status = 'critical';
  } else if (quantity > 0 && quantity <= minimum) {
    status = 'warning';
  }

  const icons = {
    healthy: <Package className="w-3.5 h-3.5 shrink-0" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    critical: <AlertCircle className="w-3.5 h-3.5 shrink-0" />
  };

  const styles = {
    healthy: 'text-[#3FB950] bg-[#3FB950]/10 border-[#3FB950]/20',
    warning: 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20',
    critical: 'text-[var(--status-danger)] bg-[var(--status-danger)]/10 border-[var(--status-danger)]/20'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] border ${styles[status]} font-medium text-xs whitespace-nowrap`} 
      aria-label={`Stock: ${quantity} ${unit}, ${status}`}
    >
      {icons[status]}
      <span>{quantity.toLocaleString()} {unit}</span>
    </div>
  );
}
