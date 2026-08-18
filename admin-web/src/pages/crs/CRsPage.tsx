import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useCRs } from '@/hooks/useCRs';
import { useSections } from '@/hooks/useSections';
import { useDepartments } from '@/hooks/useDepartments';
import { useStudents } from '@/hooks/useStudents';
import { UserProfile, TableColumn } from '@/types';
import { Plus, UserMinus } from 'lucide-react';

export function CRsPage() {
  const { crs, loading, assignCR, removeCR } = useCRs();
  const { sections } = useSections();
  const { departments } = useDepartments();
  const { students } = useStudents();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [crToRemove, setCrToRemove] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({ studentId: '', sectionId: '' });
  const [formLoading, setFormLoading] = useState(false);

  const getDeptName = (id?: string) => {
    if (!id) return '-';
    return departments.find(d => d.id === id)?.name || id;
  };
  
  const getSecName = (id?: string) => {
    if (!id) return '-';
    return sections.find(s => s.id === id)?.name || id;
  };

  const filtered = crs.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<UserProfile>[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'department', 
      label: 'Department',
      render: (c) => getDeptName(c.departmentId)
    },
    { 
      key: 'section', 
      label: 'Section',
      render: (c) => getSecName(c.sectionId)
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (c) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {c.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await assignCR(formData.studentId, formData.sectionId);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!crToRemove) return;
    try {
      await removeCR(crToRemove.uid);
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (cr: UserProfile) => (
    <div className="flex space-x-2">
      <button 
        onClick={() => { setCrToRemove(cr); setConfirmOpen(true); }} 
        className="text-red-500 hover:text-red-700 transition-colors p-1"
        title="Remove CR Role"
      >
        <UserMinus className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Representatives</h1>
        <button 
          onClick={() => { setFormData({ studentId: '', sectionId: '' }); setDialogOpen(true); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign CR
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search CRs by name or email..." />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No CRs found." />
      </div>

      <FormDialog open={dialogOpen} title="Assign Class Representative" onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.uid} value={s.uid}>{s.fullName} ({s.rollNo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.sectionId} onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}>
              <option value="">Select Section</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name} - {getDeptName(s.departmentId)}</option>)}
            </select>
          </div>
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmOpen}
        title="Remove CR Role"
        message={`Are you sure you want to remove the CR role from "${crToRemove?.fullName}"?`}
        onConfirm={handleRemove}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Remove Role"
        variant="danger"
      />
    </AdminLayout>
  );
}
