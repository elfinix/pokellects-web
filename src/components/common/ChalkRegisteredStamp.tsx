import React from 'react';
import { motion } from 'motion/react';

interface ChalkRegisteredStampProps {
  isNew?: boolean;
  className?: string;
}

/**
 * Authentic Red Chalk "REGISTERED" Stamp with rectangular red outline.
 */
export const ChalkRegisteredStamp: React.FC<ChalkRegisteredStampProps> = ({
  isNew = false,
  className = '',
}) => {
  return (
    <motion.div
      initial={isNew ? { scale: 2.3, rotate: -18, opacity: 0 } : { scale: 1, rotate: -3, opacity: 1 }}
      animate={{ scale: 1, rotate: -3, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 13,
        stiffness: 280,
        mass: 0.6,
        delay: isNew ? 0.45 : 0,
      }}

      className={`inline-flex items-center justify-center select-none ${className}`}
      title={isNew ? 'Newly Registered Entry' : 'Registered in Pokédex'}
    >
      {/* Outer Rectangular Red Chalk Outline Box */}
      <div className="relative px-3.5 py-1 sm:px-5 sm:py-1.5 rounded-lg sm:rounded-xl border-2 sm:border-[2.5px] border-red-600/95 bg-red-500/10 shadow-xs backdrop-blur-xs flex items-center justify-center">
        {/* Subtle Inner Dashed Stamp Border Line */}
        <div className="absolute inset-0.5 sm:inset-1 rounded-sm sm:rounded-md border border-dashed border-red-500/50 pointer-events-none" />

        {/* Chalk Stamp Text */}
        <span
          className="font-mono font-black uppercase text-xs sm:text-sm tracking-[0.22em] sm:tracking-[0.26em] text-red-600 drop-shadow-2xs leading-none transform translate-x-0.5"
          style={{ textShadow: '0 0 2px rgba(220, 38, 38, 0.4)' }}
        >
          REGISTERED
        </span>

        {/* Small "NEW" Corner Tag if newly registered */}
        {isNew && (
          <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[8px] sm:text-[9px] font-mono tracking-wider shadow-xs animate-pulse">
            NEW!
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ChalkRegisteredStamp;
