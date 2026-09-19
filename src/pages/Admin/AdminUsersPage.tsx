import React, { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  Award,
  CheckCircle2,
  Search,
  BookOpen,
  Gamepad2,
  Calendar,
  Building,
  Mail,
  UserCheck,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppUser, GENDER_ICON_COLORS, PlayerUser, AdminUser } from '../../types/user';
import storageService from '../../services/storageService';
import { ALL_KNOWN_POKEMON_MAP } from '../../services/pokemonIndex';

export const AdminUsersPage: React.FC = () => {
  const { availableUsers, currentUser, switchUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'player' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

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

  const selectedUserUnlockedPokemon = useMemo(() => {
    if (!selectedUser || selectedUser.role !== 'player') return [];
    const player = selectedUser as PlayerUser;
    return (player.unlockedPokemonIds || []).map((id) => ALL_KNOWN_POKEMON_MAP[id]).filter(Boolean);
  }, [selectedUser]);

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
          Registered Trainer Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Inspect player progress, Pokédex completion rates, role permissions, and active SQLite credential records.
        </p>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Trainer Ledger ({filteredUsers.length})
          </h2>

          {/* Directory Toolbox: Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trainers..."
                className="pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-purple-500 dark:focus:border-purple-500 transition-all w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['all', 'player', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.map((user) => {
            const isActive = currentUser?.id === user.id;
            const genderMeta = GENDER_ICON_COLORS[user.gender];
            const isPlayer = user.role === 'player';
            const unlocks = isPlayer ? (user as PlayerUser).unlockedPokemonIds?.length || 0 : 0;

            return (
              <div
                key={user.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${genderMeta.bg} ${genderMeta.text}`}
                  >
                    {user.gender === 'male' ? '♂' : user.gender === 'female' ? '♀' : '✦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left cursor-pointer"
                      >
                        {user.firstName} {user.lastName || ''}
                      </button>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          user.role === 'admin'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      @{user.username} • {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {isPlayer && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Unlocks:{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">{unlocks}</span>
                    </span>
                  )}
                  {!isPlayer && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {(user as AdminUser).department || 'Administration'}
                    </span>
                  )}

                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Details Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    GENDER_ICON_COLORS[selectedUser.gender].bg
                  } ${GENDER_ICON_COLORS[selectedUser.gender].text}`}
                >
                  {selectedUser.gender === 'male' ? '♂' : selectedUser.gender === 'female' ? '♀' : '✦'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedUser.firstName} {selectedUser.lastName || ''}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">@{selectedUser.username}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Field Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Role
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {selectedUser.role}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Account ID
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {selectedUser.id}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Email Address
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {selectedUser.email}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Birthday
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedUser.birthday}
                </span>
              </div>
            </div>

            {/* Player Specific Stats & Unlocked Badge preview */}
            {selectedUser.role === 'player' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Unlocked Pokédex Entries ({(selectedUser as PlayerUser).unlockedPokemonIds?.length || 0})</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  {selectedUserUnlockedPokemon.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No Pokémon unlocked yet.</span>
                  ) : (
                    selectedUserUnlockedPokemon.map((p) => (
                      <span
                        key={p.id}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                      >
                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                          #{String(p.id).padStart(4, '0')}
                        </span>
                        <span>{p.displayName}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              {currentUser?.id !== selectedUser.id && (
                <button
                  type="button"
                  onClick={() => {
                    switchUser(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Switch to this User</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
