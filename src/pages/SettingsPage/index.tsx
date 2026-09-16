import React from 'react';
import { Settings, Volume2, Sparkles, Keyboard, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, isPlayer } = useAuth();

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-slate-700" />
          <span>Trainer Settings & Hotkeys</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure personal workspace preferences and inspect keyboard shortcuts.
        </p>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Keyboard className="w-4 h-4 text-red-600" />
          <h2 className="text-base font-bold">Ergonomic Keyboard Shortcuts</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {[
            { key: 'Enter', label: 'Register Input', desc: 'Confirm species in the floating Pokédex omnibar' },
            { key: 'Escape', label: 'Dismiss Dialog', desc: 'Close detail modal and immediately restore omnibar focus' },
            { key: '/', label: 'Quick Search', desc: 'Focus the Pokédex Toolbox search input' },
            { key: 'Tab', label: 'Field Traversal', desc: 'Cycle through filter options and interactive cards' },
          ].map((sc) => (
            <div key={sc.key} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">{sc.label}</span>
                <span className="text-[11px] text-slate-400 block">{sc.desc}</span>
              </div>
              <kbd className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Profile & Account Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Trainer Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Full Name</span>
            <span className="font-bold text-slate-800">{currentUser?.firstName} {currentUser?.lastName || ''}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Username</span>
            <span className="font-bold text-slate-800">@{currentUser?.username}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Email Address</span>
            <span className="font-bold text-slate-800">{currentUser?.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Role Clearance</span>
            <span className="font-bold text-red-600 capitalize">{currentUser?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
