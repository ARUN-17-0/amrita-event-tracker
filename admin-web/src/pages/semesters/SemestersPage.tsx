import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useSemesters } from '@/hooks/useSemesters';
import { Semester, TableColumn } from '@/types';
import { Plus, Edit, Star, PowerOff, Trash2 } from 'lucide-react';

import { getBatchSemester } from '@/utils/batchUtils';

export function SemestersPage() {
  const { semesters, loading, addSemester, updateSemester, toggleSemester, setCurrentSemester, deleteSemester } = useSemesters();
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: 'toggle' | 'current', sem: Semester} | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [semToDelete, setSemToDelete] = useState<Semester | null>(null);

  const [formData, setFormData] = useState({ year: '' });
  const [formLoading, setFormLoading] = useState(false);

  const uniqueYears = Array.from(new Set(semesters.map(s => s.year)));

  const filtered = semesters.filter(s => 
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.year.includes(search)) &&
    (!filterYear || s.year === filterYear) &&
    (!filterStatus || (filterStatus === 'active' ? s.isActive : !s.isActive))
  );

  const columns: TableColumn<Semester>[] = [
    { key: 'name', label: 'Batch Name', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'currentSem',
      label: 'Current Stage',
      render: (s) => {
        const info = getBatchSemester(s.year);
        if (info.status === 'active') {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {info.label}
            </span>
          );
        }
        if (info.status === 'graduated') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Graduated
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Upcoming
          </span>
        );
      }
    },
    { 
      key: 'dates', 
      label: 'Schedule',
      render: (s) => {
        const y = parseInt(s.year) || new Date(s.startDate).getFullYear();
        return (
          <div className="text-xs space-y-0.5">
            <div className="text-orange-700 font-medium">Odd: Jul 1 – Dec 31, {y}</div>
            <div className="text-blue-700 font-medium">Even: Jan 1 – May 31, {y + 1}</div>
          </div>
        );
      }
    },
    { 
      key: 'isCurrent', 
      label: 'Active Batch',
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
    setFormData({ year: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sem: Semester) => {
    setEditingSem(sem);
    setFormData({ year: sem.year });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const y = parseInt(formData.year) || new Date().getFullYear();
      const payload = {
        year: String(y),
        name: `${y} Batch`,
        startDate: new Date(`${y}-07-01`),
        endDate: new Date(`${y + 1}-05-31`),
        isActive: editingSem ? editingSem.isActive : true,
        isCurrent: editingSem ? editingSem.isCurrent : false
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

  const handleDelete = async () => {
    if (!semToDelete) return;
    try {
      await deleteSemester(semToDelete.id);
      setConfirmDeleteOpen(false);
      setSemToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (sem: Semester) => (
    <div className="flex space-x-2 items-center">
      <button onClick={() => handleOpenEdit(sem)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      {!sem.isCurrent && sem.isActive && (
        <button
          onClick={() => { setConfirmAction({type: 'current', sem}); setConfirmOpen(true); }}
          className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
          title="Set as Current Batch"
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
      <button onClick={() => { setSemToDelete(sem); setConfirmDeleteOpen(true); }} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const selectedYearNum = parseInt(formData.year);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-col sm:flex-row">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search batches..." />
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
          emptyMessage="No batches found."
        />
      </div>

      <FormDialog open={dialogOpen} title={editingSem ? 'Edit Batch' : 'Create Batch'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
            <input 
              type="number" 
              required 
              min="2020" 
              max="2040"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" 
              value={formData.year} 
              onChange={(e) => setFormData({ ...formData, year: e.target.value })} 
              placeholder="e.g. 2025" 
            />
          </div>

          {selectedYearNum > 2000 && (
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs text-gray-700">
              <p className="font-semibold text-gray-900 text-sm">{selectedYearNum} Batch Schedule:</p>
              <div className="flex items-center justify-between text-orange-800 bg-orange-50 p-2 rounded-lg border border-orange-100">
                <span className="font-medium">Odd Semester:</span>
                <span>Jul 1, {selectedYearNum} – Dec 31, {selectedYearNum}</span>
              </div>
              <div className="flex items-center justify-between text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-100">
                <span className="font-medium">Even Semester:</span>
                <span>Jan 1, {selectedYearNum + 1} – May 31, {selectedYearNum + 1}</span>
              </div>
            </div>
          )}
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmOpen}
        title={confirmAction?.type === 'toggle' ? (confirmAction.sem.isActive ? 'Deactivate Batch' : 'Activate Batch') : 'Set Current Batch'}
        message={confirmAction?.type === 'toggle' 
          ? `Are you sure you want to ${confirmAction.sem.isActive ? 'deactivate' : 'activate'} "${confirmAction.sem.name}"?`
          : `Are you sure you want to set "${confirmAction?.sem.name}" as the current active batch?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        variant={confirmAction?.type === 'toggle' && confirmAction.sem.isActive ? 'danger' : 'primary'}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete Batch"
        message={`Permanently delete "${semToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmDeleteOpen(false); setSemToDelete(null); }}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminLayout>
  );
}
