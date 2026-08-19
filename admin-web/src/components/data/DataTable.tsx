import React from 'react';
import { SearchBar } from './SearchBar';
import { TableColumn } from '@/types';

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
  loading?: boolean;
  actions?: (item: T) => React.ReactNode;
  rowKey?: (item: T) => string;
}

// T just needs to be an object — no id constraint required
export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  searchable,
  searchValue = '',
  onSearchChange,
  emptyMessage = 'No records found.',
  loading = false,
  actions,
  rowKey,
}: DataTableProps<T>) {
  const getKey = (item: T, index: number): string => {
    if (rowKey) return rowKey(item);
    // Try common id fields
    const anyItem = item as any;
    return anyItem.uid ?? anyItem.id ?? String(index);
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
      {searchable && onSearchChange && (
        <div className="p-4 border-b border-border">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search..."
          />
        </div>
      )}

      {/* Horizontally scrollable on mobile */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full text-left border-collapse" style={{ minWidth: '500px' }}>
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-8 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={getKey(item, index)}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-sm text-text-primary">
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-sm text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
