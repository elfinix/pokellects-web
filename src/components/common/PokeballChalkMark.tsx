import React from 'react';
import { motion } from 'motion/react';

export interface PokeballChalkMarkProps {
  status: 'newly-registered' | 'registered' | 'unregistered';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  animateStamp?: boolean;
}

/**
 * Clean Generic Red Chalk Pokéball Insignia Mark.
 * Renders the generic Pokéball silhouette with solid outer ring,
 * left & right horizontal bars, and a hollow center button.
 */
export const PokeballChalkMark: React.FC<PokeballChalkMarkProps> = ({
  status,
  size = 'sm',
  className = '',
  animateStamp = true,
}) => {
  const sizeMap = {
    xs: 'w-8 h-8 sm:w-9 sm:h-9',
    sm: 'w-11 h-11 sm:w-12 sm:h-12',
    md: 'w-16 h-16 sm:w-18 sm:h-18',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const dimension = sizeMap[size] || sizeMap.sm;

  if (status === 'newly-registered') {
    return (
      <motion.div
        initial={animateStamp ? { scale: 2.3, rotate: -25, opacity: 0 } : false}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 14,
          stiffness: 270,
          mass: 0.65,
          delay: 0.35,
        }}

        className={`relative inline-flex items-center justify-center select-none ${dimension} ${className}`}
        title="Newly Registered Pokédex Mark"
      >
        {/* Subtle Ambient Red Glow */}
        <div className="absolute inset-0 rounded-full bg-red-600/15 blur-md pointer-events-none" />

        {/* Generic Red Chalk Pokéball Vector SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle
            cx="50"
            cy="50"
            r="41"
            stroke="#dc2626"
            strokeWidth="9"
            fill="none"
          />

          {/* Left Horizontal Bar */}
          <rect
            x="8"
            y="45.5"
            width="28"
            height="9"
            fill="#dc2626"
          />

          {/* Right Horizontal Bar */}
          <rect
            x="64"
            y="45.5"
            width="28"
            height="9"
            fill="#dc2626"
          />

          {/* Center Button Ring (Hollow Center) */}
          <circle
            cx="50"
            cy="50"
            r="16"
            stroke="#dc2626"
            strokeWidth="9"
            fill="none"
          />
        </svg>
      </motion.div>
    );
  }

  if (status === 'registered') {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none opacity-60 hover:opacity-100 transition-opacity ${dimension} ${className}`}
        style={{ transform: 'rotate(-8deg)' }}
        title="Pokédex Registered Entry"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="41" stroke="#94a3b8" strokeWidth="9" fill="none" />
          <rect x="8" y="45.5" width="28" height="9" fill="#94a3b8" />
          <rect x="64" y="45.5" width="28" height="9" fill="#94a3b8" />
          <circle cx="50" cy="50" r="16" stroke="#94a3b8" strokeWidth="9" fill="none" />
        </svg>
      </div>
    );
  }

  return null;
};

export default PokeballChalkMark;
