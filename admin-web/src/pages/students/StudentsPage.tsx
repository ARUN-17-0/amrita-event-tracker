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
import { useSemesters } from '@/hooks/useSemesters';
import { UserProfile, TableColumn } from '@/types';
import { Plus, Edit, Upload, Trash2, Users, GraduationCap, Building2 } from 'lucide-react';
import { adminResetPassword } from '@/services/authService';

export function StudentsPage() {
  const navigate = useNavigate();
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { departments } = useDepartments();
  const { sections } = useSections();
  const { semesters } = useSemesters();
  
  const [search, setSearch] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNo: '',
    departmentId: '',
    sectionId: '',
    role: 'student',
    password: '',
    confirmPassword: '',
    changePassword: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getDeptCode = (id?: string) => {
    if (!id) return '-';
    return departments.find(d => d.id === id)?.code || id;
  };

  const getSecName = (id?: string) => {
    if (!id) return '-';
    return sections.find(s => s.id === id)?.name || id;
  };

  const getBatchName = (id?: string) => {
    if (!id) return '-';
    return semesters.find(s => s.id === id)?.name || id;
  };

  // Sections matching current Batch & Department filters
  const availableSections = sections.filter(sec => 
    (!selectedDeptId || sec.departmentId === selectedDeptId) &&
    (!selectedBatchId || sec.semesterId === selectedBatchId)
  );

  // Student counts helper
  const getSectionStudentCount = (sectionId: string) => {
    return students.filter(s => s.sectionId === sectionId).length;
  };

  const filtered = students.filter(s => {
    const matchesSearch = (
      s.fullName.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase()))
    );
    const matchesBatch = !selectedBatchId || s.semesterId === selectedBatchId;
    const matchesDept = !selectedDeptId || s.departmentId === selectedDeptId;
    const matchesSection = !selectedSectionId || s.sectionId === selectedSectionId;
    return matchesSearch && matchesBatch && matchesDept && matchesSection;
  });

  const columns: TableColumn<UserProfile>[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'rollNo', label: 'Roll Number', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'department', 
      label: 'Department',
      render: (s) => getDeptCode(s.departmentId)
    },
    { 
      key: 'section', 
      label: 'Class / Section',
      render: (s) => (
        <span className="font-semibold text-primary">
          {getSecName(s.sectionId)}
        </span>
      )
    },
    { 
      key: 'batch', 
      label: 'Batch',
      render: (s) => getBatchName(s.semesterId)
    },
    { 
      key: 'role',
      label: 'Role',
      render: (s) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s.role === 'cr' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
          {s.role === 'cr' ? 'CR' : 'Student'}
        </span>
      )
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
    setFormData({
      fullName: '',
      email: '',
      rollNo: '',
      departmentId: selectedDeptId || (departments[0]?.id || ''),
      sectionId: selectedSectionId || (availableSections[0]?.id || ''),
      role: 'student',
      password: '',
      confirmPassword: '',
      changePassword: ''
    });
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
      role: stu.role || 'student',
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

    if (!editingStudent) {
      if (!formData.password) { setPasswordError('Password is required'); return; }
      if (formData.password.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
      if (formData.password !== formData.confirmPassword) { setPasswordError('Passwords do not match'); return; }
    }

    setFormLoading(true);
    try {
      // Find matching semesterId from section if not present
      const sec = sections.find(s => s.id === formData.sectionId);
      const studentPayload = {
        ...formData,
        semesterId: sec?.semesterId || selectedBatchId || ''
      };

      if (editingStudent) {
        const { password, confirmPassword, changePassword, ...profileFields } = studentPayload;
        await updateStudent(editingStudent.uid, profileFields);
        if (changePassword) {
          await adminResetPassword(editingStudent.uid, changePassword);
        }
      } else {
        await addStudent(studentPayload);
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || 'Failed to save student. Please check the details and try again.');
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

  const handleToggleRole = async (stu: UserProfile) => {
    const newRole = stu.role === 'cr' ? 'student' : 'cr';
    await updateStudent(stu.uid, { role: newRole });
  };

  const actions = (stu: UserProfile) => (
    <div className="flex space-x-2 items-center">
      <button onClick={() => handleOpenEdit(stu)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleToggleRole(stu)}
        className={`text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${stu.role === 'cr' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
        title={stu.role === 'cr' ? 'Demote to Student' : 'Promote to CR'}
      >
        {stu.role === 'cr' ? 'CR → Student' : 'Make CR'}
      </button>
      <button onClick={() => { setStudentToDelete(stu); setConfirmDeleteOpen(true); }} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students & Classes</h1>
          <p className="text-xs text-gray-500 mt-0.5">Filter by Batch ➔ Department ➔ Class to view students</p>
        </div>
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

      {/* Main Filter Hierarchy Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden space-y-3 p-4 mb-4">
        {/* Step 1: Batch */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> 1. Batch
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedBatchId(''); setSelectedSectionId(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedBatchId === ''
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Batches
            </button>
            {semesters.map(b => (
              <button
                key={b.id}
                onClick={() => { setSelectedBatchId(b.id); setSelectedSectionId(''); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedBatchId === b.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Department */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> 2. Department
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedDeptId(''); setSelectedSectionId(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedDeptId === ''
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Branches
            </button>
            {departments.map(d => (
              <button
                key={d.id}
                onClick={() => { setSelectedDeptId(d.id); setSelectedSectionId(''); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDeptId === d.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d.code} — {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Class / Section */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> 3. Class / Section
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSectionId('')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSectionId === ''
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Classes ({filtered.length} students)
            </button>
            {availableSections.map(sec => {
              const count = getSectionStudentCount(sec.id);
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedSectionId === sec.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{sec.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSectionId === sec.id ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search students by name, email, or roll number..." />
        </div>
      </div>

      {/* Step 4: Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No students found in this class." />
      </div>

      {/* Add / Edit Form */}
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
                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class / Section</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.sectionId} onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}>
                <option value="">Select Class</option>
                {sections.filter(s => !formData.departmentId || s.departmentId === formData.departmentId).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {editingStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${formData.role === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'cr' })}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${formData.role === 'cr' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Class Representative (CR)
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formData.role === 'cr' ? 'This student will have CR privileges (assign events, manage their section).' : 'Standard student account.'}
              </p>
            </div>
          )}

          {editingStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" placeholder="Enter new password" value={formData.changePassword} onChange={e => setFormData({...formData, changePassword: e.target.value})} />
            </div>
          )}

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
