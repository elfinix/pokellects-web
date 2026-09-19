import React, { useMemo } from 'react';
import {
  Users,
  BookOpen,
  Gamepad2,
  HardDrive,
  ArrowUpRight,
  Sliders,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import storageService from '../../services/storageService';
import { REGION_METADATA } from '../../services/pokemonIndex';
import { WorkspaceTab } from '../../components/common/AppShell';
import { useDatabaseVersion } from '../../hooks/useDatabaseVersion';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AdminDashboardPageProps {
  onNavigate?: (tab: WorkspaceTab) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, availableUsers } = useAuth();
  const databaseVersion = useDatabaseVersion();

  // Live storage queries
  const allDexEntries = useMemo(() => storageService.getAllPokedexEntries(), [databaseVersion]);
  const allSessions = useMemo(() => storageService.getArenaSessions(), [databaseVersion]);
  const config = useMemo(() => storageService.getGameConfig(), [databaseVersion]);
  const flags = useMemo(() => storageService.getFeatureFlags(), [databaseVersion]);

  // Aggregated platform stats
  const playersCount = availableUsers.filter((u) => u.role === 'player').length;
  const adminCount = availableUsers.filter((u) => u.role === 'admin').length;
  const totalRegistrations = allDexEntries.length;

  const totalMinigames = allSessions.length;
  const wonMinigames = allSessions.filter((s) => s.isWon).length;
  const platformWinRate = totalMinigames > 0 ? Math.round((wonMinigames / totalMinigames) * 100) : 0;

  // Minigame breakdowns
  const gameStats = useMemo(() => {
    const games = [
      { id: 'whos_that_pokemon', name: "Who's That Pokémon?", color: 'purple', enabled: flags.enableWhosThatPokemon },
      { id: 'hangmon', name: 'Hangmon Deduction', color: 'blue', enabled: flags.enableHangmon },
      { id: 'identicry', name: 'Identicry Audio Quiz', color: 'amber', enabled: flags.enableIdenticry },
      { id: 'biologist', name: 'Biologist Field Notes', color: 'teal', enabled: true },
      { id: 'pokedle', name: 'Pokédle Matrix', color: 'slate', enabled: flags.enablePokedlePreview },
    ];

    return games.map((g) => {
      const sessions = allSessions.filter((s) => s.gameType === g.id);
      const wins = sessions.filter((s) => s.isWon).length;
      const rate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;
      return {
        ...g,
        totalPlayed: sessions.length,
        wins,
        winRate: rate,
      };
    });
  }, [allSessions, flags]);

  const regionalCompletion = useMemo(() => REGION_METADATA.map((region) => {
    const total = region.endId - region.startId + 1;
    const uniqueCollected = new Set(allDexEntries
      .filter((entry) => entry.pokemonId >= region.startId && entry.pokemonId <= region.endId)
      .map((entry) => entry.pokemonId));
    const collected = uniqueCollected.size;
    return { ...region, total, collected, percent: Math.round((collected / total) * 100) };
  }), [allDexEntries]);
  const regionalChartMax = Math.max(10, Math.ceil(Math.max(...regionalCompletion.map((region) => region.percent)) / 5) * 5);

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
            System Control & Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Logged in as <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.firstName} {currentUser?.lastName || ''}</span> ({currentUser?.username}). Live metrics synchronized with local SQLite database.
          </p>
        </div>

        {/* Header Action Tools */}
        {onNavigate && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('admin-config')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure System</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Top Executive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Trainers */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trainers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
              {availableUsers.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {playersCount} Active Players · {adminCount} Admin
            </div>
          </div>
        </div>

        {/* Card 2: Pokédex Registrations */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dex Entries
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
              {totalRegistrations}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Across all registered accounts
            </div>
          </div>
        </div>

        {/* Card 3: Minigames Played */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Minigame Battles
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
              {totalMinigames}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
              {platformWinRate}% Platform Win Rate
            </div>
          </div>
        </div>

        {/* Card 4: SQLite Database Health */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Local SQLite
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-display tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>data/pokellects.db</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live records synchronized from SQLite
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigate?.('admin-users')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all text-left group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              User Directory & Permissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Inspect player Pokédex entries, battle wins, role flags, and registration records.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('admin-analytics')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/80 transition-all text-left group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Platform Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generation completion curves, minigame accuracy, and discovery method metrics.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('admin-config')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/80 transition-all text-left group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Minigame & System Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Adjust minigame timers, strike thresholds, hint flags, and enabled generations.
            </p>
          </div>
        </button>
      </div>

      {/* Aggregate regional completion + Minigame health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aggregate regional completion */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Regional Completion
              </h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              unique species across all trainers
            </span>
          </div>

          <div className="flex-1 min-h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalCompletion} margin={{ top: 8, right: 4, left: -22, bottom: 0 }} barCategoryGap="22%">
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[0, regionalChartMax]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} tickCount={5} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(value, _name, item) => [`${value}% (${item.payload.collected}/${item.payload.total})`, 'Completion']} />
                <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={34}>
                  {regionalCompletion.map((region) => <Cell key={region.generation} fill="#6366f1" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Minigame health */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Minigames Health
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {allSessions.length} sessions
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {gameStats.map((game) => <div key={game.id} className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{game.name}</span><span className={`text-[10px] font-bold ${game.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{game.enabled ? 'Active' : 'Off'}</span></div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400"><span>{game.wins}/{game.totalPlayed} wins</span><span className="font-bold">{game.winRate}%</span></div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-purple-600" style={{ width: `${game.winRate}%` }} /></div>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
