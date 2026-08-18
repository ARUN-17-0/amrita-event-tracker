import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, LogOut } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';
// import { useNotifications } from '@/hooks/useNotifications';

export interface AdminTopBarProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuToggle, sidebarCollapsed }) => {
  // Stubbing hooks for now since they aren't provided
  const user = { fullName: 'Admin User', email: 'admin@amrita.edu' };
  const logout = async () => {};
  const unreadCount = 3;

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-surface border-b border-border flex items-center justify-between px-4 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20 lg:left-20' : 'left-0 lg:left-64'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-text-secondary hover:bg-gray-100 rounded-xl lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search events, users, or departments..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-text-secondary hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          )}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-text-primary leading-tight">{user.fullName}</span>
              <span className="text-xs text-text-secondary leading-tight">Admin</span>
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary truncate">{user.fullName}</p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-text-secondary" /> Settings
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
