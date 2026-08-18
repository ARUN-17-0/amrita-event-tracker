import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarDays, Building2, GraduationCap, 
  Users, BookOpen, UserCog, UserCheck, Shield, FileText, 
  Settings, ChevronLeft, ChevronRight, Activity 
} from 'lucide-react';

export interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/departments', label: 'Departments', icon: Building2 },
  { path: '/semesters', label: 'Semesters', icon: GraduationCap },
  { path: '/sections', label: 'Sections', icon: Users },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/faculty', label: 'Faculty', icon: UserCog },
  { path: '/students', label: 'Students', icon: UserCheck },
  { path: '/crs', label: 'CRs', icon: Shield },
  { path: '/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside 
      className={`fixed top-0 left-0 h-full bg-surface border-r border-border flex flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3 text-primary overflow-hidden whitespace-nowrap">
          <Activity className="w-8 h-8 shrink-0" />
          {!collapsed && <span className="font-bold text-lg tracking-tight">Amrita Event Tracker</span>}
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
              ${isActive 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
              }
            `}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-text-secondary hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
