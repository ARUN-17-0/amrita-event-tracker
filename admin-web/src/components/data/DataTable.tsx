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
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  searchable,
  searchValue = '',
  onSearchChange,
  emptyMessage = 'No records found.',
  loading = false,
  actions,
}: DataTableProps<T>) {
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
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div>
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
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-text-primary">
                      {col.render ? col.render(item) : String((item as any)[col.key])}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm text-right" onClick={(e) => e.stopPropagation()}>
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
