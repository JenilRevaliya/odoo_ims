import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string; // e.g. w-[200px] or hidden md:table-cell
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyComponent?: React.ReactNode;
}

export default function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick, 
  emptyMessage = "No items found.",
  emptyComponent
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-4">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={`py-3 px-4 text-xs font-medium uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center text-[var(--text-muted)] text-sm">
                {emptyComponent || emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-[var(--border-subtle)] last:border-0 transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-[var(--bg-hover)]' : ''}
                `}
              >
                {columns.map((col, i) => (
                  <td key={i} className={`py-3 px-4 text-sm text-[var(--text-primary)] ${col.className || ''}`}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
