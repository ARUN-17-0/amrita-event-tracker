import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { User, Mail, Shield, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admin Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Admin Profile
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <div className="mt-1 text-gray-900 font-medium">{user?.fullName || 'Administrator'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              <div className="mt-1 text-gray-900 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {user?.email || 'admin@amrita.edu'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <div className="mt-1 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user?.role || 'admin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Appearance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {theme === 'dark-blue' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              Appearance
            </h2>
            <p className="text-sm text-gray-500 mb-4">Choose the colour theme for the admin panel.</p>
            <div className="flex gap-3">
              {/* Light Green */}
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-10 rounded-lg bg-[#F5F7FA] border border-gray-200 flex items-center px-2 gap-1">
                  <div className="w-2 h-6 rounded bg-[#2E7D32]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 bg-gray-300 rounded w-2/3" />
                    <div className="h-1.5 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <span className={`text-xs font-medium ${theme === 'light' ? 'text-primary' : 'text-gray-600'}`}>
                  Light Green
                </span>
                {theme === 'light' && (
                  <span className="text-xs text-primary font-semibold">✓ Active</span>
                )}
              </button>

              {/* Dark Blue */}
              <button
                onClick={() => setTheme('dark-blue')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === 'dark-blue'
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-10 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center px-2 gap-1">
                  <div className="w-2 h-6 rounded bg-[#3B82F6]" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 bg-[#334155] rounded w-2/3" />
                    <div className="h-1.5 bg-[#1E293B] rounded w-1/2" />
                  </div>
                </div>
                <span className={`text-xs font-medium ${theme === 'dark-blue' ? 'text-blue-400' : 'text-gray-600'}`}>
                  Dark Blue
                </span>
                {theme === 'dark-blue' && (
                  <span className="text-xs text-blue-400 font-semibold">✓ Active</span>
                )}
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Version</span>
                <p className="mt-1 text-gray-900">Amrita Event Tracker v1.0.0</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Institution</span>
                <p className="mt-1 text-gray-900">Amrita School of Engineering, Coimbatore</p>
              </div>
              {import.meta.env.VITE_USE_MOCK === 'true' && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                  <strong>Mock Mode Enabled:</strong> The application is running with mock data.
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
