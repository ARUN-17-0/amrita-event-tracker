import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLog, TableColumn } from '@/types';
import { Clock, User } from 'lucide-react';

export function AuditLogsPage() {
  const { logs, loading } = useAuditLogs();
  
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const filteredLogs = logs.filter(l => 
    (l.actorName.toLowerCase().includes(search.toLowerCase()) || 
     l.details.toLowerCase().includes(search.toLowerCase())) &&
    (filterAction ? l.action === filterAction : true)
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-100 text-green-800';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-100 text-red-800';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const columns: TableColumn<AuditLog>[] = [
    { 
      key: 'timestamp', 
      label: 'Date & Time',
      render: (l) => (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          {l.createdAt.toLocaleString()}
        </div>
      )
    },
    { 
      key: 'actor', 
      label: 'Actor',
      render: (l) => (
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
            <User className="w-3 h-3 text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-900">{l.actorName}</span>
        </div>
      )
    },
    { 
      key: 'action', 
      label: 'Action',
      render: (l) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getActionColor(l.action)}`}>
          {l.action}
        </span>
      )
    },
    { key: 'targetType', label: 'Resource', sortable: true },
    { 
      key: 'details', 
      label: 'Details',
      render: (l) => <span className="text-sm text-gray-600 truncate max-w-xs block">{l.details}</span>
    }
  ];

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track system activity and administrator actions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by user or details..." />
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={filterAction} 
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filteredLogs} loading={loading} emptyMessage="No audit logs found matching criteria." />
      </div>
    </AdminLayout>
  );
}
