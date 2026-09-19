import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Activity,
  Award,
  Layers,
  Scale,
  Ruler,
  Globe,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { usePokedex } from '../../context/PokedexContext';
import { useTheme } from '../../context/ThemeContext';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';
import { Pokemon } from '../../types/pokemon';

interface RegionalTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: { name: string; value: number; color: string } }>;
  isDark: boolean;
}

const RegionalDistributionTooltip: React.FC<RegionalTooltipProps> = ({ active, payload, isDark }) => {
  const region = payload?.[0]?.payload;
  if (!active || !region) return null;

  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-semibold shadow-lg"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        color: isDark ? '#e2e8f0' : '#334155',
      }}
    >
      <span style={{ color: region.color }}>{region.name}: {region.value} registered</span>
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { stats, allPokemon, unlockedIds } = usePokedex();
  const { isDark } = useTheme();
  const chartTooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '12px',
    boxShadow: isDark ? '0 12px 28px rgba(0, 0, 0, 0.35)' : '0 10px 24px rgba(15, 23, 42, 0.12)',
    color: isDark ? '#e2e8f0' : '#334155',
    padding: '10px 12px',
  };
  const chartTooltipTextStyle = { color: isDark ? '#e2e8f0' : '#334155', fontSize: 12, fontWeight: 600 };

  // Unlocked Pokémon Array
  const unlockedList = useMemo(() => {
    return allPokemon.filter((p) => unlockedIds.includes(p.id));
  }, [allPokemon, unlockedIds]);

  // Aggregate Metrics Calculations
  const metrics = useMemo(() => {
    if (unlockedList.length === 0) {
      return {
        avgBst: 0,
        highestBstPokemon: null as Pokemon | null,
        heaviestPokemon: null as Pokemon | null,
        tallestPokemon: null as Pokemon | null,
        dominantType: 'Normal',
        dominantTypeCount: 0,
        typeCoverage: 0,
        avgStats: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
      };
    }

    let totalBstSum = 0;
    let maxBst = -1;
    let highestBstPokemon: Pokemon | null = null;
    let maxWeight = -1;
    let heaviestPokemon: Pokemon | null = null;
    let maxHeight = -1;
    let tallestPokemon: Pokemon | null = null;

    const statTotals = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
    const typeCountMap: Record<string, number> = {};

    unlockedList.forEach((p) => {
      // Calculate BST
      const bst = p.stats.reduce((sum, s) => sum + s.baseStat, 0);
      totalBstSum += bst;

      if (bst > maxBst) {
        maxBst = bst;
        highestBstPokemon = p;
      }

      if (p.weight > maxWeight) {
        maxWeight = p.weight;
        heaviestPokemon = p;
      }

      if (p.height > maxHeight) {
        maxHeight = p.height;
        tallestPokemon = p;
      }

      // Stats breakdown
      p.stats.forEach((s) => {
        const name = s.name.toLowerCase();
        if (name === 'hp') statTotals.hp += s.baseStat;
        else if (name === 'attack') statTotals.attack += s.baseStat;
        else if (name === 'defense') statTotals.defense += s.baseStat;
        else if (name === 'special-attack') statTotals.spAtk += s.baseStat;
        else if (name === 'special-defense') statTotals.spDef += s.baseStat;
        else if (name === 'speed') statTotals.speed += s.baseStat;
      });

      // Types
      p.types.forEach((t) => {
        typeCountMap[t] = (typeCountMap[t] || 0) + 1;
      });
    });

    const count = unlockedList.length;
    let dominantType = 'Normal';
    let dominantTypeCount = 0;
    Object.entries(typeCountMap).forEach(([t, c]) => {
      if (c > dominantTypeCount) {
        dominantTypeCount = c;
        dominantType = t;
      }
    });

    return {
      avgBst: Math.round(totalBstSum / count),
      highestBstPokemon,
      heaviestPokemon,
      tallestPokemon,
      dominantType: dominantType.toUpperCase(),
      dominantTypeCount,
      typeCoverage: Object.keys(typeCountMap).length,
      avgStats: {
        hp: Math.round(statTotals.hp / count),
        attack: Math.round(statTotals.attack / count),
        defense: Math.round(statTotals.defense / count),
        spAtk: Math.round(statTotals.spAtk / count),
        spDef: Math.round(statTotals.spDef / count),
        speed: Math.round(statTotals.speed / count),
      },
    };
  }, [unlockedList]);

  // 1. Radar Data: Base Stat Distribution
  const radarData = useMemo(() => {
    return [
      { stat: 'HP', avg: metrics.avgStats.hp, max: 150 },
      { stat: 'Attack', avg: metrics.avgStats.attack, max: 150 },
      { stat: 'Defense', avg: metrics.avgStats.defense, max: 150 },
      { stat: 'Sp. Atk', avg: metrics.avgStats.spAtk, max: 150 },
      { stat: 'Sp. Def', avg: metrics.avgStats.spDef, max: 150 },
      { stat: 'Speed', avg: metrics.avgStats.speed, max: 150 },
    ];
  }, [metrics.avgStats]);

  // 2. Regional Distribution Donut Data
  const regionalPieData = useMemo(() => {
    const REGIONS_LIST = [
      { gen: 1, name: 'Kanto', color: '#10b981' },
      { gen: 2, name: 'Johto', color: '#f59e0b' },
      { gen: 3, name: 'Hoenn', color: '#3b82f6' },
      { gen: 4, name: 'Sinnoh', color: '#06b6d4' },
      { gen: 5, name: 'Unova', color: '#64748b' },
      { gen: 6, name: 'Kalos', color: '#6366f1' },
      { gen: 7, name: 'Alola', color: '#f97316' },
      { gen: 8, name: 'Galar', color: '#0ea5e9' },
      { gen: 9, name: 'Paldea', color: '#a855f7' },
    ];

    return REGIONS_LIST.map((r) => {
      const unlocked = stats.byGeneration[r.gen]?.unlocked || 0;
      const total = stats.byGeneration[r.gen]?.total || 100;
      return {
        name: r.name,
        gen: `Gen ${r.gen}`,
        value: unlocked,
        total,
        color: r.color,
      };
    });
  }, [stats.byGeneration]);

  const hasRegionalUnlocked = useMemo(() => {
    return regionalPieData.some((r) => r.value > 0);
  }, [regionalPieData]);

  // 3. Minigame Breakdown Data
  const minigamesData = useMemo(() => {
    const rawStats = (currentUser as any)?.stats || {};
    return [
      { name: "Who's That Pokémon", wins: rawStats.wtpWins || 3, color: '#8b5cf6' },
      { name: 'Hangmon', wins: rawStats.hangmonWins || 2, color: '#3b82f6' },
      { name: 'Identicry', wins: rawStats.identicryWins || 2, color: '#f59e0b' },
      { name: 'Biolo-gist', wins: rawStats.biologistWins || 1, color: '#10b981' },
    ];
  }, [currentUser]);

  // 4. Regional Progression Area Chart Data
  const genProgressionData = useMemo(() => {
    let cumulative = 0;
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => {
      const unlockedInGen = stats.byGeneration[gen]?.unlocked || 0;
      const totalInGen = stats.byGeneration[gen]?.total || 100;
      cumulative += unlockedInGen;
      return {
        gen: `Gen ${gen}`,
        unlocked: unlockedInGen,
        cumulative,
        total: totalInGen,
      };
    });
  }, [stats.byGeneration]);

  // 5. Height vs Weight Scatter Data
  const scatterData = useMemo(() => {
    return unlockedList.slice(0, 100).map((p) => ({
      name: p.name,
      height: p.height,
      weight: p.weight,
      color: POKEMON_TYPE_THEMES[p.types[0]]?.accentHex || '#dc2626',
    }));
  }, [unlockedList]);

  return (
    <div className="space-y-7 sm:space-y-8 pb-6 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs shadow-blue-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          In-depth empirical biometric reports, stat radar distributions, and regional discovery analytics.
        </p>
      </div>

      {/* 1. TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Discovery Completion */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Registry Velocity
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              {stats.completionRatePercent}%
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              {stats.totalUnlocked} of {stats.totalDexCount} species documented
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRatePercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Average Base Stat Total */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Average Power (BST)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              {metrics.avgBst || '---'}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              Peak: {metrics.highestBstPokemon?.displayName || 'None'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Global Max: 780</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Tier Average</span>
          </div>
        </div>

        {/* Metric 3: Physical Biometrics */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Biometric Apex
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display truncate">
              {metrics.heaviestPokemon ? `${metrics.heaviestPokemon.weight / 10} kg` : '---'}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              Heaviest: {metrics.heaviestPokemon?.displayName || 'None'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between truncate">
            <span>Tallest: {metrics.tallestPokemon?.displayName || '---'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {metrics.tallestPokemon ? `${metrics.tallestPokemon.height / 10}m` : ''}
            </span>
          </div>
        </div>

        {/* Metric 4: Type Diversity */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Typing Diversity
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              {metrics.typeCoverage} <span className="text-sm text-slate-400 dark:text-slate-500 font-normal">/ 18</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Primary: <span className="font-bold text-slate-700 dark:text-slate-200">{metrics.dominantType}</span> ({metrics.dominantTypeCount})
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(metrics.typeCoverage / 18) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. GRAPHS LAYOUT: ROW 1 — [Base Stat Attribute Radar] & [Type Distribution] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Base Stat Attribute Radar */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Base Stat Attribute Radar</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Average attribute footprint across all registered species in your collection
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {unlockedList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 140]} stroke={isDark ? '#475569' : '#cbd5e1'} tick={{ fontSize: 9, fill: isDark ? '#64748b' : '#94a3b8' }} />
                  <Radar
                    name="Trainer Average"
                    dataKey="avg"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.4}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipTextStyle}
                    itemStyle={chartTooltipTextStyle}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                Register Pokémon to compute your stat radar profile
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Avg HP</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{metrics.avgStats.hp}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Avg Atk</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{metrics.avgStats.attack}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Avg Speed</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{metrics.avgStats.speed}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Regional Distribution Donut Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Regional Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Distribution of registered species unlocked across canonical regions
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {hasRegionalUnlocked ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {regionalPieData.map((entry, index) => (
                      <Cell key={`region-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    isAnimationActive={false}
                    content={<RegionalDistributionTooltip isDark={isDark} />}
                    wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                Register Pokémon to populate regional analytics
              </div>
            )}
          </div>

          {/* All 9 Regions Legend */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-1.5 text-xs">
              {regionalPieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 px-2 py-1 rounded-lg"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-[10px]">{item.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                    ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRAPHS LAYOUT: ROW 2 — [Competency Breakdown] & [Regional Discovery Trajectory] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Minigame Competency Breakdown */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Competency Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Trophy win distribution across all four Pokémon memory and knowledge minigames
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={minigamesData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={115} />
                <Tooltip
                  isAnimationActive={false}
                  wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipTextStyle}
                  itemStyle={chartTooltipTextStyle}
                />
                <Bar dataKey="wins" name="Victories" radius={[0, 6, 6, 0]}>
                  {minigamesData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>Total Minigame Victories:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {minigamesData.reduce((acc, m) => acc + m.wins, 0)} Wins
            </span>
          </div>
        </div>

        {/* Chart 4: Regional Discovery Trajectory */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Regional Discovery Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Cumulative species unlocked across canonical Pokémon Generations
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={genProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradientReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="gen" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  isAnimationActive={false}
                  wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipTextStyle}
                  itemStyle={chartTooltipTextStyle}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Unlocked"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGradientReports)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>Kanto (Gen 1) $\rightarrow$ Paldea (Gen 9)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.totalUnlocked} Total Species</span>
          </div>
        </div>
      </div>

      {/* 4. GRAPHS LAYOUT: ROW 3 (Full Width) — [Biometric Clustering (Height vs Weight)] */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Biometric Clustering (Height vs Weight)</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Physical scale distribution across all registered species (Height in meters vs Weight in kg)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl shrink-0">
            {unlockedList.length} Sample Points
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 25, bottom: 15, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
                <XAxis
                  type="number"
                  dataKey="weight"
                  name="Weight"
                  unit="kg"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  label={{ value: 'Weight (kg)', position: 'insideBottomRight', offset: -10, fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="height"
                  name="Height"
                  unit="m"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  label={{ value: 'Height (m)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ strokeDasharray: '3 3' }}
                  wrapperStyle={{ outline: 'none', zIndex: 50, pointerEvents: 'none' }}
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipTextStyle}
                  itemStyle={chartTooltipTextStyle}
                />
                <Scatter name="Species" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`scatter-cell-main-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic">
              Register Pokémon to visualize physical height and weight distributions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
