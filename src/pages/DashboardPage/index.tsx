import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Trophy,
  BookOpen,
  Gamepad2,
  ArrowRight,
  TrendingUp,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePokedex } from '../../context/PokedexContext';
import { useTheme } from '../../context/ThemeContext';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';
import { WorkspaceTab } from '../../components/common/AppShell';
import { LiquidMetricCard } from './components/LiquidMetricCard';

interface DashboardPageProps {
  onNavigate: (tab: WorkspaceTab) => void;
}

// Custom High-Contrast Tooltip for Generation Roster Completion Chart
const CustomGenTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const registered = payload.find((p: any) => p.dataKey === 'unlocked')?.value || 0;
    const undiscovered = payload.find((p: any) => p.dataKey === 'undiscovered')?.value || 0;
    const total = registered + undiscovered;
    const percent = total > 0 ? Math.round((registered / total) * 100) : 0;

    return (
      <div className="bg-slate-900 dark:bg-slate-950 text-white p-3 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 text-xs space-y-2 min-w-[150px] pointer-events-none">
        <div className="font-bold text-slate-100 flex items-center justify-between border-b border-slate-800/80 dark:border-slate-700/80 pb-1.5">
          <span>{label}</span>
          <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">
            {percent}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>Registered</span>
          </span>
          <span className="font-mono font-bold text-white text-sm">{registered}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
            <span>Undiscovered</span>
          </span>
          <span className="font-mono font-bold text-slate-300 text-sm">{undiscovered}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom High-Contrast Tooltip for Type Distribution Pie Chart
const CustomTypeTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 text-xs flex items-center gap-3 pointer-events-none">
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="font-bold text-slate-100">{data.name}</span>
        <span className="font-mono font-bold text-red-400 ml-auto text-sm">{data.value}</span>
      </div>
    );
  }
  return null;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { allPokemon, unlockedIds, stats, openDetailModal } = usePokedex();

  const unlockedPokemonList = allPokemon.filter((p) => unlockedIds.includes(p.id));

  // 1. Generation Breakdown Data for Recharts Bar Chart
  const genData = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => {
    const genStat = stats.byGeneration[gen] || { unlocked: 0, total: 100 };
    return {
      name: `Gen ${gen}`,
      unlocked: genStat.unlocked,
      undiscovered: Math.max(0, genStat.total - genStat.unlocked),
      total: genStat.total,
    };
  });

  // 2. Type Distribution Data for Recharts Pie Chart
  const typeCountMap: Record<string, number> = {};
  unlockedPokemonList.forEach((poke) => {
    poke.types.forEach((t) => {
      typeCountMap[t] = (typeCountMap[t] || 0) + 1;
    });
  });

  const typePieData = Object.entries(typeCountMap)
    .map(([type, count]) => ({
      name: type.toUpperCase(),
      value: count,
      color: POKEMON_TYPE_THEMES[type as keyof typeof POKEMON_TYPE_THEMES]?.accentHex || '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value);

  // Partner / Featured Pokémon (default to first unlocked or Pikachu)
  const featuredPokemon = unlockedPokemonList[0] || allPokemon[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-5 sm:p-8 text-white shadow-lg shadow-red-600/15 dark:shadow-black/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 border border-red-500/30 dark:border-slate-800">
        {/* Top accent hairline for dark mode */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 opacity-0 dark:opacity-100 transition-opacity" />

        {/* Ambient Corner Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 dark:bg-red-950/60 backdrop-blur-xs text-xs font-semibold text-white dark:text-red-400 border border-white/10 dark:border-red-900/60">
            <Award className="w-3.5 h-3.5 text-white dark:text-red-400" />
            <span>Trainer Progress Overview</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
            Welcome, {currentUser?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-white/90 dark:text-slate-300 max-w-lg leading-relaxed font-normal">
            Your personal Pokédex is synced. Identify species in the Pokédex or test your recall in Minigames to expand your collection.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 w-full md:w-auto gap-2.5 sm:gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('pokedex')}
            className="px-3 sm:px-5 py-3 rounded-2xl bg-white dark:bg-red-600 text-slate-900 dark:text-white font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-red-600 dark:text-white" />
            <span>Open Pokédex</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('arena')}
            className="px-3 sm:px-5 py-3 rounded-2xl bg-slate-950/40 dark:bg-slate-800/80 hover:bg-slate-950/60 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Minigames</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Grid with Liquid Transition on Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Registered Total */}
        <LiquidMetricCard
          liquidGradient="from-red-600 via-red-600 to-red-700"
          crestColor="text-red-600"
          shadowColor="hover:shadow-red-600/25"
          topBarGradient="from-red-600 to-red-400"
        >
          {(isHovered) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isHovered ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Registered
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isHovered
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs scale-105 shadow-xs'
                      : 'bg-red-50 dark:bg-red-950/50 border border-red-100/80 dark:border-red-800/50 text-red-600 dark:text-red-400 shadow-xs shadow-red-500/10'
                  }`}
                >
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <div
                  className={`text-3xl sm:text-4xl font-black font-display tracking-tight transition-colors duration-300 ${
                    isHovered ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {stats.totalUnlocked}
                  <span
                    className={`text-sm font-semibold font-mono transition-colors duration-300 ${
                      isHovered ? 'text-white/75' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {' '}
                    / 1,025
                  </span>
                </div>
                <div
                  className={`text-xs mt-1.5 flex items-center gap-1 transition-colors duration-300 ${
                    isHovered ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <TrendingUp
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      isHovered ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'
                    }`}
                  />
                  <span
                    className={`font-semibold transition-colors duration-300 ${
                      isHovered ? 'text-white font-bold' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {stats.completionRatePercent}%
                  </span>
                  <span>National Dex complete</span>
                </div>
              </div>

              <div
                className={`w-full h-2 rounded-full overflow-hidden p-0.5 transition-colors duration-300 ${
                  isHovered ? 'bg-black/25' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isHovered
                      ? 'bg-white shadow-xs'
                      : 'bg-gradient-to-r from-red-600 to-red-500 shadow-xs shadow-red-500/30'
                  }`}
                  style={{ width: `${Math.min(100, stats.completionRatePercent)}%` }}
                />
              </div>
            </div>
          )}
        </LiquidMetricCard>

        {/* Metric 2: Completion Rate */}
        <LiquidMetricCard
          liquidGradient="from-emerald-600 via-emerald-600 to-teal-700"
          crestColor="text-emerald-600"
          shadowColor="hover:shadow-emerald-600/25"
          topBarGradient="from-emerald-500 to-teal-400"
        >
          {(isHovered) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isHovered ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Completion
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isHovered
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs scale-105 shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100/80 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 shadow-xs shadow-emerald-500/10'
                  }`}
                >
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <div
                  className={`text-3xl sm:text-4xl font-black font-display tracking-tight transition-colors duration-300 ${
                    isHovered ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {stats.completionRatePercent}%
                </div>
                <span
                  className={`text-xs mt-1 block transition-colors duration-300 ${
                    isHovered ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  National Dex Progress
                </span>
              </div>

              <div
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-block transition-all duration-300 ${
                  isHovered
                    ? 'text-white bg-white/20 border border-white/30'
                    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100/60 dark:border-emerald-800/40'
                }`}
              >
                {1025 - stats.totalUnlocked} species remaining to discover
              </div>
            </div>
          )}
        </LiquidMetricCard>

        {/* Metric 3: Minigames Won */}
        <LiquidMetricCard
          liquidGradient="from-amber-500 via-amber-600 to-orange-600"
          crestColor="text-amber-500"
          shadowColor="hover:shadow-amber-500/25"
          topBarGradient="from-amber-500 to-yellow-400"
        >
          {(isHovered) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isHovered ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Minigame Victories
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isHovered
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs scale-105 shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-100/80 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 shadow-xs shadow-amber-500/10'
                  }`}
                >
                  <Trophy className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <div
                  className={`text-3xl sm:text-4xl font-black font-display tracking-tight transition-colors duration-300 ${
                    isHovered ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {(currentUser as any)?.stats?.arenaWins || 8}
                </div>
                <span
                  className={`text-xs mt-1 block transition-colors duration-300 ${
                    isHovered ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Completed Mini-Trials
                </span>
              </div>

              <div
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-block transition-all duration-300 ${
                  isHovered
                    ? 'text-white bg-white/20 border border-white/30'
                    : 'text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100/60 dark:border-amber-800/40'
                }`}
              >
                5-Win Streak Active
              </div>
            </div>
          )}
        </LiquidMetricCard>

        {/* Metric 4: Partner Spotlight */}
        <LiquidMetricCard
          liquidGradient="from-blue-600 via-indigo-600 to-purple-700"
          crestColor="text-blue-600"
          shadowColor="hover:shadow-indigo-600/25"
          topBarGradient="from-blue-500 to-indigo-500"
        >
          {(isHovered) => (
            <div className="flex items-center justify-between gap-3 h-full">
              <div className="space-y-1.5 min-w-0">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block transition-colors duration-300 ${
                    isHovered ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
                  }`}
                >
                  Lead Partner
                </span>
                <div
                  className={`text-xl font-black truncate font-display transition-colors duration-300 ${
                    isHovered ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {featuredPokemon.displayName}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold transition-all duration-300 ${
                    isHovered
                      ? 'text-white bg-white/20 border border-white/30'
                      : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-800/60'
                  }`}
                >
                  #{String(featuredPokemon.id).padStart(4, '0')}
                </span>
              </div>
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isHovered
                    ? 'bg-white/20 border border-white/30 shadow-inner scale-105 backdrop-blur-xs'
                    : 'bg-gradient-to-b from-slate-50 to-red-50/30 dark:from-slate-800 dark:to-red-950/30 border border-slate-200/80 dark:border-slate-700 shadow-2xs'
                }`}
              >
                <img
                  src={featuredPokemon.spriteUrl}
                  alt={featuredPokemon.displayName}
                  className="w-14 h-14 object-contain drop-shadow-sm group-hover:-translate-y-0.5 transition-transform duration-300"
                />
              </div>
            </div>
          )}
        </LiquidMetricCard>
      </div>

      {/* Recharts Data Analytics Grid (Equal Height on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Generation Completion Bar Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Generation Roster Completion</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Unlocked vs Undiscovered species across Generations 1 through 9
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>Registered</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Undiscovered</span>
                </span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={<CustomGenTooltip />}
                  cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.6)' }}
                  isAnimationActive={false}
                  offset={12}
                  wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                />
                <Bar dataKey="unlocked" name="Registered" fill="#dc2626" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="undiscovered" name="Undiscovered" fill={isDark ? '#334155' : '#e2e8f0'} radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between h-full">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Type Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Elemental typing diversity of registered Pokémon
            </p>
          </div>

          <div className="h-48 sm:h-56 w-full flex items-center justify-center my-auto py-2">
            {typePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTypeTooltip />}
                    isAnimationActive={false}
                    offset={12}
                    wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                Register Pokémon to populate type analytics
              </div>
            )}
          </div>

          {/* Top Types Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <div className="flex flex-wrap gap-1.5 text-xs">
              {typePieData.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10px]">{item.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Discoveries Carousel/Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Recently Registered Species</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Your latest discoveries added to the personal collection ledger
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('pokedex')}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {unlockedPokemonList.slice(0, 6).map((poke) => (
            <button
              key={poke.id}
              type="button"
              onClick={() => openDetailModal(poke)}
              className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs transition-all text-center flex flex-col items-center justify-between cursor-pointer group"
            >
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                #{String(poke.id).padStart(4, '0')}
              </span>
              <img
                src={poke.spriteUrl}
                alt={poke.displayName}
                className="w-14 h-14 object-contain my-1.5 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300 drop-shadow-xs"
              />
              <div className="w-full">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block group-hover:text-slate-950 dark:group-hover:text-white">
                  {poke.displayName}
                </span>
                <span className="text-[9px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">
                  {poke.types[0]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
