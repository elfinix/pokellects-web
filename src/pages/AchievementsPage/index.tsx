import React, { useState, useMemo } from 'react';
import { Trophy, Award, Compass, Swords, Volume2, Lock, Search, Filter } from 'lucide-react';
import { MOCK_ACHIEVEMENTS } from '../../services/mockdata';
import { usePokedex } from '../../context/PokedexContext';

export const AchievementsPage: React.FC = () => {
  const { stats } = usePokedex();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = useMemo(() => {
    return MOCK_ACHIEVEMENTS.filter((ach) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = ach.title.toLowerCase().includes(q) || ach.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter === 'unlocked' && !ach.unlockedAt) return false;
      if (statusFilter === 'locked' && !!ach.unlockedAt) return false;
      return true;
    });
  }, [search, statusFilter]);

  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="w-5 h-5 text-amber-500" />,
    Compass: <Compass className="w-5 h-5 text-blue-500" />,
    Swords: <Swords className="w-5 h-5 text-rose-500" />,
    Volume2: <Volume2 className="w-5 h-5 text-purple-500" />,
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-amber-500" />
          <span>Trainer Achievements</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Unlock prestigious League accolades by reaching milestones across collection and arena mastery.
        </p>
      </div>

      {/* Universal Page Toolbox */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search achievements..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'unlocked', 'locked'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {filter === 'all' ? 'All Accolades' : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredAchievements.map((ach) => {
          const isUnlocked = !!ach.unlockedAt;
          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                isUnlocked
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50/70 border-dashed border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isUnlocked
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                {isUnlocked ? iconMap[ach.icon] || <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{ach.title}</h3>
                  {isUnlocked && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Earned
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
                {ach.unlockedAt && (
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;
