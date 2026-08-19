import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { useFaculty } from '@/hooks/useFaculty';
import { useDepartments } from '@/hooks/useDepartments';
import { UserProfile, TableColumn } from '@/types';
import { Plus, Edit } from 'lucide-react';

export function FacultyPage() {
  const { faculty, loading, addFaculty, updateFaculty } = useFaculty();
  const { departments } = useDepartments();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFac, setEditingFac] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({ fullName: '', email: '', employeeId: '', departmentId: '', password: '', confirmPassword: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getDeptName = (id?: string) => {
    if (!id) return '-';
    return departments.find(d => d.id === id)?.name || id;
  };

  const filtered = faculty.filter(f => 
    f.fullName.toLowerCase().includes(search.toLowerCase()) || 
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    (f.employeeId && f.employeeId.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: TableColumn<UserProfile>[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'employeeId', label: 'Employee ID', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'department', 
      label: 'Department',
      render: (f) => getDeptName(f.departmentId)
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (f) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${f.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {f.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleOpenAdd = () => {
    setEditingFac(null);
    setFormData({ fullName: '', email: '', employeeId: '', departmentId: '', password: '', confirmPassword: '' });
    setPasswordError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (fac: UserProfile) => {
    setEditingFac(fac);
    setFormData({ 
      fullName: fac.fullName, 
      email: fac.email, 
      employeeId: fac.employeeId || '', 
      departmentId: fac.departmentId || '',
      password: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!editingFac) {
      if (!formData.password) {
        setPasswordError('Password is required');
        return;
      }
      if (formData.password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
    }

    setFormLoading(true);
    try {
      if (editingFac) {
        await updateFaculty(editingFac.uid, formData);
      } else {
        await addFaculty(formData);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const actions = (fac: UserProfile) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(fac)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Members</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium w-fit"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Onboard Faculty
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search faculty by name, email, or emp ID..." />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No faculty found." />
      </div>

      <FormDialog open={dialogOpen} title={editingFac ? 'Edit Faculty' : 'Onboard Faculty'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          {passwordError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {passwordError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          {!editingFac && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </FormDialog>
    </AdminLayout>
  );
}
