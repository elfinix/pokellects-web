import React, { useState, useMemo } from 'react';
import { BarChart3, Search, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePokedex } from '../../context/PokedexContext';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { stats, allPokemon, unlockedIds } = usePokedex();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const unlockedList = useMemo(() => {
    return allPokemon
      .filter((p) => unlockedIds.includes(p.id))
      .filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          p.displayName.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          p.types.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (sortOrder === 'asc' ? a.id - b.id : b.id - a.id));
  }, [allPokemon, unlockedIds, search, sortOrder]);

  return (
    <div className="space-y-7 sm:space-y-8 pb-16 max-w-4xl">
      {/* Header with proper breathing room */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-500 shadow-2xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Trainer Ledger Reports</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Audited log of personal Pokédex additions and regional discovery coverage.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Session Audit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 text-xs font-semibold block">Registered Entries</span>
            <span className="text-2xl font-black text-slate-900">{stats.totalUnlocked}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 text-xs font-semibold block">Completion Status</span>
            <span className="text-2xl font-black text-red-600">{stats.completionRatePercent}%</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 text-xs font-semibold block">Active Account</span>
            <span className="text-lg font-bold text-slate-800">@{currentUser?.username}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Registered Species Roster Log ({unlockedList.length})
            </h3>

            {/* Toolbox for Reports */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter log..."
                  className="pl-8 pr-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-500 focus:bg-white transition-all w-40 sm:w-48"
                />
              </div>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer flex items-center gap-1 text-xs"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold uppercase">{sortOrder}</span>
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {unlockedList.map((poke) => (
              <div key={poke.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-400 font-bold">
                    #{String(poke.id).padStart(4, '0')}
                  </span>
                  <span className="font-bold text-slate-900">{poke.displayName}</span>
                  <span className="text-[10px] text-slate-500">{poke.genus}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {poke.types.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase text-[9px]">
                      {t}
                    </span>
                  ))}
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
