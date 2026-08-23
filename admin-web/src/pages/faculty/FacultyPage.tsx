import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useFaculty } from '@/hooks/useFaculty';
import { useDepartments } from '@/hooks/useDepartments';
import { useSubjects } from '@/hooks/useSubjects';
import { useSections } from '@/hooks/useSections';
import { UserProfile, TableColumn } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { registerMockCredential } from '@/services/authService';

export function FacultyPage() {
  const { faculty, loading, addFaculty, updateFaculty, deleteFaculty } = useFaculty();
  const { departments } = useDepartments();
  const { subjects } = useSubjects();
  const { sections } = useSections();
  
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFac, setEditingFac] = useState<UserProfile | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [facToDelete, setFacToDelete] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({ fullName: '', email: '', employeeId: '', departmentId: '', role: 'faculty', assignedSubjectIds: [] as string[], assignedSectionIds: [] as string[], password: '', confirmPassword: '', changePassword: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getDeptName = (id?: string) => {
    if (!id) return '-';
    return departments.find(d => d.id === id)?.name || id;
  };

  const filtered = faculty.filter(f => 
    (f.fullName.toLowerCase().includes(search.toLowerCase()) || 
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    (f.employeeId && f.employeeId.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterDept || f.departmentId === filterDept) &&
    (!filterRole || f.role === filterRole)
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
    { key: 'role', label: 'Role', render: (f) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
        f.role === 'course_mentor' ? 'bg-purple-100 text-purple-700' :
        f.role === 'admin' ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {f.role === 'course_mentor' ? 'Course Mentor' : f.role === 'admin' ? 'Admin' : 'Faculty'}
      </span>
    )},
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
    setFormData({ fullName: '', email: '', employeeId: '', departmentId: '', role: 'faculty', assignedSubjectIds: [], assignedSectionIds: [], password: '', confirmPassword: '', changePassword: '' });
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
      role: fac.role || 'faculty',
      assignedSubjectIds: fac.assignedSubjectIds || [],
      assignedSectionIds: fac.assignedSectionIds || [],
      password: '',
      confirmPassword: '',
      changePassword: ''
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
        const { password, confirmPassword, changePassword, ...profileFields } = formData;
        await updateFaculty(editingFac.uid, profileFields);
        if (formData.changePassword) {
          registerMockCredential(editingFac, formData.changePassword);
        }
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

  const handleDelete = async () => {
    if (!facToDelete) return;
    try {
      await deleteFaculty(facToDelete.uid);
      setConfirmDeleteOpen(false);
      setFacToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (fac: UserProfile) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(fac)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      <button onClick={() => { setFacToDelete(fac); setConfirmDeleteOpen(true); }} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
        <Trash2 className="w-4 h-4" />
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
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-col sm:flex-row">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search faculty by name, email, or emp ID..." />
          </div>
          <select 
            value={filterDept} 
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-48"
          >
            <option value="">All Depts</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-40">
            <option value="">All Roles</option>
            <option value="faculty">Faculty</option>
            <option value="course_mentor">Course Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No faculty found." />
      </div>

      <FormDialog open={dialogOpen} title={editingFac ? 'Faculty Details / Edit' : 'Onboard Faculty'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="faculty">Faculty</option>
              <option value="course_mentor">Course Mentor (sees all dept events)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.departmentId && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assign Subjects</p>
              <div className="flex flex-wrap gap-2">
                {subjects.filter(s => s.departmentId === formData.departmentId).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      const ids = formData.assignedSubjectIds.includes(s.id)
                        ? formData.assignedSubjectIds.filter(id => id !== s.id)
                        : [...formData.assignedSubjectIds, s.id];
                      setFormData({ ...formData, assignedSubjectIds: ids });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      formData.assignedSubjectIds.includes(s.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {s.code} — {s.name}
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-2">Assign Sections / Classes</p>
              <div className="flex flex-wrap gap-2">
                {sections.filter(s => s.departmentId === formData.departmentId).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      const ids = formData.assignedSectionIds.includes(s.id)
                        ? formData.assignedSectionIds.filter(id => id !== s.id)
                        : [...formData.assignedSectionIds, s.id];
                      setFormData({ ...formData, assignedSectionIds: ids });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      formData.assignedSectionIds.includes(s.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {editingFac && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" placeholder="Enter new password" value={formData.changePassword} onChange={e => setFormData({...formData, changePassword: e.target.value})} />
            </div>
          )}

          {editingFac && (
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">UID: {editingFac.uid}</span>
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  setFacToDelete(editingFac);
                  setConfirmDeleteOpen(true);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete User
              </button>
            </div>
          )}
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete Faculty Member"
        message={`Are you sure you want to delete "${facToDelete?.fullName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmDeleteOpen(false); setFacToDelete(null); }}
        confirmLabel="Delete User"
        variant="danger"
      />
    </AdminLayout>
  );
}
