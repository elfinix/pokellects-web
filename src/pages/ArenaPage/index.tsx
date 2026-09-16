import React, { useState, useMemo } from 'react';
import { Swords, Trophy, Play, Clock, Sparkles, HelpCircle, Volume2, Shield, Search } from 'lucide-react';
import { ARENA_GAMES_METADATA } from '../../services/mockdata';
import { GameMetadata } from '../../types/game';

interface ArenaPageProps {
  onPlayGame?: (gameId: string) => void;
}

export const ArenaPage: React.FC<ArenaPageProps> = ({ onPlayGame }) => {
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');

  const filteredGames = useMemo(() => {
    return ARENA_GAMES_METADATA.filter((game) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          game.title.toLowerCase().includes(q) ||
          game.description.toLowerCase().includes(q) ||
          game.tagline.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (difficultyFilter !== 'all' && game.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [search, difficultyFilter]);

  return (
    <div className="space-y-6 pb-16 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2.5">
          <Swords className="w-7 h-7 text-amber-500" />
          <span>Battle Arena Trials</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete knowledge challenges to discover and register unowned Pokémon into your Pokédex.
        </p>
      </div>

      {/* Arena Toolbox */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search game modes..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {diff === 'all' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {game.difficulty} Difficulty
                </span>
                {game.isAvailable ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 font-display">{game.title}</h3>
              <p className="text-xs text-red-600 font-semibold">{game.tagline}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{game.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rewards +1 Unlock</span>
              </div>

              <button
                type="button"
                disabled={!game.isAvailable}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  game.isAvailable
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{game.isAvailable ? 'View Trial' : 'Locked'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal on game preview */}
      {selectedGame && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {selectedGame.difficulty} Difficulty
              </span>
              <span className="text-xs font-mono font-bold text-red-600">
                {selectedGame.id}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 font-display">{selectedGame.title}</h3>
            <p className="text-xs text-red-600 font-semibold">{selectedGame.tagline}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedGame.description}</p>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-800 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Victories in this trial will register an undiscovered Pokémon into your collection!</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              {selectedGame.isAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedGame.id;
                    setSelectedGame(null);
                    if (onPlayGame) onPlayGame(id);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-red-500" />
                  <span>Play Game</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArenaPage;
