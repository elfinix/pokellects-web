import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { Pokemon } from '../../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../../styles/theme';

interface PokeBallBurstProps {
  revealedPokemonList: Pokemon[];
  revealCount: number;
}

interface CardItemProps {
  poke: Pokemon;
  index: number;
  revealCount: number;
}

const HolographicCard: React.FC<CardItemProps> = ({ poke, index, revealCount }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Perspective Mouse Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const playCry = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const audio = new Audio(
        poke.cryUrl ||
          `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${poke.id}.ogg`
      );
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch {
      // Audio playback fallback
    }
  };

  const targetConfigs = [
    { x: -10, y: 0, rotate: -5, z: 10 },
    { x: 0, y: -12, rotate: 0, z: 20 },
    { x: 10, y: 0, rotate: 5, z: 10 },
  ];

  const config = targetConfigs[index] || targetConfigs[1];

  return (
    <motion.div
      ref={cardRef}
      key={`${poke.id}-${revealCount}-${index}`}
      initial={{ opacity: 0, scale: 0.25, y: 40, rotate: 0 }}
      animate={{
        opacity: 1,
        scale: index === 1 ? 1.05 : 1,
        x: config.x,
        y: config.y,
        rotate: config.rotate,
        zIndex: config.z,
      }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 24,
        delay: index * 0.045,
      }}
      whileHover={{
        scale: 1.15,
        rotate: 0,
        y: -22,
        zIndex: 40,
        transition: { type: 'spring', stiffness: 450, damping: 20 },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative bg-white/95 backdrop-blur-xl p-3 rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col items-center text-center flex-1 max-w-[128px] sm:max-w-[138px] pointer-events-auto cursor-pointer select-none group transition-shadow hover:shadow-red-500/10"
      title={`Click speaker to hear ${poke.displayName}'s cry!`}
    >
      {/* Holographic light sheen overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top Bar: National Dex # & Generation Pill */}
      <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
        <span>#{String(poke.id).padStart(4, '0')}</span>
        <span className="text-[8px] font-sans px-1 py-0.2 rounded bg-slate-100 text-slate-500 uppercase tracking-tighter">
          G{poke.generation}
        </span>
      </div>

      {/* High-res Sprite Container */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-1 relative">
        <img
          src={poke.spriteUrl}
          alt={poke.displayName}
          loading="eager"
          decoding="sync"
          className="w-13 h-13 sm:w-15 sm:h-15 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
        />
        {/* Playable Cry Button */}
        <button
          type="button"
          onClick={playCry}
          title="Play cry"
          className="absolute -right-1.5 bottom-0 w-5 h-5 rounded-full bg-slate-900/90 hover:bg-red-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <Volume2 className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Pokemon Name & Element Tags */}
      <div className="w-full space-y-1">
        <div className="text-xs font-extrabold text-slate-900 font-display truncate">
          {poke.displayName}
        </div>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {poke.types.map((type) => {
            const tTheme = POKEMON_TYPE_THEMES[type];
            return (
              <span
                key={type}
                className="px-1.5 py-0.2 rounded text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: tTheme.accentHex }}
              >
                {type}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export const PokeBallBurst: React.FC<PokeBallBurstProps> = ({
  revealedPokemonList,
  revealCount,
}) => {
  if (revealedPokemonList.length === 0) return null;

  return (
    <div
      key={revealCount}
      className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center -space-x-2 sm:space-x-1 w-full max-w-[460px] pointer-events-none px-2"
    >
      {revealedPokemonList.map((poke, index) => (
        <HolographicCard
          key={`${poke.id}-${index}`}
          poke={poke}
          index={index}
          revealCount={revealCount}
        />
      ))}
    </div>
  );
};

export default PokeBallBurst;
