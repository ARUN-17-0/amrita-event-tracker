import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Calendar } from '@/components/calendar/Calendar';
import { EventCard } from '@/components/calendar/EventCard';
import { AddEventDialog } from '@/components/calendar/AddEventDialog';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useCalendar } from '@/hooks/useCalendar';
import { useDepartments } from '@/hooks/useDepartments';
import { useSubjects } from '@/hooks/useSubjects';
import { useSections } from '@/hooks/useSections';
import { useAuth } from '@/hooks/useAuth';
import { useFaculty } from '@/hooks/useFaculty';
import { AcademicEvent, EventType } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

export function CalendarPage() {
  const { user } = useAuth();
  const { events, loading, getEventsForDate, createEvent, updateEvent, deleteEvent } = useCalendar();
  const { departments } = useDepartments();
  const { subjects } = useSubjects();
  const { sections } = useSections();
  const { faculty } = useFaculty();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [addOpen, setAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AcademicEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);

  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'course_mentor';
  const canCreate = isAdmin || user?.role === 'faculty' || isMentor;

  // Only admin or the faculty who created the event can modify it
  const canModifyEvent = (event: AcademicEvent) => {
    if (!user) return false;
    if (isAdmin) return true;
    return event.createdBy === user.uid;
  };

  const handleDateSelect = (date: Date) => setSelectedDate(date);

  let dailyEvents = getEventsForDate(selectedDate);
  if (filterDept) {
    dailyEvents = dailyEvents.filter(e => {
      const sec = sections.find(s => s.id === e.sectionId);
      return sec?.departmentId === filterDept;
    });
  }
  if (filterType) dailyEvents = dailyEvents.filter(e => e.type === filterType);

  let visibleEvents = events;
  if (isMentor && user?.departmentId) {
    visibleEvents = events.filter(e => e.departmentId === user.departmentId);
  } else if (!isAdmin && !isMentor && user?.role === 'faculty' && user?.departmentId) {
    visibleEvents = events.filter(e => e.departmentId === user.departmentId);
  }

  const handleCreateEvent = async (data: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
      setEditingEvent(null);
      return { ok: true, message: '' };
    }
    return createEvent(data, isMentor);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    await deleteEvent(eventToDelete.id);
    setEventToDelete(null);
    setSelectedEvent(null);
  };

  const handleEditClick = (event: AcademicEvent) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setAddOpen(true);
  };

  const handleDeleteClick = (event: AcademicEvent) => {
    setSelectedEvent(null);
    setEventToDelete(event);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isMentor ? 'Department-wide view — quiz conflicts enforced.' : 'Manage and view university-wide events.'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as EventType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Types</option>
            {['assignment', 'quiz', 'exam', 'lab', 'project', 'announcement', 'other'].map(t => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>

          {canCreate && (
            <button
              onClick={() => { setEditingEvent(null); setAddOpen(true); }}
              className="flex items-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Event
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Calendar
            events={visibleEvents}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={() => {}}
          />
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Events for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>

            {loading ? (
              <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {dailyEvents.length > 0 ? (
                  dailyEvents.map(event => (
                    <div key={event.id} className="relative group">
                      <EventCard event={event} onClick={() => setSelectedEvent(event)} />
                      {canModifyEvent(event) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEventToDelete(event); }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 bg-white rounded-full shadow transition-all"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400">📅</span>
                    </div>
                    <p className="text-gray-500 text-sm">No events scheduled for this day.</p>
                    {canCreate && (
                      <button onClick={() => { setEditingEvent(null); setAddOpen(true); }} className="mt-3 text-sm text-primary hover:underline">
                        + Add an event
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {user && (
        <AddEventDialog
          open={addOpen}
          onClose={() => { setAddOpen(false); setEditingEvent(null); }}
          onSubmit={handleCreateEvent}
          currentUser={user}
          subjects={subjects}
          sections={sections}
          defaultDate={selectedDate}
          editingEvent={editingEvent}
        />
      )}

      <ConfirmationDialog
        open={!!eventToDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setEventToDelete(null)}
        confirmLabel="Delete Event"
        variant="danger"
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        subjectName={subjects.find(s => s.id === selectedEvent?.subjectId)?.name}
        sectionName={sections.find(s => s.id === selectedEvent?.sectionId)?.name}
        creatorName={faculty.find(f => f.uid === selectedEvent?.createdBy)?.fullName}
        onEdit={selectedEvent && canModifyEvent(selectedEvent) ? () => handleEditClick(selectedEvent) : undefined}
        onDelete={selectedEvent && canModifyEvent(selectedEvent) ? () => handleDeleteClick(selectedEvent) : undefined}
      />
    </AdminLayout>
  );
}

