import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useSections } from '@/hooks/useSections';
import { useDepartments } from '@/hooks/useDepartments';
import { useSemesters } from '@/hooks/useSemesters';
import { useAuth } from '@/hooks/useAuth';
import { Section, TableColumn } from '@/types';
import { Plus, Edit, UserMinus, Trash2 } from 'lucide-react';

export function SectionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { sections, loading, addSection, updateSection, removeCR, deleteSection } = useSections();
  const { departments } = useDepartments();
  const { semesters } = useSemesters();
  
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<Section | null>(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [crToRemove, setCrToRemove] = useState<Section | null>(null);
  const [secToDelete, setSecToDelete] = useState<Section | null>(null);
  const [confirmDeleteSecOpen, setConfirmDeleteSecOpen] = useState(false);

  const [formData, setFormData] = useState({ name: '', departmentId: '', semesterId: '' });
  const [formLoading, setFormLoading] = useState(false);

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || id;
  const getSemName = (id: string) => semesters.find(s => s.id === id)?.name || id;

  const filtered = sections.filter(s => 
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    getDeptName(s.departmentId).toLowerCase().includes(search.toLowerCase())) &&
    (!filterDept || s.departmentId === filterDept) &&
    (!filterSem || s.semesterId === filterSem)
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

  const handleDeleteSection = async () => {
    if (!secToDelete) return;
    try {
      await deleteSection(secToDelete.id);
      setConfirmDeleteSecOpen(false);
      setSecToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = isAdmin ? (sec: Section) => (
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
      <button 
        onClick={() => { setSecToDelete(sec); setConfirmDeleteSecOpen(true); }} 
        className="text-red-500 hover:text-red-700 transition-colors p-1"
        title="Delete Section"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ) : undefined;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-col sm:flex-row">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search sections..." />
          </div>
          <select 
            value={filterDept} 
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-48"
          >
            <option value="">All Depts</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
          </select>
          <select 
            value={filterSem} 
            onChange={e => setFilterSem(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-48"
          >
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name} - {s.year}</option>)}
          </select>
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

      <ConfirmationDialog
        open={confirmDeleteSecOpen}
        title="Delete Section"
        message={`Are you sure you want to delete section "${secToDelete?.name}"?`}
        onConfirm={handleDeleteSection}
        onCancel={() => { setConfirmDeleteSecOpen(false); setSecToDelete(null); }}
        confirmLabel="Delete Section"
        variant="danger"
      />
    </AdminLayout>
  );
}
