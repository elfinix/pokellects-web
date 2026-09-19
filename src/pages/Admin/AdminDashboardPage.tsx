import React, { useMemo } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  Gamepad2,
  HardDrive,
  ArrowUpRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  BarChart3,
  ExternalLink,
  Flame,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import storageService from '../../services/storageService';
import { ALL_KNOWN_POKEMON_MAP } from '../../services/pokemonIndex';
import { WorkspaceTab } from '../../components/common/AppShell';

interface AdminDashboardPageProps {
  onNavigate?: (tab: WorkspaceTab) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, availableUsers } = useAuth();

  // Live storage queries
  const allDexEntries = useMemo(() => storageService.getAllPokedexEntries(), []);
  const allSessions = useMemo(() => storageService.getArenaSessions(), []);
  const config = useMemo(() => storageService.getGameConfig(), []);
  const flags = useMemo(() => storageService.getFeatureFlags(), []);

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

  // Recent activity stream (combined dex entries and arena sessions)
  const recentActivities = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'dex_entry' | 'arena_session';
      timestamp: string;
      title: string;
      subtitle: string;
      isPositive: boolean;
      user: string;
    }> = [];

    // Map dex unlocks
    allDexEntries.slice(0, 8).forEach((e, idx) => {
      const p = ALL_KNOWN_POKEMON_MAP[e.pokemonId];
      const u = availableUsers.find((user) => user.id === e.userId);
      items.push({
        id: `dex-${idx}-${e.pokemonId}`,
        type: 'dex_entry',
        timestamp: e.unlockedAt,
        title: `Unlocked #${String(e.pokemonId).padStart(4, '0')} ${p?.displayName || 'Unknown'}`,
        subtitle: `Discovery via ${e.discoveryMethod.replace(/_/g, ' ')}`,
        isPositive: true,
        user: u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Trainer',
      });
    });

    // Map recent minigame sessions
    allSessions.slice(0, 8).forEach((s) => {
      const p = ALL_KNOWN_POKEMON_MAP[s.pokemonId];
      const u = availableUsers.find((user) => user.id === s.userId);
      items.push({
        id: s.id,
        type: 'arena_session',
        timestamp: s.playedAt,
        title: `${s.isWon ? 'Won' : 'Attempted'} ${s.gameType.replace(/_/g, ' ')}`,
        subtitle: p ? `Target: ${p.displayName}` : 'Minigame challenge',
        isPositive: s.isWon,
        user: u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Trainer',
      });
    });

    // Sort by timestamp desc
    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [allDexEntries, allSessions, availableUsers]);

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
              6 tables active & synchronized
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

      {/* 2-Column Section: Minigames Matrix + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Minigames Status & Win Rate Matrix (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Minigame Arena Health
              </h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              {allSessions.length} total sessions
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {gameStats.map((game) => (
              <div
                key={game.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {game.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        game.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {game.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {game.totalPlayed} played · {game.wins} won
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Mini Progress Bar */}
                  <div className="w-28 sm:w-36 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Win Rate</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{game.winRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-600 dark:bg-purple-400 transition-all duration-500"
                        style={{ width: `${game.winRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Stream (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Events
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                No recent activity logged yet.
              </p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {act.title}
                    </span>
                    {act.isPositive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{act.user} · {act.subtitle}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
