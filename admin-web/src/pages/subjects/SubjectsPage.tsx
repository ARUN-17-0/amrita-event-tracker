import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useSubjects } from '@/hooks/useSubjects';
import { useDepartments } from '@/hooks/useDepartments';
import { useSemesters } from '@/hooks/useSemesters';
import { useAuth } from '@/hooks/useAuth';
import { Subject, TableColumn } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function SubjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { subjects, loading, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { departments } = useDepartments();
  const { semesters } = useSemesters();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subject | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subject | null>(null);
  const [confirmDeleteSubOpen, setConfirmDeleteSubOpen] = useState(false);

  const [formData, setFormData] = useState({ name: '', code: '', departmentId: '', semesterId: '', credits: 1 });
  const [formLoading, setFormLoading] = useState(false);

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || id;
  const getSemName = (id: string) => semesters.find(s => s.id === id)?.name || id;

  const filtered = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<Subject>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
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
    { key: 'credits', label: 'Credits', sortable: true }
  ];

  const handleOpenAdd = () => {
    setEditingSub(null);
    setFormData({ name: '', code: '', departmentId: '', semesterId: '', credits: 3 });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSub(sub);
    setFormData({ name: sub.name, code: sub.code, departmentId: sub.departmentId, semesterId: sub.semesterId, credits: sub.credits });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingSub) {
        await updateSubject(editingSub.id, formData);
      } else {
        await addSubject(formData);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!subToDelete) return;
    try {
      await deleteSubject(subToDelete.id);
      setConfirmDeleteSubOpen(false);
      setSubToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = isAdmin ? (sub: Subject) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(sub)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      <button 
        onClick={() => { setSubToDelete(sub); setConfirmDeleteSubOpen(true); }} 
        className="text-red-500 hover:text-red-700 transition-colors p-1"
        title="Delete Subject"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ) : undefined;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search subjects by name or code..." />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No subjects found." />
      </div>

      <FormDialog open={dialogOpen} title={editingSub ? 'Edit Subject' : 'Add Subject'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Data Structures" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. 19CSE201" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                <option value="">Select Dept</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.semesterId} onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}>
                <option value="">Select Sem</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
            <input type="number" required min="1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} />
          </div>
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmDeleteSubOpen}
        title="Delete Subject"
        message={`Are you sure you want to delete subject "${subToDelete?.name}"?`}
        onConfirm={handleDeleteSubject}
        onCancel={() => { setConfirmDeleteSubOpen(false); setSubToDelete(null); }}
        confirmLabel="Delete Subject"
        variant="danger"
      />
    </AdminLayout>
  );
}
