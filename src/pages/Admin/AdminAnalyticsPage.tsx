import React, { useMemo } from 'react';
import {
  BarChart3,
  Shield,
  BookOpen,
  Gamepad2,
  Trophy,
  Sparkles,
  Layers,
  Compass,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import storageService from '../../services/storageService';
import { ALL_KNOWN_POKEMON, REGION_METADATA } from '../../services/pokemonIndex';

export const AdminAnalyticsPage: React.FC = () => {
  const { availableUsers } = useAuth();

  const allDexEntries = useMemo(() => storageService.getAllPokedexEntries(), []);
  const allSessions = useMemo(() => storageService.getArenaSessions(), []);

  // 1. Generation Breakdown
  const generationStats = useMemo(() => {
    return REGION_METADATA.map((region) => {
      const genPokemon = ALL_KNOWN_POKEMON.filter((p) => p.generation === region.generation);
      const genTotal = genPokemon.length;
      const genIds = new Set(genPokemon.map((p) => p.id));

      const unlockedInGen = allDexEntries.filter((e) => genIds.has(e.pokemonId)).length;
      const uniqueUnlockedInGen = new Set(
        allDexEntries.filter((e) => genIds.has(e.pokemonId)).map((e) => e.pokemonId)
      ).size;

      const completionPct = genTotal > 0 ? Math.round((uniqueUnlockedInGen / genTotal) * 100) : 0;

      return {
        ...region,
        totalSpecies: genTotal,
        uniqueDiscovered: uniqueUnlockedInGen,
        totalUnlocks: unlockedInGen,
        completionPct,
      };
    });
  }, [allDexEntries]);

  // 2. Discovery Methods Distribution
  const discoveryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      starter_grant: 0,
      whos_that_pokemon: 0,
      hangmon: 0,
      identicry: 0,
      manual_dex_input: 0,
    };

    allDexEntries.forEach((e) => {
      const method = e.discoveryMethod || 'manual_dex_input';
      counts[method] = (counts[method] || 0) + 1;
    });

    const labels: Record<string, { label: string; color: string }> = {
      starter_grant: { label: 'Starter Grant', color: 'bg-emerald-500' },
      whos_that_pokemon: { label: "Who's That Pokémon", color: 'bg-purple-500' },
      hangmon: { label: 'Hangmon Deduction', color: 'bg-blue-500' },
      identicry: { label: 'Identicry Audio', color: 'bg-amber-500' },
      manual_dex_input: { label: 'Manual Dex Scan', color: 'bg-indigo-500' },
    };

    const total = allDexEntries.length || 1;
    return Object.entries(counts).map(([key, count]) => {
      const meta = labels[key] || { label: key, color: 'bg-slate-500' };
      const pct = Math.round((count / total) * 100);
      return {
        key,
        label: meta.label,
        color: meta.color,
        count,
        pct,
      };
    });
  }, [allDexEntries]);

  // 3. Minigame Performance Metrics
  const minigameMetrics = useMemo(() => {
    const games = [
      { id: 'whos_that_pokemon', name: "Who's That Pokémon?", color: 'text-purple-600 dark:text-purple-400' },
      { id: 'hangmon', name: 'Hangmon Deduction', color: 'text-blue-600 dark:text-blue-400' },
      { id: 'identicry', name: 'Identicry Audio', color: 'text-amber-600 dark:text-amber-400' },
      { id: 'biologist', name: 'Biologist Lore', color: 'text-teal-600 dark:text-teal-400' },
    ];

    return games.map((g) => {
      const sessions = allSessions.filter((s) => s.gameType === g.id);
      const wins = sessions.filter((s) => s.isWon).length;
      const winRate = sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0;
      const totalTime = sessions.reduce((acc, s) => acc + (s.timeTakenSeconds || 0), 0);
      const avgTime = sessions.length > 0 ? (totalTime / sessions.length).toFixed(1) : '0';

      return {
        ...g,
        total: sessions.length,
        wins,
        winRate,
        avgTime,
      };
    });
  }, [allSessions]);

  // 4. Trainer Leaderboard
  const trainerRanks = useMemo(() => {
    return availableUsers
      .filter((u) => u.role === 'player')
      .map((u) => {
        const player = u as any;
        const unlockedCount = (player.unlockedPokemonIds || []).length;
        const stats = player.stats || { totalGuesses: 0, correctGuesses: 0, arenaWins: 0 };
        const accuracy =
          stats.totalGuesses > 0 ? Math.round((stats.correctGuesses / stats.totalGuesses) * 100) : 0;

        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName || ''}`.trim(),
          username: u.username,
          unlockedCount,
          arenaWins: stats.arenaWins || 0,
          accuracy,
        };
      })
      .sort((a, b) => b.unlockedCount - a.unlockedCount);
  }, [availableUsers]);

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
          System Analytics & Ecosystem Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Aggregated discovery rates across all 9 Pokémon generations, minigame performance curves, and player registration dynamics.
        </p>
      </div>

      {/* Discovery Channels Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Registration Channel Distribution
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {allDexEntries.length} total entries
          </span>
        </div>

        {/* Unified Multi-segment Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          {discoveryBreakdown.map((item) => (
            <div
              key={item.key}
              style={{ width: `${item.pct}%` }}
              className={`${item.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
              title={`${item.label}: ${item.count} (${item.pct}%)`}
            />
          ))}
        </div>

        {/* Breakdown Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {discoveryBreakdown.map((item) => (
            <div
              key={item.key}
              className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {item.count}
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {item.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generation Progress Breakdown (9 Generations) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Regional Pokédex Coverage (Gens 1–9)
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {ALL_KNOWN_POKEMON.length} species registered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {generationStats.map((gen) => (
            <div
              key={gen.generation}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Gen {gen.generation} · {gen.name}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    #{String(gen.startId).padStart(4, '0')} – #{String(gen.endId).padStart(4, '0')}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200/80 dark:border-purple-800/60">
                  {gen.completionPct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${gen.completionPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>{gen.uniqueDiscovered} unique species unlocked</span>
                  <span>{gen.totalSpecies} total</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Section: Minigame Dynamics & Trainer Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minigame Performance Metrics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Minigame Efficiency Matrix
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {minigameMetrics.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className={`text-xs font-bold ${g.color}`}>{g.name}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {g.total} played · {g.wins} victories
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {g.winRate}% Win Rate
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    ~{g.avgTime}s avg duration
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trainer Leaderboard */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Trainer Dex Leaderboard
            </h2>
          </div>

          <div className="space-y-2.5 pt-1">
            {trainerRanks.map((tr, idx) => (
              <div
                key={tr.id}
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-black text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {tr.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      @{tr.username}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono block">
                      {tr.unlockedCount} Dex
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tr.arenaWins} arena wins
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
