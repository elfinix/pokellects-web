import React, { useState, useMemo } from 'react';
import { Search, BookOpen, X, Users, RotateCcw, ArrowUpRight, Trash2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../context/AuthContext';
import { AppUser, PlayerUser, AdminUser } from '../../types/user';
import { REGION_METADATA } from '../../services/pokemonIndex';
import { useDatabaseVersion } from '../../hooks/useDatabaseVersion';
import storageService from '../../services/storageService';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const AdminUsersPage: React.FC = () => {
  const { availableUsers, currentUser } = useAuth();
  useDatabaseVersion();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const deleteConvexUser = useMutation(api.users.deleteUser);

  const handleDeleteUser = async (user: AppUser) => {
    if (window.confirm(`Are you sure you want to delete @${user.username}? This will permanently cascade-delete all of their Pokédex entries, arena sessions, achievements, and settings.`)) {
      try {
        storageService.deleteUser(user.id);
        try {
          await deleteConvexUser({ userId: user.id as any });
        } catch (err) {
          console.warn('Convex user deletion notice:', err);
        }
        setSelectedUser(null);
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

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
      return true;
    });
  }, [availableUsers, search]);

  const getInitials = (user: AppUser) => {
    const first = user.firstName.trim().charAt(0);
    const last = user.lastName?.trim().charAt(0) || '';
    return `${first}${last}`.toUpperCase() || user.username.slice(0, 2).toUpperCase();
  };

  const selectedUserRegionalCompletion = useMemo(() => {
    if (!selectedUser || selectedUser.role !== 'player') return [];
    const unlocked = new Set((selectedUser as PlayerUser).unlockedPokemonIds || []);
    return REGION_METADATA.map((region) => {
      const total = region.endId - region.startId + 1;
      const collected = Array.from(unlocked).filter((id) => id >= region.startId && id <= region.endId).length;
      return {
        name: region.name,
        collected,
        total,
        percent: Math.round((collected / total) * 100),
      };
    });
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

      {/* Trainer Vault-style toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trainer name, username, or email..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer" aria-label="Clear trainer search">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {search && <div className="pt-2"><button type="button" onClick={() => setSearch('')} className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" />Reset search</button></div>}
      </div>

      {/* Trainer list */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Trainer Ledger <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">· {filteredUsers.length}</span></h2>
          <span className="hidden sm:inline text-[11px] font-mono text-slate-400 dark:text-slate-500">Select a record to inspect progress</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 px-4 sm:px-6">
          {filteredUsers.map((user) => {
            const isActive = currentUser?.id === user.id;
            const isPlayer = user.role === 'player';
            const unlocks = isPlayer ? (user as PlayerUser).unlockedPokemonIds?.length || 0 : 0;

            return (
              <div
                key={user.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${isPlayer ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'}`}
                  >
                    {getInitials(user)}
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

                <div className="flex items-center justify-between w-full sm:w-auto gap-3 self-auto sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-200 dark:hover:border-purple-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="py-14 text-center">
              <Users className="w-7 h-7 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No trainers found</p>
              <p className="mt-1 text-xs text-slate-400">Try another search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${selectedUser.role === 'player' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'}`}
                >
                  {getInitials(selectedUser)}
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

            {/* Player progress aggregate */}
            {selectedUser.role === 'player' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Regional Pokédex Completion</span>
                  </span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{(selectedUser as PlayerUser).unlockedPokemonIds?.length || 0} total</span>
                </div>
                <div className="h-52 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedUserRegionalCompletion} margin={{ top: 8, right: 0, left: -22, bottom: 0 }} barCategoryGap="28%">
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(value, _name, item) => [`${value}% (${item.payload.collected}/${item.payload.total})`, 'Completion']} />
                      <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
                        {selectedUserRegionalCompletion.map((entry) => <Cell key={entry.name} fill={entry.percent > 0 ? '#8b5cf6' : '#cbd5e1'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
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
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200/80 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Trainer
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
