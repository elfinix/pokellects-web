import React from 'react';
import { Sparkles } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../../../services/mockdata';

export interface DemoUser {
  id: string;
  username: string;
  name: string;
  role: string;
  password: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'ash',
    username: DEMO_CREDENTIALS.player.username,
    name: 'Ash Ketchum',
    role: 'Player',
    password: DEMO_CREDENTIALS.player.password,
  },
  {
    id: 'serena',
    username: 'serena_kalos',
    name: 'Serena Yvonne',
    role: 'Player',
    password: 'PikachuPassword123!',
  },
  {
    id: 'morgan',
    username: 'morgan_dex',
    name: 'Morgan Vale',
    role: 'Player',
    password: 'PikachuPassword123!',
  },
  {
    id: 'oak',
    username: DEMO_CREDENTIALS.admin.username,
    name: 'Prof. Oak',
    role: 'Admin',
    password: DEMO_CREDENTIALS.admin.password,
  },
];

interface DemoAccountsProps {
  activeUsername: string;
  onSelectAccount: (username: string, pass: string) => void;
}

export const DemoAccounts: React.FC<DemoAccountsProps> = ({ activeUsername, onSelectAccount }) => {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Demo accounts</span>
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          Click to autofill
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_USERS.map((user) => {
          const isSelected = activeUsername.toLowerCase() === user.username.toLowerCase();
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelectAccount(user.username, user.password)}
              className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                isSelected
                  ? 'border-rose-400 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-500/25 shadow-xs'
                  : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="truncate">{user.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected
                    ? 'bg-rose-200/70 text-rose-800'
                    : user.role === 'Admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {user.role}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccounts;
