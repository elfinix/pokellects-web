import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Pokemon } from '../../../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../../../styles/theme';

interface SilhouetteDisplayProps {
  pokemon: Pokemon | null;
  isRevealed: boolean;
  isNewlyUnlocked: boolean;
  isAlreadyUnlocked: boolean;
}

export const SilhouetteDisplay: React.FC<SilhouetteDisplayProps> = ({
  pokemon,
  isRevealed,
  isNewlyUnlocked,
  isAlreadyUnlocked,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Artwork image URL
  const artworkUrl = pokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
    : '';

  // Reset image loaded state on new Pokémon
  useEffect(() => {
    setImageLoaded(false);
  }, [pokemon?.id]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100/95 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 relative overflow-hidden select-none">
      {/* Studio Dais Backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-800/30" />
        <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-slate-200/40 dark:border-slate-800/60 bg-white/40 dark:bg-slate-800/20" />
      </div>

      {/* Center Display: Silhouette / Revealed Artwork */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 min-h-[260px] sm:min-h-[320px]">
        {pokemon ? (
          <div className="relative flex items-center justify-center w-full h-full max-h-[340px]">
            <img
              src={artworkUrl}
              alt={isRevealed ? pokemon.displayName : 'Mystery Pokémon Silhouette'}
              onLoad={() => setImageLoaded(true)}
              className={`max-h-[260px] sm:max-h-[300px] w-auto object-contain transition-all duration-500 select-none ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${
                isRevealed
                  ? 'filter-none scale-100 drop-shadow-md'
                  : 'brightness-0 opacity-85 scale-95 dark:invert dark:opacity-70'
              }`}
            />

            {!imageLoaded && (
              <div className="absolute flex flex-col items-center gap-2 text-amber-500">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-amber-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}
      </div>

      {/* Bottom Readout: Revealed Name & Types */}
      <div className="relative z-10 min-h-[48px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isRevealed && pokemon ? (
            <motion.div
              key="revealed-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="w-full flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 px-4 py-2.5 rounded-2xl shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  #{String(pokemon.id).padStart(4, '0')}
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white font-display tracking-tight">
                  {pokemon.displayName}
                </span>

                {/* Types */}
                <div className="flex items-center gap-1.5 ml-1">
                  {pokemon.types.map((t) => {
                    const theme = POKEMON_TYPE_THEMES[t];
                    return (
                      <span
                        key={t}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          theme ? theme.border : 'border-slate-200'
                        } ${theme ? theme.badgeBg : 'bg-slate-100 text-slate-700'}`}
                      >
                        {theme ? theme.name : t}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Pokédex Registration Stamp */}
              <div className="flex items-center gap-2">
                {isNewlyUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Registered to Pokédex!</span>
                  </span>
                ) : isAlreadyUnlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                    <CheckCircle className="w-3 h-3 text-slate-400" />
                    <span>In Pokédex</span>
                  </span>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center">
              Who's that Pokémon?
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SilhouetteDisplay;
