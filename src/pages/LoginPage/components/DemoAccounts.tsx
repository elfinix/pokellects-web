import React from 'react';
import { DEMO_CREDENTIALS } from '../../../services/mockdata';

interface DemoAccountsProps {
  onSelectAccount: (username: string, pass: string) => void;
}

export const DemoAccounts: React.FC<DemoAccountsProps> = ({ onSelectAccount }) => {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-3 relative z-10">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
        Quick One-Click Demo Logins
      </span>

      <div className="grid grid-cols-2 gap-2">
        {/* Ash Ketchum */}
        <button
          type="button"
          onClick={() => onSelectAccount('ash_ketchum', DEMO_CREDENTIALS.player.password)}
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
          onClick={() => onSelectAccount('serena_kalos', 'PikachuPassword123!')}
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
          onClick={() => onSelectAccount('morgan_dex', 'PikachuPassword123!')}
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
          onClick={() => onSelectAccount('prof_oak', DEMO_CREDENTIALS.admin.password)}
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
  );
};

export default DemoAccounts;
