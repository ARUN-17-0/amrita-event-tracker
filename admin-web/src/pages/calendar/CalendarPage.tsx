import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Calendar } from '@/components/calendar/Calendar';
import { EventCard } from '@/components/calendar/EventCard';
import { useCalendar } from '@/hooks/useCalendar';
import { useDepartments } from '@/hooks/useDepartments';
import { EventType } from '@/types';

export function CalendarPage() {
  const { events, loading, getEventsForDate, getEventsForMonth } = useCalendar();
  const { departments } = useDepartments();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [filterDept, setFilterDept] = useState('');
  const [filterType, setFilterType] = useState<EventType | ''>('');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  let dailyEvents = getEventsForDate(selectedDate);
  
  // Basic filtering mock (in real app, this might need subject->dept mapping)
  if (filterType) {
    dailyEvents = dailyEvents.filter(e => e.type === filterType);
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view university-wide events.</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
          </select>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as EventType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary capitalize"
          >
            <option value="">All Types</option>
            {['assignment', 'quiz', 'exam', 'lab', 'project', 'announcement', 'other'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Calendar 
            events={events}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </div>
        
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Events for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {dailyEvents.length > 0 ? (
                dailyEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400">📅</span>
                  </div>
                  <p className="text-gray-500 text-sm">No events scheduled for this day.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
