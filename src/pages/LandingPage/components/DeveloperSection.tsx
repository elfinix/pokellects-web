import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Mail, ExternalLink } from 'lucide-react';
import { TOTAL_POKEMON_COUNT } from '../../../services/pokemonIndex';

interface BadgeItem {
  id: string;
  name: string;
  creativeTitle: string;
  location: string;
  type: string;
  color: string;
  renderSvg: () => React.ReactNode;
}

const BADGES: BadgeItem[] = [
  {
    id: 'boulder',
    name: 'Boulder Badge',
    creativeTitle: 'Robust Foundation',
    location: 'Pewter Gym',
    type: 'Rock',
    color: '#64748b',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* Outer Octagon */}
        <polygon
          points="12,4 28,4 36,12 36,28 28,36 12,36 4,28 4,12"
          fill="#5a7d7c"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Inner Octagon */}
        <polygon
          points="14.5,10 25.5,10 30,14.5 30,25.5 25.5,30 14.5,30 10,25.5 10,14.5"
          fill="#4a6b6a"
          stroke="#1e293b"
          strokeWidth="1.2"
        />
        {/* Facet lines */}
        <line x1="12" y1="4" x2="14.5" y2="10" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="28" y1="4" x2="25.5" y2="10" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="36" y1="12" x2="30" y2="14.5" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="36" y1="28" x2="30" y2="25.5" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="28" y1="36" x2="25.5" y2="30" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="12" y1="36" x2="14.5" y2="30" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="4" y1="28" x2="10" y2="25.5" stroke="#1e293b" strokeWidth="1.2" />
        <line x1="4" y1="12" x2="10" y2="14.5" stroke="#1e293b" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'cascade',
    name: 'Cascade Badge',
    creativeTitle: 'Fluid Flow',
    location: 'Cerulean Gym',
    type: 'Water',
    color: '#38bdf8',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <path
          d="M20,4 C20,4 34,18 34,26.5 C34,33.5 27.5,37 20,37 C12.5,37 6,33.5 6,26.5 C6,18 20,4 20,4 Z"
          fill="#85c7f2"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M15,22 C15,17 20,10 20,10 C20,10 25,17 25,22 C25,25.5 22.8,28 20,28 C17.2,28 15,25.5 15,22 Z"
          fill="#ffffff"
          opacity="0.35"
        />
      </svg>
    ),
  },
  {
    id: 'thunder',
    name: 'Thunder Badge',
    creativeTitle: 'Fast Velocity',
    location: 'Vermilion Gym',
    type: 'Electric',
    color: '#facc15',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* Outer 8 Sunburst Points */}
        <polygon
          points="20,2 24.5,7.5 32.5,4 32.5,12 38,16.5 34,23.5 37.5,30 30,31.5 28.5,38 21.5,34 15.5,38 12.5,31.5 4,30.5 7,23.5 2.5,17 8.5,12 7.5,4.5 15.5,7.5"
          fill="#fef08a"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Middle Octagon Ring */}
        <polygon
          points="14,9 26,9 31,14 31,26 26,31 14,31 9,26 9,14"
          fill="#e5983b"
          stroke="#1e293b"
          strokeWidth="1.3"
        />
        {/* Inner Octagon Core */}
        <polygon
          points="16,13 24,13 27,16 27,24 24,27 16,27 13,24 13,16"
          fill="#d97706"
          stroke="#1e293b"
          strokeWidth="1"
        />
        {/* Corner Facet Lines */}
        <line x1="14" y1="9" x2="16" y2="13" stroke="#1e293b" strokeWidth="1" />
        <line x1="26" y1="9" x2="24" y2="13" stroke="#1e293b" strokeWidth="1" />
        <line x1="31" y1="14" x2="27" y2="16" stroke="#1e293b" strokeWidth="1" />
        <line x1="31" y1="26" x2="27" y2="24" stroke="#1e293b" strokeWidth="1" />
        <line x1="26" y1="31" x2="24" y2="27" stroke="#1e293b" strokeWidth="1" />
        <line x1="14" y1="31" x2="16" y2="27" stroke="#1e293b" strokeWidth="1" />
        <line x1="9" y1="26" x2="13" y2="24" stroke="#1e293b" strokeWidth="1" />
        <line x1="9" y1="14" x2="13" y2="16" stroke="#1e293b" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'rainbow',
    name: 'Rainbow Badge',
    creativeTitle: 'Prismatic UI',
    location: 'Celadon Gym',
    type: 'Grass',
    color: '#34d399',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* 8 Colored Petals */}
        <polygon points="17,3 23,3 25,10 15,10" fill="#dc2626" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="27,6 32,10 29,17 23,13" fill="#ea580c" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="31,16 36,20 31,25 25,21" fill="#fde047" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="28,26 31,32 24,34 21,27" fill="#86efac" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="17,37 23,37 24,30 16,30" fill="#22c55e" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="9,31 13,35 19,29 14,25" fill="#38bdf8" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="4,20 9,15 15,19 10,24" fill="#a855f7" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
        <polygon points="8,9 13,5 18,12 12,15" fill="#f472b6" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />

        {/* Center Disc with Floral Cutout */}
        <circle cx="20" cy="20" r="7.5" fill="#312e81" stroke="#1e293b" strokeWidth="1.3" />
        <path
          d="M20,15.5 C20.8,17.5 22.5,19.2 24.5,20 C22.5,20.8 20.8,22.5 20,24.5 C19.2,22.5 17.5,20.8 15.5,20 C17.5,19.2 19.2,17.5 20,15.5 Z"
          fill="#ffffff"
        />
      </svg>
    ),
  },
  {
    id: 'soul',
    name: 'Soul Badge',
    creativeTitle: 'Passionate Dedication',
    location: 'Fuchsia Gym',
    type: 'Poison',
    color: '#ec4899',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* Left Heart Half */}
        <path
          d="M20,11 C18,7 13.5,5 9,8 C4.5,11 4,17.5 7,23 C10,28.5 20,35.5 20,35.5 Z"
          fill="#ec4899"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Right Heart Half */}
        <path
          d="M20,11 C22,7 26.5,5 31,8 C35.5,11 36,17.5 33,23 C30,28.5 20,35.5 20,35.5 Z"
          fill="#d946ef"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Center Vertical Crease */}
        <line x1="20" y1="10.5" x2="20" y2="35.5" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'marsh',
    name: 'Marsh Badge',
    creativeTitle: 'Deductive Logic',
    location: 'Saffron Gym',
    type: 'Psychic',
    color: '#eab308',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* Outer Gold Ring */}
        <circle cx="20" cy="20" r="16.5" fill="#eab308" stroke="#1e293b" strokeWidth="1.6" />
        {/* Inner Gold Disc */}
        <circle cx="20" cy="20" r="10" fill="#facc15" stroke="#1e293b" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'volcano',
    name: 'Volcano Badge',
    creativeTitle: 'Relentless Drive',
    location: 'Cinnabar Gym',
    type: 'Fire',
    color: '#f97316',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* Outer 3-Spoke Flame Crest */}
        <path
          d="M20,5 C21.5,11 25.5,12 28.5,9.5 C29,18 35,16 34.5,25 C34,31.5 28.5,36 20,36 C11.5,36 6,31.5 5.5,25 C5,16 11,18 11.5,9.5 C14.5,12 18.5,11 20,5 Z"
          fill="#c2410c"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Inner Red Flame Drop */}
        <path
          d="M20,18 C20,18 26,24.5 26,27.5 C26,30.8 23.3,33.5 20,33.5 C16.7,33.5 14,30.8 14,27.5 C14,24.5 20,18 20,18 Z"
          fill="#b91c1c"
          stroke="#1e293b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'earth',
    name: 'Earth Badge',
    creativeTitle: 'Enduring Dex',
    location: 'Viridian Gym',
    type: 'Ground',
    color: '#22c55e',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        {/* Leaf / Feather Body with Ridges */}
        <path
          d="M9,7 L23,7 C23,7 29,10 30,13 L27,14 L32,18 L29,19 L33,24 L29,26 L32,30 L22,30 L22,27 L18,27 L18,24 L14,24 L14,21 L10,21 L10,18 L9,18 Z"
          fill="#86efac"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Stem at bottom right */}
        <line x1="28" y1="29" x2="34" y2="35" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="28" y1="29" x2="34" y2="35" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        {/* Inner rib segment line */}
        <path d="M12,10 L26,27" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
];

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const DeveloperSection: React.FC = () => {
  const [hoveredBadge, setHoveredBadge] = useState<BadgeItem | null>(null);
  const [sheenKey, setSheenKey] = useState(0);
  const contactEmail = 'elfinix.dev@gmail.com';

  return (
    <section id="developer" className="scroll-mt-16 pt-12 lg:pt-16 pb-20 lg:pb-28 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-100/20 dark:bg-red-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-100/15 dark:bg-blue-950/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-12 sm:space-y-14">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-2.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 select-none">
            <Code2 className="w-3.5 h-3.5 text-red-500" />
            <span>Behind the Project</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Meet the Developer
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Crafted out of genuine Pokémon fandom and keyboard-driven ergonomics.
          </p>
        </motion.div>

        {/* Floating Pokémon Trainer Card with Grounded Breathing Shadow */}
        <div className="relative flex flex-col items-center pt-3 sm:pt-5">
          {/* Continuous Floating Levitation Wrapper */}
          <motion.div
            animate={{
              y: [-12, 12, -12],
              rotateZ: [-0.6, 0.6, -0.6],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full flex justify-center z-10"
          >
            <motion.div
              whileHover={{ scale: 1.012 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onMouseEnter={() => setSheenKey((k) => k + 1)}
              className="relative w-full group rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-black/40 hover:shadow-2xl overflow-hidden select-none cursor-default"
            >
              {/* Diagonal Holographic Foil Sheen: One-Way Sweep from Top-Left to Bottom-Right */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 rounded-3xl">
                {sheenKey > 0 && (
                  <motion.div
                    key={sheenKey}
                    initial={{ x: '-60%', y: '-60%' }}
                    animate={{ x: '35%', y: '35%' }}
                    transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 42%, rgba(255,255,255,0.06) 46%, rgba(255,255,255,0.48) 50%, rgba(255,255,255,0.06) 54%, transparent 58%)',
                    }}
                  />
                )}
              </div>

            {/* Top Red Trainer Card Ribbon with Rich Contrast */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between text-white shadow-xs">
              <div className="flex items-center gap-2">
                {/* Pokéball Silhouette */}
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white/90 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-white/40" />
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-white z-10" />
                </div>
                <span className="font-display font-extrabold tracking-wider text-xs sm:text-sm">
                  TRAINER CARD
                </span>
              </div>

              {/* High-Contrast ID & Star Badge */}
              <div className="flex items-center gap-2 bg-black/25 backdrop-blur-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-white/20 shadow-xs">
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-white">
                  IDNo. 091326
                </span>
                <span className="text-amber-300 drop-shadow-xs font-bold text-[11px] sm:text-xs tracking-tight">
                  ★★★★★
                </span>
              </div>
            </div>

            {/* Card Interior */}
            <div className="p-4 sm:p-7 md:p-8 space-y-4 sm:space-y-6">
              {/* Top Identity Block: Avatar & Trainer Credentials */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Trainer Portrait Frame: Lucario Partner */}
                <div className="relative shrink-0">
                  <div className="w-20 h-22 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300/80 dark:border-slate-700 p-1 shadow-inner flex flex-col items-center justify-between overflow-hidden relative">
                    <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-b from-sky-50 to-blue-50/60 dark:from-sky-950/30 dark:to-blue-950/20 flex flex-col items-center justify-center relative">
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png"
                        alt="Partner Lucario"
                        className="w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-0.5 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-slate-900/80 dark:bg-black/80 text-white leading-none">
                        #448
                      </span>
                    </div>
                  </div>
                </div>

                {/* Identity & Mission Details */}
                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                  <div>
                    <div className="flex flex-row items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                        Elfinix
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                        Pokellects Creator
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                      Software & Pokémon Hobbyist
                    </p>
                  </div>

                  {/* Trainer Philosophy Quote */}
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    "A Pokédex companion should remember every victory."
                  </p>

                  {/* Single Consolidated Stat */}
                  <div className="flex items-center justify-center sm:justify-start text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="text-slate-400 dark:text-slate-500">NATIONAL POKÉDEX:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 ml-1.5">{TOTAL_POKEMON_COUNT.toLocaleString()} SPECIES</span>
                  </div>
                </div>
              </div>

              {/* Badges Display Case Ribbon */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                    <span>Mastery Badges</span>
                    <span className="text-amber-500">🏆</span>
                  </span>
                </div>

                {/* Inset Badge Tray */}
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-100/90 to-slate-50/80 dark:from-slate-950/90 dark:to-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-inner">
                  <div className="grid grid-cols-8 gap-1 sm:gap-2 items-center justify-items-center">
                    {BADGES.map((badge) => (
                      <div
                        key={badge.id}
                        onMouseEnter={() => setHoveredBadge(badge)}
                        onMouseLeave={() => setHoveredBadge(null)}
                        className="relative group/badge p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.25, y: -2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                        >
                          {badge.renderSvg()}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Badge Tooltip */}
                <div className="min-h-6 flex items-center justify-center text-center px-2">
                  <AnimatePresence mode="wait">
                    {hoveredBadge ? (
                      <motion.div
                        key={hoveredBadge.id}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-mono"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hoveredBadge.color }} />
                        <span className="font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                          "{hoveredBadge.creativeTitle}"
                        </span>
                      </motion.div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-mono">
                        Hover badges to view creative mastery titles
                      </span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Trainer Actions & Certified Status */}
              <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/elfinix"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Contact Me</span>
                  </a>
                </div>

                {/* Prestige Certification Tag */}
                <div className="text-[10px] sm:text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>League Certified</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

          {/* Grounded Floating Drop Shadow */}
          <motion.div
            animate={{
              scale: [0.92, 1.02, 0.92],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-4/5 h-6 bg-slate-900/15 dark:bg-black/40 blur-xl rounded-full -mt-2 pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
