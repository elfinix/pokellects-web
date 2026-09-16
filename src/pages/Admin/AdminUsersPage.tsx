import React, { useState, useMemo } from 'react';
import { Users, Shield, Award, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GENDER_ICON_COLORS } from '../../types/user';

export const AdminUsersPage: React.FC = () => {
  const { availableUsers, currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'player' | 'admin'>('all');

  const filteredUsers = useMemo(() => {
    return availableUsers.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          u.username.toLowerCase().includes(q) ||
          u.firstName.toLowerCase().includes(q) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          u.email.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      return true;
    });
  }, [availableUsers, search, roleFilter]);

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 max-w-5xl">
      <div className="space-y-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span>Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
          Registered Trainer Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Inspect player progress, role permissions, and active SQLite credential records.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">User Ledger ({filteredUsers.length})</h2>

          {/* Universal Directory Toolbox */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trainers..."
                className="pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-500 focus:bg-white transition-all w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'player', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredUsers.map((user) => {
            const isActive = currentUser?.id === user.id;
            const genderMeta = GENDER_ICON_COLORS[user.gender];
            return (
              <div
                key={user.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${genderMeta.bg} ${genderMeta.text}`}
                  >
                    {user.gender === 'male' ? '♂' : user.gender === 'female' ? '♀' : '✦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {user.firstName} {user.lastName || ''}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">@{user.username} • {user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {user.role === 'player' && (
                    <span className="text-xs text-slate-500">
                      Unlocks: <span className="font-bold text-slate-800">{(user as any).unlockedPokemonIds?.length || 0}</span>
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="text-xs text-purple-700 font-medium">
                      {(user as any).department}
                    </span>
                  )}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs text-slate-400 font-medium">
                      Offline
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
