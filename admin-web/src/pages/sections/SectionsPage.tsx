import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useSections } from '@/hooks/useSections';
import { useDepartments } from '@/hooks/useDepartments';
import { useSemesters } from '@/hooks/useSemesters';
import { Section, TableColumn } from '@/types';
import { Plus, Edit, UserMinus } from 'lucide-react';

export function SectionsPage() {
  const { sections, loading, addSection, updateSection, removeCR } = useSections();
  const { departments } = useDepartments();
  const { semesters } = useSemesters();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<Section | null>(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [crToRemove, setCrToRemove] = useState<Section | null>(null);

  const [formData, setFormData] = useState({ name: '', departmentId: '', semesterId: '' });
  const [formLoading, setFormLoading] = useState(false);

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || id;
  const getSemName = (id: string) => semesters.find(s => s.id === id)?.name || id;

  const filtered = sections.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    getDeptName(s.departmentId).toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<Section>[] = [
    { key: 'name', label: 'Section Name', sortable: true },
    { 
      key: 'department', 
      label: 'Department',
      render: (s) => getDeptName(s.departmentId)
    },
    { 
      key: 'semester', 
      label: 'Semester',
      render: (s) => getSemName(s.semesterId)
    },
    { 
      key: 'cr', 
      label: 'Class Representative',
      render: (s) => s.crUserId ? <span className="text-sm font-medium text-primary">Assigned</span> : <span className="text-sm text-gray-400">Unassigned</span>
    }
  ];

  const handleOpenAdd = () => {
    setEditingSec(null);
    setFormData({ name: '', departmentId: '', semesterId: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sec: Section) => {
    setEditingSec(sec);
    setFormData({ name: sec.name, departmentId: sec.departmentId, semesterId: sec.semesterId });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingSec) {
        await updateSection(editingSec.id, formData);
      } else {
        await addSection(formData);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveCR = async () => {
    if (!crToRemove) return;
    try {
      await removeCR(crToRemove.id);
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (sec: Section) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(sec)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      {sec.crUserId && (
        <button 
          onClick={() => { setCrToRemove(sec); setConfirmOpen(true); }} 
          className="text-red-500 hover:text-red-700 transition-colors p-1"
          title="Remove CR"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search sections..." />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No sections found." />
      </div>

      <FormDialog open={dialogOpen} title={editingSec ? 'Edit Section' : 'Add Section'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. A, B, C" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.semesterId} onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}>
              <option value="">Select Semester</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.year}</option>
              ))}
            </select>
          </div>
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmOpen}
        title="Remove CR"
        message={`Are you sure you want to remove the assigned CR from section "${crToRemove?.name}"?`}
        onConfirm={handleRemoveCR}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Remove"
        variant="danger"
      />
    </AdminLayout>
  );
}
