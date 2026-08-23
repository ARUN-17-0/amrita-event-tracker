import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export interface AdminTopBarProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
  isMobile?: boolean;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuToggle, sidebarCollapsed, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  // On mobile: always full width (left-0). On desktop: offset by sidebar width.
  const leftClass = isMobile
    ? 'left-0'
    : sidebarCollapsed
    ? 'left-20'
    : 'left-64';

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface border-b border-border flex items-center justify-between px-4 z-30 transition-all duration-300 ${leftClass}`}
    >
      {/* Left: hamburger + page title area */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-1 text-text-secondary hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* App name on mobile */}
        <span className="font-semibold text-text-primary text-sm truncate lg:hidden">
          Amrita Event Tracker
        </span>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2">
        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
              {initials}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-text-primary leading-tight max-w-[120px] truncate">
                {user?.fullName || 'Admin'}
              </span>
              <span className="text-xs text-text-secondary capitalize">{user?.role || 'admin'}</span>
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
                  <p className="text-sm font-medium text-text-primary truncate">{user?.fullName}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-text-secondary" /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
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
