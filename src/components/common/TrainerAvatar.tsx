import React from 'react';

export interface TrainerAvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isActive?: boolean;
  shape?: 'rounded' | 'circle';
  className?: string;
}

export const TrainerAvatar: React.FC<TrainerAvatarProps> = ({
  initials,
  size = 'md',
  isActive = false,
  shape = 'circle',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-16 h-16 text-xl sm:text-2xl',
    '2xl': 'w-20 h-20 text-2xl sm:text-3xl',
  };

  const shapeClasses = {
    circle: {
      box: 'rounded-full',
      glow: 'rounded-full',
    },
    rounded: {
      box: size === 'xl' || size === '2xl' ? 'rounded-3xl' : 'rounded-2xl',
      glow: size === 'xl' || size === '2xl' ? 'rounded-3xl' : 'rounded-2xl',
    },
  }[shape];

  return (
    <div className={`relative shrink-0 select-none inline-flex items-center justify-center ${className}`}>
      {/* Outer Pulse Glow when Active */}
      {isActive && (
        <div
          className={`absolute -inset-0.5 ${shapeClasses.glow} bg-gradient-to-tr from-red-500 via-rose-500 to-amber-400 opacity-70 blur-xs transition-opacity`}
        />
      )}

      {/* Main Avatar Surface with Glass Arc & Trainer Gradient */}
      <div
        className={`relative ${sizeClasses[size]} ${shapeClasses.box} overflow-hidden flex items-center justify-center font-mono font-black text-white transition-all duration-200 shadow-sm ${
          isActive
            ? 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 ring-2 ring-red-400 ring-offset-2 dark:ring-offset-slate-900 shadow-red-500/40'
            : 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 hover:from-red-400 hover:via-rose-500 hover:to-red-600 border border-white/30 dark:border-white/20 shadow-red-600/20'
        }`}
      >
        {/* Top Gloss Reflection Arc */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

        {/* Ambient Bottom-Right Warm Highlight */}
        <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-300/25 blur-xs pointer-events-none" />

        {/* Initials Text with drop shadow */}
        <span className="relative z-10 drop-shadow-xs font-bold tracking-tight uppercase">
          {initials}
        </span>
      </div>
    </div>
  );
};

export default TrainerAvatar;
