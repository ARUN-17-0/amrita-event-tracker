import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useStudents } from '@/hooks/useStudents';
import { useDepartments } from '@/hooks/useDepartments';
import { useSections } from '@/hooks/useSections';
import { UserProfile, TableColumn } from '@/types';
import { Plus, Edit, Upload, Trash2 } from 'lucide-react';

export function StudentsPage() {
  const navigate = useNavigate();
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { departments } = useDepartments();
  const { sections } = useSections();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({ fullName: '', email: '', rollNo: '', departmentId: '', sectionId: '', password: '', confirmPassword: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getDeptName = (id?: string) => {
    if (!id) return '-';
    return departments.find(d => d.id === id)?.code || id;
  };

  const getSecName = (id?: string) => {
    if (!id) return '-';
    return sections.find(s => s.id === id)?.name || id;
  };

  const filtered = students.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: TableColumn<UserProfile>[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'rollNo', label: 'Roll Number', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'department', 
      label: 'Department',
      render: (s) => getDeptName(s.departmentId)
    },
    { 
      key: 'section', 
      label: 'Section',
      render: (s) => getSecName(s.sectionId)
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
    setEditingStudent(null);
    setFormData({ fullName: '', email: '', rollNo: '', departmentId: '', sectionId: '', password: '', confirmPassword: '' });
    setPasswordError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (stu: UserProfile) => {
    setEditingStudent(stu);
    setFormData({ 
      fullName: stu.fullName, 
      email: stu.email, 
      rollNo: stu.rollNo || '', 
      departmentId: stu.departmentId || '',
      sectionId: stu.sectionId || '',
      password: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!editingStudent) {
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
      if (editingStudent) {
        await updateStudent(editingStudent.uid, formData);
      } else {
        await addStudent(formData);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.uid);
      setConfirmDeleteOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (stu: UserProfile) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(stu)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      <button onClick={() => { setStudentToDelete(stu); setConfirmDeleteOpen(true); }} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/students/import')}
            className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Bulk Import
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search students by name, email, or roll number..." />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No students found." />
      </div>

      <FormDialog open={dialogOpen} title={editingStudent ? 'Student Details / Edit' : 'Add Student'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
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
          {!editingStudent && (
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.sectionId} onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}>
                <option value="">Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {editingStudent && (
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">UID: {editingStudent.uid}</span>
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  setStudentToDelete(editingStudent);
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
        title="Delete Student"
        message={`Are you sure you want to delete "${studentToDelete?.fullName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmDeleteOpen(false); setStudentToDelete(null); }}
        confirmLabel="Delete Student"
        variant="danger"
      />
    </AdminLayout>
  );
}
