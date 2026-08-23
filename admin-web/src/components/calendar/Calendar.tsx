import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AcademicEvent } from '@/types';

export interface CalendarProps {
  events: AcademicEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, selectedDate, onDateSelect, onMonthChange }) => {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const handlePrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setViewDate(d);
    onMonthChange?.(d.getFullYear(), d.getMonth());
  };

  const handleNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setViewDate(d);
    onMonthChange?.(d.getFullYear(), d.getMonth());
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
  
  const days = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    const date = new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1);
    days.push({ date, isCurrentMonth: false });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true });
  }
  
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false });
  }

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-500';
      case 'quiz': return 'bg-purple-500';
      case 'exam': return 'bg-red-500';
      case 'lab': return 'bg-orange-500';
      case 'project': return 'bg-teal-500';
      case 'announcement': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayObj, i) => {
          const isSelected = isSameDay(dayObj.date, selectedDate);
          const isToday = isSameDay(dayObj.date, today);
          const dayEvents = events.filter(e => isSameDay(new Date(e.eventDate), dayObj.date));
          
          return (
            <div 
              key={i}
              onClick={() => onDateSelect(dayObj.date)}
              className={`
                min-h-[64px] p-1 border border-transparent rounded-lg cursor-pointer transition-all flex flex-col items-center
                ${!dayObj.isCurrentMonth ? 'opacity-40' : ''}
                ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-50 text-text-primary'}
                ${isToday && !isSelected ? 'ring-2 ring-primary ring-inset text-primary font-bold' : ''}
              `}
            >
              <span className={`text-sm mt-1 w-7 h-7 flex items-center justify-center rounded-full ${isSelected ? 'font-bold' : ''}`}>
                {dayObj.date.getDate()}
              </span>
              <div className="flex gap-0.5 mt-auto mb-1 flex-wrap justify-center px-1">
                {dayEvents.slice(0, 3).map((e, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getEventColor(e.type)}`} title={e.title} />
                ))}
                {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
