import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Building2, GraduationCap,
  Users, BookOpen, UserCog, UserCheck, Shield, FileText,
  Settings, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void;
}

const allNavItems = [
  { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, roles: ['admin', 'faculty', 'cr', 'student'] },
  { path: '/calendar',    label: 'Calendar',    icon: CalendarDays,     roles: ['admin', 'faculty', 'cr', 'student'] },
  { path: '/departments', label: 'Departments', icon: Building2,        roles: ['admin'] },
  { path: '/semesters',   label: 'Semesters',   icon: GraduationCap,    roles: ['admin'] },
  { path: '/sections',    label: 'Sections',    icon: Users,            roles: ['admin', 'faculty', 'cr', 'student'] },
  { path: '/subjects',    label: 'Subjects',    icon: BookOpen,         roles: ['admin', 'faculty', 'cr', 'student'] },
  { path: '/faculty',     label: 'Faculty',     icon: UserCog,          roles: ['admin'] },
  { path: '/students',    label: 'Students',    icon: UserCheck,        roles: ['admin'] },
  { path: '/crs',         label: 'CRs',         icon: Shield,           roles: ['admin'] },
  { path: '/audit-logs',  label: 'Audit Logs',  icon: FileText,         roles: ['admin'] },
  { path: '/settings',    label: 'Settings',    icon: Settings,         roles: ['admin', 'faculty', 'cr', 'student'] },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, onNavClick }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'admin';
  const navItems = allNavItems.filter((item) => item.roles.includes(currentRole));
  return (
    <aside
      className={`h-full bg-surface border-r border-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 text-primary overflow-hidden whitespace-nowrap">
          <Activity className="w-8 h-8 shrink-0" />
          {!collapsed && (
            <span className="font-bold text-base tracking-tight leading-tight">
              Amrita Event<br />Tracker
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="p-3 border-t border-border shrink-0 hidden lg:block">
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
