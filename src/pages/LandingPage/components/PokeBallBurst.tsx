import React from 'react';
import { Pokemon } from '../../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../../styles/theme';

interface PokeBallBurstProps {
  revealedPokemonList: Pokemon[];
  revealCount: number;
}

export const PokeBallBurst: React.FC<PokeBallBurstProps> = ({
  revealedPokemonList,
  revealCount,
}) => {
  if (revealedPokemonList.length === 0) return null;

  const delays = ['0ms', '80ms', '160ms'];

  return (
    <div
      key={revealCount}
      className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center -space-x-2 sm:space-x-1 w-full max-w-[440px] pointer-events-none px-2"
    >
      {revealedPokemonList.map((poke, index) => {
        const theme = POKEMON_TYPE_THEMES[poke.types[0]];
        const animClass =
          index === 0
            ? 'animate-burst-left z-10 hover:z-30 hover:rotate-0'
            : index === 1
            ? 'animate-burst-center z-20 hover:z-30'
            : 'animate-burst-right z-10 hover:z-30 hover:rotate-0';

        return (
          <div
            key={`${poke.id}-${revealCount}-${index}`}
            className={`${animClass} bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center text-center flex-1 max-w-[125px] sm:max-w-[132px] transition-all pointer-events-auto hover:scale-110 cursor-pointer`}
            style={{ animationDelay: delays[index] }}
            title={`${poke.displayName} (#${poke.id})`}
          >
            <span className="text-[9px] font-mono font-bold text-slate-400">
              #{String(poke.id).padStart(4, '0')}
            </span>
            <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center my-0.5">
              <img
                src={poke.spriteUrl}
                alt={poke.displayName}
                loading="eager"
                decoding="sync"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-xs"
              />
            </div>
            <div className="w-full">
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                {poke.displayName}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span
                  className="px-1.5 py-0.2 rounded text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  {poke.types[0]}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PokeBallBurst;
