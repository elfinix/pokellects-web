import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  identifier: string;
  setIdentifier: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errorMessage: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  identifier,
  setIdentifier,
  password,
  setPassword,
  errorMessage,
  onSubmit,
  isSubmitting = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'id' | 'pass' | null>(null);

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Username or Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Username or Email
          </label>
          <div
            className={`relative rounded-2xl transition-all duration-200 ${
              focusedField === 'id' ? 'ring-2 ring-rose-500/20' : ''
            }`}
          >
            <Mail
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                focusedField === 'id' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onFocus={() => setFocusedField('id')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. ash_ketchum or ash@pokellects.dev"
              autoComplete="username"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-rose-400 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Password
          </label>
          <div
            className={`relative rounded-2xl transition-all duration-200 ${
              focusedField === 'pass' ? 'ring-2 ring-rose-500/20' : ''
            }`}
          >
            <Lock
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                focusedField === 'pass' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('pass')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-rose-400 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button with Rich Brand Gradient & Sheen */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.985 }}
          className="w-full mt-1.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer relative overflow-hidden disabled:opacity-70"
        >
          {/* Subtle button sheen swipe on hover */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out pointer-events-none" />

          <span className="relative z-10">{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </form>
    </div>
  );
};

export default LoginForm;
