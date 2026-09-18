import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';

export interface PokeballSealInsigniaProps {
  status: 'newly-registered' | 'registered' | 'unregistered';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  animateStamp?: boolean;
}

export const PokeballSealInsignia: React.FC<PokeballSealInsigniaProps> = ({
  status,
  size = 'sm',
  className = '',
  animateStamp = true,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const dimension = sizeMap[size];

  if (status === 'newly-registered') {
    return (
      <motion.div
        initial={animateStamp ? { scale: 2.2, rotate: -25, opacity: 0 } : false}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 14,
          stiffness: 260,
          mass: 0.8,
        }}
        className={`relative inline-flex items-center justify-center select-none ${dimension} ${className}`}
        title="Newly Registered Pokémon!"
      >
        {/* Outer Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/40 via-red-500/30 to-amber-300/40 blur-md -z-10 animate-pulse" />

        {/* Premium SVG Pokeball Royal Wax/Gold Seal */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_4px_10px_rgba(217,119,6,0.5)] overflow-visible"
        >
          <defs>
            {/* Rich 24K Gold & Crimson Crest Gradients */}
            <radialGradient id="sealGoldGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            <linearGradient id="sealRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            <linearGradient id="sealWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" floodColor="#451a03" />
            </filter>
          </defs>

          {/* Scalloped / Starburst Royal Medallion Outer Ring (16 Petals) */}
          <path
            d="
              M 50 3 
              L 59 10 L 70 6 L 76 16 L 87 17 L 89 28 L 98 34 L 95 45 
              L 100 55 L 93 64 L 94 75 L 84 81 L 80 91 L 69 91 L 61 99 
              L 50 94 
              L 39 99 L 31 91 L 20 91 L 16 81 L 6 75 L 7 64 L 0 55 
              L 5 45 L 2 34 L 11 28 L 13 17 L 24 16 L 30 6 L 41 10 Z
            "
            fill="url(#sealGoldGrad)"
            stroke="#78350f"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Golden Rim with Stitching / Bead Accents */}
          <circle cx="50" cy="50" r="41" fill="#92400e" opacity="0.3" />
          <circle cx="50" cy="50" r="38" fill="url(#sealGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#fef08a"
            strokeWidth="1.2"
            strokeDasharray="2.5 2"
            opacity="0.9"
          />

          {/* Pokéball Inner Capsule (Radius 28) */}
          <g clipPath="url(#pokeballClip)">
            <clipPath id="pokeballClip">
              <circle cx="50" cy="50" r="28" />
            </clipPath>

            {/* Top Crimson Hemisphere */}
            <rect x="22" y="22" width="56" height="28" fill="url(#sealRedGrad)" />

            {/* Bottom Pearl White Hemisphere */}
            <rect x="22" y="50" width="56" height="28" fill="url(#sealWhiteGrad)" />

            {/* Horizontal Seam Band */}
            <rect x="22" y="46" width="56" height="8" fill="#1e293b" />
          </g>

          {/* Pokeball Outer Border */}
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="#78350f"
            strokeWidth="2.5"
            filter="url(#sealShadow)"
          />

          {/* Central Release Button */}
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="9.5" fill="#1e293b" />
          {/* Middle Rim */}
          <circle cx="50" cy="50" r="7" fill="url(#sealGoldGrad)" stroke="#78350f" strokeWidth="1" />
          {/* Inner Glowing Center Core */}
          <circle cx="50" cy="50" r="4" fill="#ffffff" />
          <circle cx="50" cy="50" r="2.5" fill="#38bdf8" opacity="0.8" />

          {/* Specular Highlight / Holographic Sheen */}
          <path
            d="M 32 35 Q 50 28 68 35 A 23 23 0 0 0 32 35 Z"
            fill="#ffffff"
            fillOpacity="0.35"
          />
        </svg>
      </motion.div>
    );
  }

  if (status === 'registered') {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${dimension} ${className}`}
        title="Registered Pokédex Entry"
      >
        {/* Classic Silver / Steel Registry Insignia */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md filter"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            <linearGradient id="regRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            <path
              id="registeredTextPath"
              d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>

          {/* Outer Ring */}
          <circle cx="50" cy="50" r="46" fill="url(#silverGradient)" stroke="#475569" strokeWidth="1" />
          <circle cx="50" cy="50" r="43" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="41.5" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1.5 1.5" />

          {/* Circular Text */}
          <text className="font-mono font-bold fill-slate-300" style={{ fontSize: '7.8px', letterSpacing: '1.2px' }}>
            <textPath href="#registeredTextPath" startOffset="0%">
              ★ OFFICIAL POKÉDEX ENTRY • VERIFIED ★
            </textPath>
          </text>

          {/* Inner Medallion */}
          <circle cx="50" cy="50" r="28" fill="url(#silverGradient)" stroke="#475569" strokeWidth="1" />
          <circle cx="50" cy="50" r="25.5" fill="#1e293b" />

          {/* Pokéball Silhouette */}
          <path d="M 27 50 A 23 23 0 0 1 73 50 Z" fill="url(#regRed)" stroke="#0f172a" strokeWidth="1.2" />
          <path d="M 27 50 A 23 23 0 0 0 73 50 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.2" />
          <rect x="27" y="47.5" width="46" height="5" fill="#0f172a" />
          <circle cx="50" cy="50" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="50" cy="50" r="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          <circle cx="50" cy="50" r="2" fill="#10b981" />
        </svg>
      </div>
    );
  }

  // Unregistered / Undiscovered
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none opacity-50 grayscale ${dimension} ${className}`}
      title="Unregistered Pokémon"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" fill="#1e293b" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="28" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <path d="M 32 50 A 18 18 0 0 1 68 50 Z" fill="#475569" />
        <path d="M 32 50 A 18 18 0 0 0 68 50 Z" fill="#334155" />
        <rect x="32" y="48" width="36" height="4" fill="#0f172a" />
        <circle cx="50" cy="50" r="6" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="50" cy="50" r="3" fill="#64748b" />
      </svg>
    </div>
  );
};

export default PokeballSealInsignia;
