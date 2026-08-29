import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data/DataTable';
import { SearchBar } from '@/components/data/SearchBar';
import { FormDialog } from '@/components/common/FormDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useDepartments } from '@/hooks/useDepartments';
import { useSemesters } from '@/hooks/useSemesters';
import { useCalendar } from '@/hooks/useCalendar';
import { useSections } from '@/hooks/useSections';
import { useAuth } from '@/hooks/useAuth';
import { Subject, TableColumn, AcademicEvent } from '@/types';
import { Plus, Edit, Trash2, LayoutGrid, List, Award, CalendarDays, X } from 'lucide-react';

export function SubjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { subjects, loading, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { departments } = useDepartments();
  const { semesters } = useSemesters();
  const { events } = useCalendar();
  const { sections } = useSections();

  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedSemNumber, setSelectedSemNumber] = useState<number>(0); // 0 = All
  const [viewMode, setViewMode] = useState<'box' | 'list'>('box');

  // Subject events panel
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subject | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subject | null>(null);
  const [confirmDeleteSubOpen, setConfirmDeleteSubOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    departmentId: '',
    semesterId: '',
    semesterNumber: 1,
    semesterType: 'odd' as 'odd' | 'even',
    credits: 3
  });
  const [formLoading, setFormLoading] = useState(false);

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || id;
  const getDeptCode = (id: string) => departments.find(d => d.id === id)?.code || id;
  const getSemName = (id: string) => semesters.find(s => s.id === id)?.name || id;

  // Filter logic: search, branch tab, semester tab
  const filtered = subjects.filter(s => {
    const matchesSearch = (
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase())
    );
    const matchesDept = !selectedDeptId || s.departmentId === selectedDeptId;
    const matchesSemNum = selectedSemNumber === 0 || (s.semesterNumber === selectedSemNumber);
    return matchesSearch && matchesDept && matchesSemNum;
  });

  const columns: TableColumn<Subject>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { 
      key: 'department', 
      label: 'Department',
      render: (s) => getDeptCode(s.departmentId)
    },
    { 
      key: 'semesterNumber', 
      label: 'Semester',
      render: (s) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          {s.semesterNumber ? `Sem ${s.semesterNumber}` : (s.semesterType === 'even' ? 'Even Sem' : 'Odd Sem')}
        </span>
      )
    },
    { 
      key: 'batch', 
      label: 'Batch',
      render: (s) => s.semesterId ? getSemName(s.semesterId) : '-'
    },
    { key: 'credits', label: 'Credits', sortable: true }
  ];

  const handleOpenAdd = () => {
    setEditingSub(null);
    setFormData({
      name: '',
      code: '',
      departmentId: selectedDeptId || (departments[0]?.id || ''),
      semesterId: semesters.find(s => s.isCurrent)?.id || (semesters[0]?.id || ''),
      semesterNumber: selectedSemNumber > 0 ? selectedSemNumber : 1,
      semesterType: (selectedSemNumber % 2 === 0 && selectedSemNumber > 0) ? 'even' : 'odd',
      credits: 3
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      departmentId: sub.departmentId,
      semesterId: sub.semesterId || '',
      semesterNumber: sub.semesterNumber || (sub.semesterType === 'even' ? 2 : 1),
      semesterType: sub.semesterType || (sub.semesterNumber && sub.semesterNumber % 2 === 0 ? 'even' : 'odd'),
      credits: sub.credits
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const isEven = formData.semesterNumber % 2 === 0;
      const payload = {
        ...formData,
        semesterType: isEven ? ('even' as const) : ('odd' as const)
      };
      if (editingSub) {
        await updateSubject(editingSub.id, payload);
      } else {
        await addSubject(payload);
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

  const semesterNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-xs text-gray-500 mt-0.5">Filter subjects by Branch and Semester</p>
        </div>
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

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden space-y-3 p-4">
        
        {/* Branch Selector Tabs */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Branch / Department
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDeptId('')}
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
                onClick={() => setSelectedDeptId(d.id)}
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

        {/* Semester Selector Pills */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Semester
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSemNumber(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSemNumber === 0
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Semesters
            </button>
            {semesterNumbers.map(num => (
              <button
                key={num}
                onClick={() => setSelectedSemNumber(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSemNumber === num
                    ? num % 2 !== 0 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sem {num} {num % 2 !== 0 ? '(Odd)' : '(Even)'}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar & View Mode Toggle */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3 flex-col sm:flex-row">
          <div className="flex-1 w-full sm:w-auto">
            <SearchBar value={search} onChange={setSearch} placeholder="Search subjects by name or code..." />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-end sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('box')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'box'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Box / Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Box</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="List / Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area: Box vs List */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <DataTable columns={columns} data={filtered} loading={loading} actions={actions} emptyMessage="No subjects found matching the filters." />
        </div>
      ) : (
        <div className="mt-4">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-100">
              Loading subjects...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-100">
              No subjects found for this selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(sub => (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
                  onClick={() => setSelectedSubject(sub)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-primary/10 text-primary">
                        {sub.code}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          sub.semesterNumber && sub.semesterNumber % 2 === 0
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {sub.semesterNumber ? `Sem ${sub.semesterNumber}` : (sub.semesterType === 'even' ? 'Even Sem' : 'Odd Sem')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> {sub.credits} cr
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug line-clamp-2" title={sub.name}>
                      {sub.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <span className="font-medium text-gray-700">{getDeptName(sub.departmentId)}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(sub); }}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSubToDelete(sub); setConfirmDeleteSubOpen(true); }}
                        className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Form Dialog */}
      <FormDialog open={dialogOpen} title={editingSub ? 'Edit Subject' : 'Add Subject'} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} loading={formLoading}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Data Structures" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. 21CS301" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department / Branch</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                <option value="">Select Branch</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester Number</label>
              <select 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" 
                value={formData.semesterNumber} 
                onChange={(e) => {
                  const num = parseInt(e.target.value) || 1;
                  setFormData({
                    ...formData,
                    semesterNumber: num,
                    semesterType: num % 2 === 0 ? 'even' : 'odd'
                  });
                }}
              >
                {semesterNumbers.map(num => (
                  <option key={num} value={num}>
                    Semester {num} {num % 2 !== 0 ? '(Odd Sem: Jul–Dec)' : '(Even Sem: Jan–May)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch (Optional Link)</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.semesterId} onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}>
                <option value="">All / Any Batch</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input type="number" required min="1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })} />
            </div>
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

      {/* Subject Events Panel */}
      {selectedSubject && !selectedEvent && (() => {
        const subEvents = events
          .filter(e => e.subjectId === selectedSubject.id)
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedSubject(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="h-1.5 w-full bg-primary" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedSubject.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedSubject.code}</p>
                  </div>
                  <button onClick={() => setSelectedSubject(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming Events</p>

                {subEvents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">No events scheduled for this subject.</div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {subEvents.map(ev => {
                      const TYPE_COLORS: Record<string, string> = {
                        assignment: 'bg-blue-500', quiz: 'bg-purple-500', exam: 'bg-red-500',
                        lab: 'bg-orange-500', project: 'bg-teal-500', announcement: 'bg-green-500', other: 'bg-gray-400'
                      };
                      const TYPE_LABELS: Record<string, string> = {
                        assignment: 'Assignment', quiz: 'Quiz', exam: 'Exam',
                        lab: 'Lab', project: 'Project', announcement: 'Announcement', other: 'Other'
                      };
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <div className={`w-1.5 self-stretch rounded-full shrink-0 ${TYPE_COLORS[ev.type] ?? 'bg-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <CalendarDays className="w-3 h-3" />
                              <span>{ev.eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span>·</span>
                              <span>{ev.eventTime}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0`}>
                            {TYPE_LABELS[ev.type] ?? 'Other'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button onClick={() => setSelectedSubject(null)} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Event detail when clicking an event from the subject panel */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        subjectName={selectedSubject?.name}
        sectionName={sections.find(s => s.id === selectedEvent?.sectionId)?.name}
      />
    </AdminLayout>
  );
}
