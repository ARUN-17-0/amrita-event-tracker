import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useDepartments } from '@/hooks/useDepartments';
import { Department, TableColumn } from '@/types';
import { Plus, Edit, Power, PowerOff, Trash2 } from 'lucide-react';

export function DepartmentsPage() {
  const { departments, loading, error, addDepartment, updateDepartment, toggleDepartment, deleteDepartment } = useDepartments();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [togglingDept, setTogglingDept] = useState<Department | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  const [formData, setFormData] = useState({ name: '', code: '' });
  const [formLoading, setFormLoading] = useState(false);

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<Department>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (d) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {d.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created Date',
      render: (d) => d.createdAt.toLocaleDateString()
    }
  ];

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
      } else {
        await addDepartment(formData);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!togglingDept) return;
    try {
      await toggleDepartment(togglingDept.id);
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    try {
      await deleteDepartment(deptToDelete.id);
      setConfirmDeleteOpen(false);
      setDeptToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const actions = (dept: Department) => (
    <div className="flex space-x-2 items-center">
      <button onClick={() => handleOpenEdit(dept)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit">
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => { setTogglingDept(dept); setConfirmOpen(true); }}
        className={`${dept.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} transition-colors p-1`}
        title={dept.isActive ? 'Deactivate' : 'Activate'}
      >
        {dept.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      </button>
      <button onClick={() => { setDeptToDelete(dept); setConfirmDeleteOpen(true); }} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Search departments by name or code..." 
          />
        </div>
        
        <DataTable
          columns={columns}
          data={filteredDepts}
          loading={loading}
          actions={actions}
          emptyMessage="No departments found."
        />
      </div>

      <FormDialog
        open={dialogOpen}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        loading={formLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CSE"
            />
          </div>
        </div>
      </FormDialog>

      <ConfirmationDialog
        open={confirmOpen}
        title={togglingDept?.isActive ? 'Deactivate Department' : 'Activate Department'}
        message={`Are you sure you want to ${togglingDept?.isActive ? 'deactivate' : 'activate'} the department "${togglingDept?.name}"?`}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel={togglingDept?.isActive ? 'Deactivate' : 'Activate'}
        variant={togglingDept?.isActive ? 'danger' : 'primary'}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete Department"
        message={`Are you sure you want to permanently delete "${deptToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmDeleteOpen(false); setDeptToDelete(null); }}
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminLayout>
  );
}
