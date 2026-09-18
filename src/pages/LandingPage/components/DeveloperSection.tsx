import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Copy, Check, ExternalLink } from 'lucide-react';

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
    creativeTitle: 'Rock-Solid Architecture',
    location: 'Pewter Gym',
    type: 'Rock',
    color: '#94a3b8',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="boulderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
        <polygon points="12,4 28,4 36,12 36,28 28,36 12,36 4,28 4,12" fill="url(#boulderGrad)" stroke="#334155" strokeWidth="1.5" />
        <polygon points="15,10 25,10 30,15 30,25 25,30 15,30 10,25 10,15" fill="#64748b" opacity="0.4" />
        <polygon points="12,4 20,20 4,12" fill="#ffffff" opacity="0.25" />
      </svg>
    ),
  },
  {
    id: 'cascade',
    name: 'Cascade Badge',
    creativeTitle: 'Fluid Interaction Flow',
    location: 'Cerulean Gym',
    type: 'Water',
    color: '#38bdf8',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="cascadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <path
          d="M20,4 C20,4 33,18 33,26 C33,33.18 27.18,37 20,37 C12.82,37 7,33.18 7,26 C7,18 20,4 20,4 Z"
          fill="url(#cascadeGrad)"
          stroke="#0369a1"
          strokeWidth="1.5"
        />
        <path d="M14,24 C14,19 20,10 20,10 C20,10 26,19 26,24 C26,27.3 23.3,30 20,30 C16.7,30 14,27.3 14,24 Z" fill="#ffffff" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'thunder',
    name: 'Thunder Badge',
    creativeTitle: 'Zero-Latency Velocity',
    location: 'Vermilion Gym',
    type: 'Electric',
    color: '#facc15',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="thunderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <polygon
          points="20,2 24,14 36,14 27,22 31,34 20,27 9,34 13,22 4,14 16,14"
          fill="url(#thunderGrad)"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        <circle cx="20" cy="20" r="4.5" fill="#fef9c3" stroke="#b45309" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'rainbow',
    name: 'Rainbow Badge',
    creativeTitle: 'Prismatic UI Polish',
    location: 'Celadon Gym',
    type: 'Grass',
    color: '#34d399',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <radialGradient id="rainbowCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="9" r="6" fill="#f43f5e" />
        <circle cx="29" cy="14" r="6" fill="#f97316" />
        <circle cx="31" cy="25" r="6" fill="#eab308" />
        <circle cx="25" cy="32" r="6" fill="#22c55e" />
        <circle cx="15" cy="32" r="6" fill="#06b6d4" />
        <circle cx="9" cy="25" r="6" fill="#3b82f6" />
        <circle cx="11" cy="14" r="6" fill="#a855f7" />
        <circle cx="20" cy="20" r="6.5" fill="url(#rainbowCenter)" stroke="#0e7490" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'soul',
    name: 'Soul Badge',
    creativeTitle: 'Passionate Dedication',
    location: 'Fuchsia Gym',
    type: 'Poison',
    color: '#c084fc',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="soulGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
        <path
          d="M20,6 C13,6 7,12 7,19 C7,27 20,36 20,36 C20,36 33,27 33,19 C33,12 27,6 20,6 Z"
          fill="url(#soulGrad)"
          stroke="#6b21a8"
          strokeWidth="1.5"
        />
        <circle cx="20" cy="18" r="4.5" fill="#faf5ff" stroke="#6b21a8" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'marsh',
    name: 'Marsh Badge',
    creativeTitle: 'Deductive Game Logic',
    location: 'Saffron Gym',
    type: 'Psychic',
    color: '#eab308',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="marshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="16" fill="url(#marshGrad)" stroke="#78350f" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="10" fill="#fef9c3" stroke="#854d0e" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="4.5" fill="#eab308" />
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
        <defs>
          <linearGradient id="volcanoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <polygon points="20,3 36,19 28,37 12,37 4,19" fill="url(#volcanoGrad)" stroke="#991b1b" strokeWidth="1.5" />
        <polygon points="20,10 28,21 23,31 17,31 12,21" fill="#fef2f2" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'earth',
    name: 'Earth Badge',
    creativeTitle: 'Enduring Ledger',
    location: 'Viridian Gym',
    type: 'Ground',
    color: '#22c55e',
    renderSvg: () => (
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <path
          d="M20,3 C24,10 32,16 32,25 C32,32 26.5,37 20,37 C13.5,37 8,32 8,25 C8,16 16,10 20,3 Z"
          fill="url(#earthGrad)"
          stroke="#166534"
          strokeWidth="1.5"
        />
        <line x1="20" y1="9" x2="20" y2="34" stroke="#dcfce7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="16" x2="26" y2="13" stroke="#dcfce7" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="20" y1="22" x2="14" y2="19" stroke="#dcfce7" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="20" y1="28" x2="26" y2="25" stroke="#dcfce7" strokeWidth="1.2" strokeLinecap="round" />
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
  const [isCopied, setIsCopied] = useState(false);
  const [sheenKey, setSheenKey] = useState(0);
  const contactEmail = 'elfinix.dev@gmail.com';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  return (
    <section id="developer" className="scroll-mt-16 pt-12 lg:pt-16 pb-20 lg:pb-28 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-100/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-100/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto space-y-12 sm:space-y-14">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-2.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 select-none">
            <Code2 className="w-3.5 h-3.5 text-red-500" />
            <span>Behind the Project</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Meet the Developer
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
            Crafted out of genuine Pokémon fandom and keyboard-driven ergonomics.
          </p>
        </motion.div>

        {/* Floating Pokémon Trainer Card with Grounded Breathing Shadow */}
        <div className="relative flex flex-col items-center pt-3 sm:pt-5">
          {/* Continuous Floating Levitation Wrapper (No hover freeze, no CSS transition conflict) */}
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
              className="relative w-full group rounded-3xl bg-white/95 border-2 border-slate-200/90 shadow-xl hover:shadow-2xl overflow-hidden select-none cursor-default"
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
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 sm:px-8 py-3.5 flex items-center justify-between text-white shadow-xs">
              <div className="flex items-center gap-2.5">
                {/* Pokéball Silhouette */}
                <div className="w-5 h-5 rounded-full border-2 border-white/90 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-white/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white z-10" />
                </div>
                <span className="font-display font-extrabold tracking-wider text-sm sm:text-base">
                  TRAINER CARD
                </span>
              </div>

              {/* High-Contrast ID & Star Badge */}
              <div className="flex items-center gap-2.5 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/20 shadow-xs">
                <span className="text-xs font-mono font-bold tracking-wider text-white">
                  IDNo. 091326
                </span>
                <span className="text-amber-300 drop-shadow-xs font-bold text-xs tracking-tight">
                  ★★★★★
                </span>
              </div>
            </div>

            {/* Card Interior */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Top Identity Block: Avatar & Trainer Credentials */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Trainer Portrait Frame: Lucario Partner */}
                <div className="relative shrink-0">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 border-2 border-slate-300/80 p-1 shadow-inner flex flex-col items-center justify-between overflow-hidden relative">
                    {/* Portrait Inner Canvas */}
                    <div className="w-full h-full rounded-xl bg-gradient-to-b from-sky-50 to-blue-50/60 flex flex-col items-center justify-center relative">
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png"
                        alt="Partner Lucario"
                        className="w-20 h-20 sm:w-22 sm:h-22 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/80 text-white leading-none">
                        #448
                      </span>
                    </div>
                  </div>

                  {/* Trainer Level Chip */}
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold shadow-xs border border-white">
                    Lv. 100
                  </div>
                </div>

                {/* Identity & Mission Details */}
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <h3 className="text-2xl font-black font-display text-slate-900 tracking-tight">
                        Elfinix
                      </h3>
                      <span className="self-center sm:self-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Pokellects Creator
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Software Engineer & Pokémon Archivist
                    </p>
                  </div>

                  {/* Trainer Philosophy Quote */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
                    "Traditional trivia wipes your score the minute you close the tab. Pokellects is
                    built as a persistent, keyboard-first Pokédex companion that remembers every victory."
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1 font-mono">
                    <div>
                      <span className="text-slate-400">ROSTER: </span>
                      <span className="font-bold text-slate-800">1,025 Logged</span>
                    </div>
                    <span>•</span>
                    <div>
                      <span className="text-slate-400">REGION: </span>
                      <span className="font-bold text-slate-800">National</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges Display Case Ribbon: Creative Mastery Titles */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                    <span>HONORARY MASTERY BADGES</span>
                    <span className="text-amber-500">🏆</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">8 / 8 Mastered</span>
                </div>

                {/* Inset Badge Tray */}
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-100/90 to-slate-50/80 border-2 border-slate-200/90 shadow-inner">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-2 items-center justify-items-center">
                    {BADGES.map((badge) => (
                      <div
                        key={badge.id}
                        onMouseEnter={() => setHoveredBadge(badge)}
                        onMouseLeave={() => setHoveredBadge(null)}
                        className="relative group/badge p-1.5 rounded-xl hover:bg-white transition-all duration-200 flex flex-col items-center justify-center cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.25, y: -2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center"
                        >
                          {badge.renderSvg()}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Badge Tooltip: Prominently Featuring Creative Titles */}
                <div className="h-6 flex items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    {hoveredBadge ? (
                      <motion.div
                        key={hoveredBadge.id}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 text-xs font-mono"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hoveredBadge.color }} />
                        <span className="font-extrabold text-slate-900 font-display text-sm">
                          "{hoveredBadge.creativeTitle}"
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({hoveredBadge.name} • {hoveredBadge.location})
                        </span>
                      </motion.div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Hover over any badge to inspect creative mastery titles
                      </span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Trainer Actions & Certified Status */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/elfinix"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border font-semibold transition-all shadow-2xs cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Email Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prestige Certification Tag */}
                <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Pokémon League Certified</span>
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
            className="w-4/5 h-6 bg-slate-900/15 blur-xl rounded-full -mt-2 pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
