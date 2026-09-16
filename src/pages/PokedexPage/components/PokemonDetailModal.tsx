import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Shield, Zap, Sparkles, Activity, Award, ArrowRight } from 'lucide-react';
import { Pokemon, PokemonType } from '../../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../../styles/theme';
import { useHotkeys } from '../../../hooks/useHotkeys';

interface PokemonDetailModalProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'overview' | 'stats' | 'matchups' | 'evolution';

// Type chart multiplier dictionary for 18 types
const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
};

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({
  pokemon,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');

  useHotkeys('Escape', () => {
    if (isOpen) onClose();
  });

  if (!isOpen || !pokemon) return null;

  const primaryType = pokemon.types[0];
  const theme = POKEMON_TYPE_THEMES[primaryType];

  // Calculate damage taken from all attacking types
  const allTypes: PokemonType[] = Object.keys(TYPE_CHART) as PokemonType[];
  const defensiveMultipliers: Record<PokemonType, number> = {} as any;

  allTypes.forEach((attackingType) => {
    let multiplier = 1;
    pokemon.types.forEach((defendingType) => {
      const effect = TYPE_CHART[attackingType]?.[defendingType];
      if (effect !== undefined) {
        multiplier *= effect;
      }
    });
    defensiveMultipliers[attackingType] = multiplier;
  });

  const weaknesses = allTypes.filter((t) => defensiveMultipliers[t] > 1);
  const resistances = allTypes.filter((t) => defensiveMultipliers[t] > 0 && defensiveMultipliers[t] < 1);
  const immunities = allTypes.filter((t) => defensiveMultipliers[t] === 0);

  const totalBaseStats = pokemon.stats.reduce((sum, s) => sum + s.baseStat, 0);

  const playCry = () => {
    if (pokemon.cryUrl) {
      const audio = new Audio(pokemon.cryUrl);
      audio.volume = 0.55;
      audio.play().catch(() => {});
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden space-y-6 max-h-[90vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Type Accent Line & Ambient Aura */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: theme.accentHex }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: theme.accentHex }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                #{String(pokemon.id).padStart(4, '0')}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Gen {pokemon.generation}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {pokemon.displayName}
            </h2>
            <p className="text-xs font-semibold text-slate-500">{pokemon.genus}</p>
          </div>

          <div className="flex items-center gap-2">
            {pokemon.cryUrl && (
              <button
                type="button"
                onClick={playCry}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Play authentic Pokémon cry"
              >
                <Volume2 className="w-4 h-4 text-red-500" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 relative z-10 text-xs font-semibold">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'stats', label: 'Base Stats' },
              { id: 'matchups', label: 'Type Matchups' },
              { id: 'evolution', label: 'Evolution' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="relative z-10 flex-1 overflow-y-auto min-h-[260px] py-2">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-30"
                    style={{ backgroundColor: theme.accentHex }}
                  />
                  <img
                    src={pokemon.spriteUrl}
                    alt={pokemon.displayName}
                    className="w-32 h-32 object-contain drop-shadow-md select-none"
                  />
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    {pokemon.types.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-2xs"
                        style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 block font-medium text-[10px]">Height</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {pokemon.height ? (pokemon.height / 10).toFixed(1) : '—'} m
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 block font-medium text-[10px]">Weight</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {pokemon.weight ? (pokemon.weight / 10).toFixed(1) : '—'} kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flavor Text Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                "{pokemon.flavorText || 'No official Pokédex description entry available for this species.'}"
              </div>
            </div>
          )}

          {/* TAB 2: BASE STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-700">Individual Parameters</span>
                <span className="text-xs font-mono font-bold text-red-600">
                  Total: {totalBaseStats} BST
                </span>
              </div>

              <div className="space-y-2.5">
                {pokemon.stats.map((stat) => {
                  const maxStat = 200;
                  const percent = Math.min(100, Math.round((stat.baseStat / maxStat) * 100));
                  return (
                    <div key={stat.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-semibold capitalize">
                          {stat.name.replace('-', ' ')}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{stat.baseStat}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor:
                              stat.baseStat >= 100
                                ? '#10b981'
                                : stat.baseStat >= 70
                                ? '#3b82f6'
                                : stat.baseStat >= 50
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TYPE MATCHUPS */}
          {activeTab === 'matchups' && (
            <div className="space-y-4 pt-1">
              <p className="text-xs text-slate-500">
                Damage multipliers applied when {pokemon.displayName} is defending:
              </p>

              {/* Weaknesses (2x) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Weaknesses (Take 2× Damage)</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.length > 0 ? (
                    weaknesses.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                      >
                        {t} 2×
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>

              {/* Resistances (0.5x) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Resistances (Take ½× Damage)</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resistances.length > 0 ? (
                    resistances.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                      >
                        {t} ½×
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>

              {/* Immunities (0x) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Immunities (Take 0× Damage)</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {immunities.length > 0 ? (
                    immunities.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                      >
                        {t} 0×
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EVOLUTION */}
          {activeTab === 'evolution' && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-500">
                Biological evolutionary taxonomy and regional branch:
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-4">
                <div className="text-center space-y-1">
                  <img
                    src={pokemon.spriteUrl}
                    alt={pokemon.displayName}
                    className="w-16 h-16 object-contain mx-auto drop-shadow-xs"
                  />
                  <span className="text-xs font-bold text-slate-800 block">
                    {pokemon.displayName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    #{String(pokemon.id).padStart(4, '0')}
                  </span>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 italic">
                Cross-species branch adaptations are automatically cataloged as you register them in your ledger.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-slate-400">Click anywhere outside to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PokemonDetailModal;
