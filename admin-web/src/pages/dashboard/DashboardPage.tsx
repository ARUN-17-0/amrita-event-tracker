import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardCard } from '@/components/data/DashboardCard';
import { EventCard } from '@/components/calendar/EventCard';
import { useAuth } from '@/hooks/useAuth';
import { useStudents } from '@/hooks/useStudents';
import { useFaculty } from '@/hooks/useFaculty';
import { useDepartments } from '@/hooks/useDepartments';
import { useSections } from '@/hooks/useSections';
import { useSubjects } from '@/hooks/useSubjects';
import { useSemesters } from '@/hooks/useSemesters';
import { useCalendar } from '@/hooks/useCalendar';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Users, UserCog, Building2, Layers, BookOpen, GraduationCap, ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { faculty } = useFaculty();
  const { departments } = useDepartments();
  const { sections } = useSections();
  const { subjects } = useSubjects();
  const { semesters } = useSemesters();
  const { events } = useCalendar();
  const { logs } = useAuditLogs();

  const role = user?.role || 'admin';
  const isAdmin = role === 'admin';
  const isFaculty = role === 'faculty';

  const recentLogs = logs.slice(0, 5);
  const upcomingEvents = events
    .filter(e => new Date(e.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const getRoleBadge = () => {
    switch (role) {
      case 'faculty': return 'Faculty Member';
      case 'cr': return 'Class Representative (CR)';
      case 'student': return 'Student';
      default: return 'Administrator';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.fullName || 'User'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Amrita School of Engineering, Bengaluru • <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">{getRoleBadge()}</span>
            </p>
          </div>
          <Link
            to="/calendar"
            className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors text-sm font-medium w-fit"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            View Calendar
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Total Students" 
            value={students.length} 
            icon={<Users className="w-6 h-6" />} 
            color="#3B82F6" 
          />
          <DashboardCard 
            title="Total Faculty" 
            value={faculty.length} 
            icon={<UserCog className="w-6 h-6" />} 
            color="#8B5CF6" 
          />
          <DashboardCard 
            title="Total Departments" 
            value={departments.length} 
            icon={<Building2 className="w-6 h-6" />} 
            color="#F59E0B" 
          />
          <DashboardCard 
            title="Total Sections" 
            value={sections.length} 
            icon={<Layers className="w-6 h-6" />} 
            color="#10B981" 
          />
          <DashboardCard 
            title="Total Subjects" 
            value={subjects.length} 
            icon={<BookOpen className="w-6 h-6" />} 
            color="#EC4899" 
          />
          <DashboardCard 
            title="Total Semesters" 
            value={semesters.length} 
            icon={<GraduationCap className="w-6 h-6" />} 
            color="#6366F1" 
          />
        </div>
      ) : isFaculty ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Sections" 
            value={sections.length} 
            icon={<Layers className="w-6 h-6" />} 
            color="#10B981" 
          />
          <DashboardCard 
            title="Curriculum Subjects" 
            value={subjects.length} 
            icon={<BookOpen className="w-6 h-6" />} 
            color="#EC4899" 
          />
          <DashboardCard 
            title="Academic Events" 
            value={events.length} 
            icon={<CalendarDays className="w-6 h-6" />} 
            color="#3B82F6" 
          />
          <DashboardCard 
            title="Enrolled Students" 
            value={students.length} 
            icon={<Users className="w-6 h-6" />} 
            color="#8B5CF6" 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Enrolled Subjects" 
            value={subjects.length} 
            icon={<BookOpen className="w-6 h-6" />} 
            color="#EC4899" 
          />
          <DashboardCard 
            title="Class Sections" 
            value={sections.length} 
            icon={<Layers className="w-6 h-6" />} 
            color="#10B981" 
          />
          <DashboardCard 
            title="Upcoming Events" 
            value={upcomingEvents.length} 
            icon={<CalendarDays className="w-6 h-6" />} 
            color="#3B82F6" 
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
        <div className={isAdmin ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Academic Events</h2>
              <Link to="/calendar" className="text-sm font-medium text-primary flex items-center hover:underline">
                View full calendar <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events scheduled.</p>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Link to="/audit-logs" className="text-sm font-medium text-primary flex items-center hover:underline">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              {recentLogs.length > 0 ? (
                <div className="space-y-6">
                  {recentLogs.map(log => (
                    <div key={log.id} className="flex gap-4">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">{log.actorName} • {new Date(log.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
