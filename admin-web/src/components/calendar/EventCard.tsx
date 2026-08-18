import React from 'react';
import { AcademicEvent } from '@/types';
import { Clock, MapPin } from 'lucide-react';

export interface EventCardProps {
  event: AcademicEvent;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false }) => {
  const getEventColorAndLabel = (type: string) => {
    switch (type) {
      case 'assignment': return { bg: 'bg-blue-500', text: 'text-blue-700', label: 'Assignment' };
      case 'quiz': return { bg: 'bg-purple-500', text: 'text-purple-700', label: 'Quiz' };
      case 'exam': return { bg: 'bg-red-500', text: 'text-red-700', label: 'Exam' };
      case 'lab': return { bg: 'bg-orange-500', text: 'text-orange-700', label: 'Lab' };
      case 'project': return { bg: 'bg-teal-500', text: 'text-teal-700', label: 'Project' };
      case 'announcement': return { bg: 'bg-green-500', text: 'text-green-700', label: 'Announcement' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700', label: 'Other' };
    }
  };

  const style = getEventColorAndLabel(event.type);

  if (compact) {
    return (
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden flex hover:shadow-md transition-shadow">
        <div className={`w-1.5 shrink-0 ${style.bg}`} />
        <div className="p-3 w-full">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-sm font-semibold text-text-primary truncate">{event.title}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gray-100 font-medium whitespace-nowrap ml-2 ${style.text}`}>
              {style.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Clock className="w-3 h-3" />
            <span>{event.eventTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex hover:shadow-md transition-shadow">
      <div className={`w-2 shrink-0 ${style.bg}`} />
      <div className="p-4 w-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-semibold text-text-primary">{event.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-md bg-gray-50 font-medium border border-border ${style.text}`}>
            {style.label}
          </span>
        </div>
        
        <p className="text-sm text-text-secondary line-clamp-2 mb-3 flex-1">
          {event.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-text-secondary pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{event.eventTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>Section {event.sectionId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
