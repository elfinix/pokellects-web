import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  BookOpen,
  MapPin,
  Flame,
  Gamepad2,
  Lock,
  Search,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  BookMarked,
  Volume2,
  Zap,
  Skull,
  Droplets,
  Leaf,
  Eye,
  Ghost,
  ShieldAlert,
} from 'lucide-react';
import { usePokedex } from '../../context/PokedexContext';
import { useAuth } from '../../context/AuthContext';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';

interface AchievementGroup {
  id: string;
  category: 'dex' | 'region' | 'type' | 'games';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  milestones: number[];
  currentVal: number;
}

export const AchievementsPage: React.FC = () => {
  const { stats, allPokemon, unlockedIds } = usePokedex();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 'dex' | 'region' | 'type' | 'games'>('all');

  // Compute Type Totals and Unlocked Counts dynamically from all 1,025 Pokémon
  const typeStats = useMemo(() => {
    const totalByType: Record<string, number> = {};
    const unlockedByType: Record<string, number> = {};

    allPokemon.forEach((p) => {
      p.types.forEach((t) => {
        totalByType[t] = (totalByType[t] || 0) + 1;
        if (unlockedIds.includes(p.id)) {
          unlockedByType[t] = (unlockedByType[t] || 0) + 1;
        }
      });
    });

    return { totalByType, unlockedByType };
  }, [allPokemon, unlockedIds]);

  const rawStats = (currentUser as any)?.stats || {};
  const gameWins = {
    wtp: rawStats.wtpWins || 3,
    hangmon: rawStats.hangmonWins || 2,
    identicry: rawStats.identicryWins || 2,
    biologist: rawStats.biologistWins || 1,
  };

  // 1. Grouped Achievements Data
  const ALL_ACHIEVEMENTS: AchievementGroup[] = useMemo(() => {
    const kantoTotal = stats.byGeneration[1]?.total || 151;
    const johtoTotal = stats.byGeneration[2]?.total || 100;
    const hoennTotal = stats.byGeneration[3]?.total || 135;
    const sinnohTotal = stats.byGeneration[4]?.total || 107;
    const unovaTotal = stats.byGeneration[5]?.total || 156;
    const kalosTotal = stats.byGeneration[6]?.total || 72;
    const alolaTotal = stats.byGeneration[7]?.total || 88;
    const galarTotal = stats.byGeneration[8]?.total || 96;
    const paldeaTotal = stats.byGeneration[9]?.total || 120;

    const poisonTotal = typeStats.totalByType['poison'] || 104;
    const fireTotal = typeStats.totalByType['fire'] || 86;
    const waterTotal = typeStats.totalByType['water'] || 161;
    const grassTotal = typeStats.totalByType['grass'] || 124;
    const electricTotal = typeStats.totalByType['electric'] || 73;
    const psychicTotal = typeStats.totalByType['psychic'] || 107;
    const ghostTotal = typeStats.totalByType['ghost'] || 70;
    const dragonTotal = typeStats.totalByType['dragon'] || 74;

    return [
      // --- 1. DEX COMPLETION ---
      {
        id: 'dex_grand_scholar',
        category: 'dex',
        title: 'Grand Pokédex Scholar',
        description: 'Catalog species to complete your worldwide Pokédex encyclopaedia.',
        icon: BookOpen,
        iconBg: 'bg-red-50 text-red-600 border-red-200',
        iconColor: 'text-red-600',
        milestones: [1, 10, 25, 50, 100, 200, 500, 750, 1000, 1025],
        currentVal: stats.totalUnlocked,
      },

      // --- 2. REGION COMPLETION ---
      {
        id: 'region_kanto',
        category: 'region',
        title: 'Kanto Region Pioneer',
        description: 'Catalog native species from the Kanto Region (Gen 1).',
        icon: MapPin,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        iconColor: 'text-emerald-600',
        milestones: [1, 10, 50, 100, kantoTotal],
        currentVal: stats.byGeneration[1]?.unlocked || 0,
      },
      {
        id: 'region_johto',
        category: 'region',
        title: 'Johto Region Explorer',
        description: 'Catalog native species from the Johto Region (Gen 2).',
        icon: MapPin,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
        iconColor: 'text-amber-600',
        milestones: [1, 10, 50, johtoTotal],
        currentVal: stats.byGeneration[2]?.unlocked || 0,
      },
      {
        id: 'region_hoenn',
        category: 'region',
        title: 'Hoenn Region Voyager',
        description: 'Catalog native species from the Hoenn Region (Gen 3).',
        icon: MapPin,
        iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
        iconColor: 'text-blue-600',
        milestones: [1, 10, 50, 100, hoennTotal],
        currentVal: stats.byGeneration[3]?.unlocked || 0,
      },
      {
        id: 'region_sinnoh',
        category: 'region',
        title: 'Sinnoh Region Mountaineer',
        description: 'Catalog native species from the Sinnoh Region (Gen 4).',
        icon: MapPin,
        iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
        iconColor: 'text-cyan-600',
        milestones: [1, 10, 50, sinnohTotal],
        currentVal: stats.byGeneration[4]?.unlocked || 0,
      },
      {
        id: 'region_unova',
        category: 'region',
        title: 'Unova Region Metropolitan',
        description: 'Catalog native species from the Unova Region (Gen 5).',
        icon: MapPin,
        iconBg: 'bg-slate-100 text-slate-600 border-slate-300',
        iconColor: 'text-slate-600',
        milestones: [1, 10, 50, 100, unovaTotal],
        currentVal: stats.byGeneration[5]?.unlocked || 0,
      },
      {
        id: 'region_kalos',
        category: 'region',
        title: 'Kalos Region Aristocrat',
        description: 'Catalog native species from the Kalos Region (Gen 6).',
        icon: MapPin,
        iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        iconColor: 'text-indigo-600',
        milestones: [1, 10, 50, kalosTotal],
        currentVal: stats.byGeneration[6]?.unlocked || 0,
      },
      {
        id: 'region_alola',
        category: 'region',
        title: 'Alola Island Navigator',
        description: 'Catalog native species from the Alola Region (Gen 7).',
        icon: MapPin,
        iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
        iconColor: 'text-orange-600',
        milestones: [1, 10, 50, alolaTotal],
        currentVal: stats.byGeneration[7]?.unlocked || 0,
      },
      {
        id: 'region_galar',
        category: 'region',
        title: 'Galar Crown Champion',
        description: 'Catalog native species from the Galar Region (Gen 8).',
        icon: MapPin,
        iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
        iconColor: 'text-sky-600',
        milestones: [1, 10, 50, galarTotal],
        currentVal: stats.byGeneration[8]?.unlocked || 0,
      },
      {
        id: 'region_paldea',
        category: 'region',
        title: 'Paldea Terastal Pioneer',
        description: 'Catalog native species from the Paldea Region (Gen 9).',
        icon: MapPin,
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
        iconColor: 'text-purple-600',
        milestones: [1, 10, 50, paldeaTotal],
        currentVal: stats.byGeneration[9]?.unlocked || 0,
      },

      // --- 3. TYPE COMPLETION ---
      {
        id: 'type_toxicologist',
        category: 'type',
        title: 'Expert Toxicologist (Poison)',
        description: 'Document venomous and hazardous Poison-type Pokémon across all regions.',
        icon: Skull,
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
        iconColor: 'text-purple-600',
        milestones: [1, 10, 25, 50, poisonTotal],
        currentVal: typeStats.unlockedByType['poison'] || 0,
      },
      {
        id: 'type_pyromancer',
        category: 'type',
        title: 'Flame Keeper (Fire)',
        description: 'Register blazing and fiery Fire-type Pokémon across all regions.',
        icon: Flame,
        iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
        iconColor: 'text-orange-600',
        milestones: [1, 10, 25, 50, fireTotal],
        currentVal: typeStats.unlockedByType['fire'] || 0,
      },
      {
        id: 'type_hydromancer',
        category: 'type',
        title: 'Ocean Master (Water)',
        description: 'Catalog aquatic and marine Water-type Pokémon across all regions.',
        icon: Droplets,
        iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
        iconColor: 'text-blue-600',
        milestones: [1, 10, 25, 50, 100, waterTotal],
        currentVal: typeStats.unlockedByType['water'] || 0,
      },
      {
        id: 'type_botanist',
        category: 'type',
        title: 'Forest Guardian (Grass)',
        description: 'Register nature-attuned Grass-type Pokémon across all regions.',
        icon: Leaf,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        iconColor: 'text-emerald-600',
        milestones: [1, 10, 25, 50, grassTotal],
        currentVal: typeStats.unlockedByType['grass'] || 0,
      },
      {
        id: 'type_electromancer',
        category: 'type',
        title: 'Thunder Lord (Electric)',
        description: 'Harness high-voltage Electric-type Pokémon across all regions.',
        icon: Zap,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
        iconColor: 'text-amber-600',
        milestones: [1, 10, 25, 50, electricTotal],
        currentVal: typeStats.unlockedByType['electric'] || 0,
      },
      {
        id: 'type_psychic',
        category: 'type',
        title: 'Mind Seer (Psychic)',
        description: 'Document telekinetic Psychic-type Pokémon across all regions.',
        icon: Eye,
        iconBg: 'bg-pink-50 text-pink-600 border-pink-200',
        iconColor: 'text-pink-600',
        milestones: [1, 10, 25, 50, psychicTotal],
        currentVal: typeStats.unlockedByType['psychic'] || 0,
      },
      {
        id: 'type_ghost',
        category: 'type',
        title: 'Spectral Whisperer (Ghost)',
        description: 'Capture mysterious and ethereal Ghost-type Pokémon in your ledger.',
        icon: Ghost,
        iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        iconColor: 'text-indigo-600',
        milestones: [1, 5, 15, 35, ghostTotal],
        currentVal: typeStats.unlockedByType['ghost'] || 0,
      },
      {
        id: 'type_dragon',
        category: 'type',
        title: 'Dragon Tamer (Dragon)',
        description: 'Catalog mythical and draconic Dragon-type Pokémon across all regions.',
        icon: ShieldAlert,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
        iconColor: 'text-rose-600',
        milestones: [1, 5, 15, 30, dragonTotal],
        currentVal: typeStats.unlockedByType['dragon'] || 0,
      },

      // --- 4. GAME COMPETENCE ---
      {
        id: 'game_wtp',
        category: 'games',
        title: "Who's That Pokémon Champion",
        description: 'Identify species instantly from their iconic battle silhouettes.',
        icon: HelpCircle,
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
        iconColor: 'text-purple-600',
        milestones: [1, 5, 10, 25, 50, 100],
        currentVal: gameWins.wtp,
      },
      {
        id: 'game_hangmon',
        category: 'games',
        title: 'Hangmon Word Sleuth',
        description: 'Deduce hidden Pokémon names letter-by-letter before running out of attempts.',
        icon: BookMarked,
        iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
        iconColor: 'text-blue-600',
        milestones: [1, 5, 10, 25, 50, 100],
        currentVal: gameWins.hangmon,
      },
      {
        id: 'game_identicry',
        category: 'games',
        title: 'Identicry Sound Hunter',
        description: 'Discern Pokémon species solely from their genuine audio cries.',
        icon: Volume2,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
        iconColor: 'text-amber-600',
        milestones: [1, 5, 10, 25, 50, 100],
        currentVal: gameWins.identicry,
      },
      {
        id: 'game_biologist',
        category: 'games',
        title: 'Biolo-gist Field Specialist',
        description: 'Answer scientific Pokédex biology and lore queries without mistake.',
        icon: Zap,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        iconColor: 'text-emerald-600',
        milestones: [1, 5, 10, 25, 50, 100],
        currentVal: gameWins.biologist,
      },
    ];
  }, [stats, typeStats, gameWins]);

  // Compute completed / in-progress metadata for each achievement
  const evaluatedAchievements = useMemo(() => {
    return ALL_ACHIEVEMENTS.map((ach) => {
      let completedMilestonesCount = 0;
      let nextMilestone = ach.milestones[ach.milestones.length - 1];

      for (let i = 0; i < ach.milestones.length; i++) {
        if (ach.currentVal >= ach.milestones[i]) {
          completedMilestonesCount = i + 1;
        } else {
          nextMilestone = ach.milestones[i];
          break;
        }
      }

      const isCompleted = completedMilestonesCount === ach.milestones.length;
      const prevMilestone = completedMilestonesCount === 0 ? 0 : ach.milestones[completedMilestonesCount - 1];
      const progressPercent = isCompleted
        ? 100
        : Math.min(
            100,
            Math.max(
              0,
              Math.round(((ach.currentVal - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
            )
          );

      return {
        ...ach,
        completedMilestonesCount,
        isCompleted,
        nextMilestone,
        progressPercent,
      };
    });
  }, [ALL_ACHIEVEMENTS]);

  // Filtered by Search & Group
  const filteredList = useMemo(() => {
    return evaluatedAchievements.filter((ach) => {
      if (selectedGroupFilter !== 'all' && ach.category !== selectedGroupFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          ach.title.toLowerCase().includes(q) ||
          ach.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [evaluatedAchievements, selectedGroupFilter, search]);

  // Grouping for render
  const groups = [
    { id: 'dex', label: 'Dex Completion', desc: 'National encyclopaedia collection milestones' },
    { id: 'region', label: 'Region Completion', desc: 'Canonical regional territory Pokédex progress' },
    { id: 'type', label: 'Type Completion', desc: 'Elemental typing affinity and species coverage' },
    { id: 'games', label: 'Game Competence', desc: 'Minigame victories and recall skill mastery' },
  ] as const;

  const totalCompletedCount = evaluatedAchievements.filter((a) => a.isCompleted).length;

  return (
    <div className="space-y-7 sm:space-y-8 pb-6 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <span>Achievements</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Track milestones across Pokédex completion, regional cataloging, elemental typing diversity, and minigame competency.
        </p>
      </div>

      {/* Progress Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">
            Total Accolades
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            {evaluatedAchievements.length} <span className="text-xs text-slate-400 font-normal">Challenges</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">
            Mastered Accolades
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-display">
            {totalCompletedCount} <span className="text-xs text-slate-400 font-normal">/ {evaluatedAchievements.length}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">
            Completion Rate
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 font-display">
            {Math.round((totalCompletedCount / evaluatedAchievements.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Page Toolbox / Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search achievements..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Groups' },
            { id: 'dex', label: 'Dex Completion' },
            { id: 'region', label: 'Region Completion' },
            { id: 'type', label: 'Type Completion' },
            { id: 'games', label: 'Game Competence' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedGroupFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedGroupFilter === f.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Achievement Sections */}
      <div className="space-y-8">
        {groups
          .filter((g) => selectedGroupFilter === 'all' || selectedGroupFilter === g.id)
          .map((group) => {
            const groupAchievements = filteredList.filter((a) => a.category === group.id);
            if (groupAchievements.length === 0) return null;

            return (
              <div key={group.id} className="space-y-3.5">
                <div className="pb-1 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {group.label}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {group.desc}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                    {groupAchievements.filter((a) => a.isCompleted).length} / {groupAchievements.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {groupAchievements.map((ach) => {
                    const Icon = ach.icon;
                    return (
                      <div
                        key={ach.id}
                        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          ach.isCompleted
                            ? 'bg-gradient-to-r from-emerald-50/40 via-white to-amber-50/30 border-emerald-200/80 shadow-xs'
                            : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        {/* Left: Icon and Details */}
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${ach.iconBg}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 truncate">
                                {ach.title}
                              </h3>
                              {ach.isCompleted && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Completed</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                              {ach.description}
                            </p>

                            {/* Milestones chips */}
                            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                              {ach.milestones.map((m) => {
                                const reached = ach.currentVal >= m;
                                return (
                                  <span
                                    key={m}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                                      reached
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}
                                  >
                                    {m === ach.milestones[ach.milestones.length - 1] && m > 100 ? `${m} (All)` : m}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Right: Progress bar & Count */}
                        <div className="w-full md:w-56 space-y-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500 text-[11px]">
                              {ach.isCompleted ? (
                                <span className="text-emerald-600 font-bold">Mastered</span>
                              ) : (
                                <span>Next: {ach.nextMilestone}</span>
                              )}
                            </span>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              {ach.currentVal} / {ach.nextMilestone}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                ach.isCompleted ? 'bg-emerald-600' : 'bg-red-500'
                              }`}
                              style={{ width: `${ach.progressPercent}%` }}
                            />
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono text-right block">
                            {ach.isCompleted
                              ? 'All Milestones Reached'
                              : `${Math.max(0, ach.nextMilestone - ach.currentVal)} remaining`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AchievementsPage;
