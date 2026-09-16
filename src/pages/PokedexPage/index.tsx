import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, BookOpen } from 'lucide-react';
import { usePokedex } from '../../context/PokedexContext';
import { Pokemon } from '../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';
import Toolbox, { ToolboxFilters } from '../../components/common/Toolbox';
import PokemonDetailModal from './components/PokemonDetailModal';
import FloatingRegistrationBar from './components/FloatingRegistrationBar';

export const PokedexPage: React.FC = () => {
  const {
    allPokemon,
    unlockedIds,
    selectedPokemon,
    isModalOpen,
    openDetailModal,
    closeDetailModal,
    stats,
  } = usePokedex();

  const [filters, setFilters] = useState<ToolboxFilters>({
    searchQuery: '',
    selectedType: 'all',
    selectedGeneration: 'all',
    sortCriteria: 'id',
    sortOrder: 'asc',
    showOnlyUnlocked: false,
  });

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedType: 'all',
      selectedGeneration: 'all',
      sortCriteria: 'id',
      sortOrder: 'asc',
      showOnlyUnlocked: false,
    });
  };

  // Filter and sort the complete 1,025 Pokémon list
  const filteredPokemon = useMemo(() => {
    return allPokemon
      .filter((p) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchesName = p.displayName.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
          const matchesId = String(p.id).padStart(4, '0').includes(q) || String(p.id) === q;
          if (!matchesName && !matchesId) return false;
        }

        // Type filter
        if (filters.selectedType !== 'all') {
          if (!p.types.includes(filters.selectedType)) return false;
        }

        // Generation filter
        if (filters.selectedGeneration !== 'all') {
          if (p.generation !== filters.selectedGeneration) return false;
        }

        // Unlocked filter
        if (filters.showOnlyUnlocked) {
          if (!unlockedIds.includes(p.id)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filters.sortCriteria === 'id') {
          comp = a.id - b.id;
        } else if (filters.sortCriteria === 'name') {
          comp = a.displayName.localeCompare(b.displayName);
        } else if (filters.sortCriteria === 'stat') {
          const totalA = a.stats.reduce((acc, s) => acc + s.baseStat, 0);
          const totalB = b.stats.reduce((acc, s) => acc + s.baseStat, 0);
          comp = totalA - totalB;
        }

        return filters.sortOrder === 'asc' ? comp : -comp;
      });
  }, [allPokemon, filters, unlockedIds]);

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-red-600" />
            <span>National Pokédex</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse, inspect, and identify species to complete your permanent trainer ledger.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Completion
            </span>
            <span className="text-lg font-black text-red-600">
              {stats.completionRatePercent}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-xs font-bold text-slate-800">
              {stats.totalUnlocked}
            </span>
            <span className="text-xs text-slate-400 font-mono"> / 1,025</span>
          </div>
        </div>
      </div>

      {/* Universal Top Toolbox */}
      <Toolbox
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        totalResults={filteredPokemon.length}
        totalCount={allPokemon.length}
        placeholder="Search species by name or #ID (e.g. Charizard, 0025)..."
      />

      {/* Pokédex Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredPokemon.map((poke) => {
          const isUnlocked = unlockedIds.includes(poke.id);
          const primaryType = poke.types[0];
          const theme = POKEMON_TYPE_THEMES[primaryType];

          if (!isUnlocked) {
            return (
              <div
                key={poke.id}
                className="p-3.5 rounded-2xl border border-dashed border-slate-200 bg-white/40 flex flex-col items-center justify-between text-center select-none opacity-60"
              >
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{String(poke.id).padStart(4, '0')}
                </span>
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-2 filter brightness-0 opacity-15">
                  <img
                    src={poke.spriteUrl}
                    alt="Undiscovered"
                    className="w-16 h-16 sm:w-18 sm:h-18 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="w-full">
                  <span className="text-xs font-semibold text-slate-400">???</span>
                  <div className="h-4" />
                </div>
              </div>
            );
          }

          return (
            <motion.button
              key={poke.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openDetailModal(poke)}
              className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-between text-center cursor-pointer group relative overflow-hidden"
            >
              {/* Top ambient color glow */}
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: theme.accentHex }}
              />

              <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>#{String(poke.id).padStart(4, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  Gen {poke.generation}
                </span>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-2 group-hover:scale-110 transition-transform">
                <img
                  src={poke.spriteUrl}
                  alt={poke.displayName}
                  className="w-16 h-16 sm:w-18 sm:h-18 object-contain drop-shadow-xs"
                  loading="lazy"
                />
              </div>

              <div className="w-full space-y-1.5">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {poke.displayName}
                </div>
                <div className="flex items-center justify-center gap-1">
                  {poke.types.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider text-white shadow-2xs"
                      style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPokemon.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Sparkles className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Pokémon found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, type filters, or generation selectors.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Bottom Registration Omnibar */}
      <FloatingRegistrationBar
        isModalOpen={isModalOpen}
        onRegisteredPokemon={(id) => {
          const target = allPokemon.find((p) => p.id === id);
          if (target) openDetailModal(target);
        }}
      />

      {/* Multi-Tab Pokémon Detail Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
};

export default PokedexPage;
