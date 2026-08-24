import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Shield, LogOut, Sun, Moon, KeyRound, Check, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerMockCredential } from "@/services/authService";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [pwForm, setPwForm] = useState({ newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    faculty: "Faculty",
    course_mentor: "Course Mentor",
    cr: "Class Representative",
    student: "Student",
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    if (user) registerMockCredential(user, pwForm.newPw);
    setPwSuccess(true);
    setPwForm({ newPw: "", confirm: "" });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, appearance, and account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Profile card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary to-primary-light" />
            <div className="px-6 pb-6">
              <div className="-mt-10 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary select-none">
                  {initials}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.fullName || "Administrator"}</h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary capitalize">
                  {roleLabel[user?.role ?? "admin"] ?? user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-5">

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-7">Update your login password at any time.</p>

            {pwSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 mb-4">
                <Check className="w-4 h-4 shrink-0" /> Password updated successfully!
              </div>
            )}
            {pwError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">{pwError}</div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl text-sm focus:ring-primary focus:border-primary"
                  placeholder="Min. 6 characters"
                  value={pwForm.newPw}
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-primary focus:border-primary"
                  placeholder="Re-enter new password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors">
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              {theme === "dark-blue" ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-7">Choose a colour theme for the panel.</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "light", label: "Light Green", preview: <div className="w-full h-12 rounded-lg bg-[#F5F7FA] border border-gray-200 flex items-center px-3 gap-2"><div className="w-2 h-7 rounded bg-[#2E7D32]" /><div className="flex-1 space-y-1.5"><div className="h-2 bg-gray-300 rounded w-3/4" /><div className="h-2 bg-gray-200 rounded w-1/2" /></div></div> },
                { key: "dark-blue", label: "Dark Blue", preview: <div className="w-full h-12 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center px-3 gap-2"><div className="w-2 h-7 rounded bg-[#3B82F6]" /><div className="flex-1 space-y-1.5"><div className="h-2 bg-[#334155] rounded w-3/4" /><div className="h-2 bg-[#1E293B] rounded w-1/2" /></div></div> },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key as any)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === t.key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
                >
                  {t.preview}
                  <span className={`text-sm font-semibold ${theme === t.key ? "text-primary" : "text-gray-600"}`}>
                    {t.label} {theme === t.key && "✓"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Application Info</h3>
            <div className="divide-y divide-gray-100 text-sm">
              {[
                ["Version", "v1.2.0"],
                ["Institution", "Amrita School of Engineering, Bengaluru"],
                ["Mode", import.meta.env.VITE_USE_MOCK === "true" ? "Mock / Offline" : "Firebase / Live"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
