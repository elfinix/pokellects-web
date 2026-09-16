import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LiquidMetricCardProps {
  /** Accent gradient for the liquid body, e.g. "from-red-600 via-red-600 to-red-700" */
  liquidGradient: string;
  /** Primary accent color text class for the wave crest SVG, e.g. "text-red-600" */
  crestColor: string;
  /** Glow shadow on hover, e.g. "hover:shadow-red-500/25" */
  shadowColor: string;
  /** Top thin accent bar gradient in idle state */
  topBarGradient: string;
  /** Custom class names */
  className?: string;
  /** Render prop providing isHovered boolean so inner elements can adapt colors seamlessly */
  children: (isHovered: boolean) => React.ReactNode;
}

export const LiquidMetricCard: React.FC<LiquidMetricCardProps> = ({
  liquidGradient,
  crestColor,
  shadowColor,
  topBarGradient,
  className = '',
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border transition-all duration-500 cursor-default select-none group isolate ${
        isHovered
          ? `border-transparent shadow-xl ${shadowColor} -translate-y-1`
          : 'border-slate-200/80 shadow-xs hover:border-slate-300/80'
      } ${className}`}
      style={{
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        transform: 'translateZ(0)',
      }}
    >
      {/* Top Accent Rim (Persistent, curved to card's 16px radius, matches gradient without straight-line artifact) */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 rounded-t-2xl z-20 pointer-events-none transition-all duration-300 ${
          isHovered
            ? `bg-gradient-to-r ${topBarGradient} opacity-100`
            : `bg-gradient-to-r ${topBarGradient} opacity-85`
        }`}
      />

      {/* ========================================================================= */}
      {/* RISING LIQUID TIDE CONTAINER                                              */}
      {/* ========================================================================= */}
      <motion.div
        initial={false}
        animate={{ y: isHovered ? '0%' : '102%' }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 110,
          mass: 0.85,
        }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        {/* Dual Seamless Oscillating Wave Crest at the top of the fluid */}
        <div className="absolute -top-6 left-0 w-[200%] h-7 pointer-events-none overflow-visible">
          {/* Secondary Back Wave (translucent for liquid depth) */}
          <svg
            className="absolute top-0 left-0 w-full h-full text-white/30 fill-current animate-liquid-wave-2"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M 0,50 Q 150,90 300,50 T 600,50 Q 750,90 900,50 T 1200,50 L 1200,120 L 0,120 Z" />
          </svg>

          {/* Primary Foreground Wave (matches liquid gradient) */}
          <svg
            className={`absolute top-1 left-0 w-full h-full ${crestColor} fill-current animate-liquid-wave-1`}
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M 0,40 Q 150,0 300,40 T 600,40 Q 750,0 900,40 T 1200,40 L 1200,120 L 0,120 Z" />
          </svg>
        </div>

        {/* Main Fluid Body */}
        <div className={`absolute inset-0 bg-gradient-to-br ${liquidGradient}`} />

        {/* Subtle Ambient Liquid Bubbles */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <span className="absolute bottom-3 left-4 w-2 h-2 rounded-full bg-white/60 animate-ping" />
          <span className="absolute bottom-7 right-8 w-3 h-3 rounded-full bg-white/40" />
          <span className="absolute top-8 right-12 w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* CARD CONTENT LAYER (Elevated above liquid with smooth color transitions)   */}
      {/* ========================================================================= */}
      <div className="relative z-10 transition-colors duration-300 h-full flex flex-col justify-between">
        {children(isHovered)}
      </div>
    </div>
  );
};

export default LiquidMetricCard;
