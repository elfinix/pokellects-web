import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS, MOCK_PLAYERS, MOCK_ADMIN } from '../services/mockdata';
import { GENDER_ICON_COLORS } from '../types/user';

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding, onLoginSuccess }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState(DEMO_CREDENTIALS.player.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.player.password);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Please enter your email or username.");
      return;
    }

    const success = login(identifier, password);
    if (success) {
      onLoginSuccess();
    } else {
      setErrorMessage("Invalid credentials. Try using one of the one-click demo accounts below.");
    }
  };

  const handleDemoSelect = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white">
      {/* Top Bar with Back Button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            P
          </div>
          <span className="font-extrabold text-sm text-slate-900 font-display">Pokellects</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="space-y-2 text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to continue building and completing your personal Pokédex.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Username / Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ash_ketchum or ash@pokellects.dev"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Demo enabled</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
            >
              <span>Sign In to Pokellects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-slate-100 space-y-3 relative z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick One-Click Demo Logins
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Ash Ketchum */}
              <button
                type="button"
                onClick={() => handleDemoSelect('ash_ketchum', DEMO_CREDENTIALS.player.password)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-left transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  ♂
                </span>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">Ash Ketchum</div>
                  <div className="text-[10px] text-slate-500 truncate">Player (Male)</div>
                </div>
              </button>

              {/* Serena Yvonne */}
              <button
                type="button"
                onClick={() => handleDemoSelect('serena_kalos', 'PikachuPassword123!')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-left transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold shrink-0">
                  ♀
                </span>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">Serena Yvonne</div>
                  <div className="text-[10px] text-slate-500 truncate">Player (Female)</div>
                </div>
              </button>

              {/* Morgan */}
              <button
                type="button"
                onClick={() => handleDemoSelect('morgan_dex', 'PikachuPassword123!')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-left transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                  ✦
                </span>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">Morgan</div>
                  <div className="text-[10px] text-slate-500 truncate">Player (Non-binary)</div>
                </div>
              </button>

              {/* Prof. Oak (Admin) */}
              <button
                type="button"
                onClick={() => handleDemoSelect('prof_oak', DEMO_CREDENTIALS.admin.password)}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-left transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  ♂
                </span>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">Prof. Oak</div>
                  <div className="text-[10px] text-purple-700 font-semibold truncate">Admin / R&D</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="text-center text-xs text-slate-400">
        Pokellects Authentication • Secure SQLite & Session Architecture
      </footer>
    </div>
  );
};

export default LoginPage;
