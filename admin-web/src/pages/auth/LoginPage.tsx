import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">

        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your college account</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
                placeholder="your@email.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-base"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Wide tap target for the eye toggle on mobile */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit — tall button, easy to tap on mobile */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 rounded-lg shadow-sm text-base font-semibold text-white bg-primary hover:bg-[#236026] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
