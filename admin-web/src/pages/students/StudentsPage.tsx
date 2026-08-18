import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { useStudents } from '@/hooks/useStudents';
import { useDepartments } from '@/hooks/useDepartments';
import { useSections } from '@/hooks/useSections';
import { UserProfile, TableColumn } from '@/types';
import { Plus, Edit, Upload } from 'lucide-react';

export function StudentsPage() {
  const navigate = useNavigate();
  const { students, loading, addStudent, updateStudent } = useStudents();
  const { departments } = useDepartments();
  const { sections } = useSections();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({ fullName: '', email: '', rollNo: '', departmentId: '', sectionId: '' });
  const [formLoading, setFormLoading] = useState(false);

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
    setFormData({ fullName: '', email: '', rollNo: '', departmentId: '', sectionId: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (stu: UserProfile) => {
    setEditingStudent(stu);
    setFormData({ 
      fullName: stu.fullName, 
      email: stu.email, 
      rollNo: stu.rollNo || '', 
      departmentId: stu.departmentId || '',
      sectionId: stu.sectionId || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const actions = (stu: UserProfile) => (
    <div className="flex space-x-2">
      <button onClick={() => handleOpenEdit(stu)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/students/import')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
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

      <FormDialog open={dialogOpen} title={editingStudent ? 'Edit Student' : 'Add Student'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
        </div>
      </FormDialog>
    </AdminLayout>
  );
}
