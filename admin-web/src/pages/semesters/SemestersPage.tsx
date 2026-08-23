import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useSemesters } from '@/hooks/useSemesters';
import { Semester, TableColumn } from '@/types';
import { Plus, Edit, Star, PowerOff } from 'lucide-react';

export function SemestersPage() {
  const { semesters, loading, addSemester, updateSemester, toggleSemester, setCurrentSemester } = useSemesters();
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: 'toggle' | 'current', sem: Semester} | null>(null);

  const [formData, setFormData] = useState({ name: '', year: '', startDate: '', endDate: '' });
  const [formLoading, setFormLoading] = useState(false);

  const uniqueYears = Array.from(new Set(semesters.map(s => s.year)));

  const filtered = semesters.filter(s => 
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.year.includes(search)) &&
    (!filterYear || s.year === filterYear) &&
    (!filterStatus || (filterStatus === 'active' ? s.isActive : !s.isActive))
  );

  const columns: TableColumn<Semester>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { 
      key: 'dates', 
      label: 'Duration',
      render: (s) => `${s.startDate.toLocaleDateString()} - ${s.endDate.toLocaleDateString()}`
    },
    { 
      key: 'isCurrent', 
      label: 'Current',
      render: (s) => s.isCurrent && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center w-max"><Star className="w-3 h-3 mr-1 fill-current" /> Current</span>
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (s) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {s.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleOpenAdd = () => {
    setEditingSem(null);
    setFormData({ name: '', year: '', startDate: '', endDate: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sem: Semester) => {
    setEditingSem(sem);
    setFormData({ 
      name: sem.name, 
      year: sem.year, 
      startDate: sem.startDate.toISOString().split('T')[0], 
      endDate: sem.endDate.toISOString().split('T')[0] 
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        year: formData.year,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };
      if (editingSem) {
        await updateSemester(editingSem.id, payload);
      } else {
        await addSemester(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'toggle') {
        await toggleSemester(confirmAction.sem.id);
      } else if (confirmAction.type === 'current') {
        await setCurrentSemester(confirmAction.sem.id);
      }
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (sem: Semester) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(sem)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      {!sem.isCurrent && sem.isActive && (
        <button 
          onClick={() => { setConfirmAction({type: 'current', sem}); setConfirmOpen(true); }} 
          className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
          title="Set as Current"
        >
          <Star className="w-4 h-4" />
        </button>
      )}
      <button 
        onClick={() => { setConfirmAction({type: 'toggle', sem}); setConfirmOpen(true); }} 
        className={`${sem.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} transition-colors p-1`}
        title={sem.isActive ? 'Deactivate' : 'Activate'}
      >
        <PowerOff className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Semesters</h1>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Semester
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-col sm:flex-row">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search semesters..." />
          </div>
          <select 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-40"
          >
            <option value="">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          actions={actions}
          emptyMessage="No semesters found."
        />
      </div>

      <FormDialog open={dialogOpen} title={editingSem ? 'Edit Semester' : 'Add Semester'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Odd Semester" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="e.g. 2024-2025" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmOpen}
        title={confirmAction?.type === 'toggle' ? (confirmAction.sem.isActive ? 'Deactivate' : 'Activate') : 'Set Current Semester'}
        message={confirmAction?.type === 'toggle' 
          ? `Are you sure you want to ${confirmAction.sem.isActive ? 'deactivate' : 'activate'} "${confirmAction.sem.name}"?`
          : `Are you sure you want to set "${confirmAction?.sem.name}" as the current semester?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        variant={confirmAction?.type === 'toggle' && confirmAction.sem.isActive ? 'danger' : 'primary'}
      />
    </AdminLayout>
  );
}
