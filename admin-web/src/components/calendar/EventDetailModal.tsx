import { X, Clock, MapPin, BookOpen, User, CalendarDays, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { AcademicEvent } from '@/types';

interface EventDetailModalProps {
  event: AcademicEvent | null;
  onClose: () => void;
  subjectName?: string;
  sectionName?: string;
  creatorName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  assignment: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Assignment' },
  quiz: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Quiz' },
  exam: { bg: 'bg-red-100', text: 'text-red-700', label: 'Exam' },
  lab: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Lab' },
  project: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Project' },
  announcement: { bg: 'bg-green-100', text: 'text-green-700', label: 'Announcement' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Other' },
};

const LEFT_COLORS: Record<string, string> = {
  assignment: 'bg-blue-500', quiz: 'bg-purple-500', exam: 'bg-red-500',
  lab: 'bg-orange-500', project: 'bg-teal-500', announcement: 'bg-green-500', other: 'bg-gray-500',
};

function buildGoogleCalendarUrl(event: AcademicEvent, subjectName?: string, sectionName?: string) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = event.eventDate;
  const [h, m] = (event.eventTime || '09:00').split(':').map(Number);
  const startDt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
  const endDt = new Date(startDt.getTime() + 60 * 60 * 1000); // default 1 hour
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  const details = [
    subjectName ? `Subject: ${subjectName}` : '',
    sectionName ? `Section: ${sectionName}` : '',
    event.description || '',
  ].filter(Boolean).join('\n');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(startDt)}/${fmt(endDt)}`,
    details,
    location: sectionName || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventDetailModal({ event, onClose, subjectName, sectionName, creatorName, onEdit, onDelete }: EventDetailModalProps) {
  if (!event) return null;
  const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.other;
  const leftColor = LEFT_COLORS[event.type] ?? 'bg-gray-500';
  const gcalUrl = buildGoogleCalendarUrl(event, subjectName, sectionName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Coloured top stripe */}
        <div className={`h-1.5 w-full ${leftColor}`} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
                {style.label}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>{event.eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{event.eventTime}</span>
            </div>
            {(sectionName || event.sectionId) && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{sectionName ?? event.sectionId}</span>
              </div>
            )}
            {(subjectName || event.subjectId) && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>{subjectName ?? event.subjectId}</span>
              </div>
            )}
            {(creatorName || event.createdBy) && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>Posted by {creatorName ?? event.createdBy}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <CalendarPlus className="w-4 h-4 text-blue-500" />
              Add to Calendar
            </a>
            <div className="flex items-center gap-2 ml-auto">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
