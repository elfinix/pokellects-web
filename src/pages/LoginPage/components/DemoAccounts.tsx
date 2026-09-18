import React from 'react';
import { KeyRound } from 'lucide-react';
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
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-rose-500" />
          <span>Demo accounts</span>
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
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
                  ? 'border-rose-400 dark:border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-bold ring-2 ring-rose-500/25 shadow-xs'
                  : 'border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span className="truncate">{user.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected
                    ? 'bg-rose-200/70 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
                    : user.role === 'Admin'
                    ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
