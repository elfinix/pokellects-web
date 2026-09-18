import React, { useRef } from 'react';
import {
  BookOpen,
  Keyboard,
  Trophy,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

export const AboutSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this 290vh runway (Lenis handles smooth wheel scrolling globally)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ================= CARD 0 (Permanent Collection Ledger) =================
  // Active: 0 -> 0.16, smoothly peels away: 0.16 -> 0.38
  const x0 = useTransform(scrollYProgress, [0, 0.16, 0.38], ['0%', '0%', '-115%']);
  const rotate0 = useTransform(scrollYProgress, [0, 0.16, 0.38], [0, 0, -4]);
  const scale0 = useTransform(scrollYProgress, [0, 0.16, 0.38], [1, 1, 0.95]);
  const opacity0 = useTransform(scrollYProgress, [0, 0.18, 0.38], [1, 1, 0]);

  // ================= CARD 1 (Continuous Fast Input) =================
  // Glides in: 0.16 -> 0.38, active: 0.38 -> 0.58, peels away: 0.58 -> 0.78
  const x1 = useTransform(
    scrollYProgress,
    [0.16, 0.38, 0.58, 0.78],
    ['40%', '0%', '0%', '-115%']
  );
  const rotate1 = useTransform(
    scrollYProgress,
    [0.16, 0.38, 0.58, 0.78],
    [3, 0, 0, -4]
  );
  const scale1 = useTransform(
    scrollYProgress,
    [0.16, 0.38, 0.58, 0.78],
    [0.94, 1, 1, 0.95]
  );
  const opacity1 = useTransform(
    scrollYProgress,
    [0.16, 0.30, 0.58, 0.76],
    [0, 1, 1, 0]
  );

  // ================= CARD 2 (Smart Arena Progression) =================
  // Glides in: 0.58 -> 0.78, active: 0.78 -> 1.0 (100% solid, fully opaque, generous allowance)
  const x2 = useTransform(
    scrollYProgress,
    [0.58, 0.78, 1.0],
    ['40%', '0%', '0%']
  );
  const rotate2 = useTransform(
    scrollYProgress,
    [0.58, 0.78, 1.0],
    [3, 0, 0]
  );
  const scale2 = useTransform(
    scrollYProgress,
    [0.58, 0.78, 1.0],
    [0.94, 1, 1]
  );
  const opacity2 = useTransform(
    scrollYProgress,
    [0.58, 0.72, 1.0],
    [0, 1, 1]
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative h-[290vh]"
    >
      {/* Pinned Full-Screen Viewport Stage covering entire screen height below sticky header */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center pt-16 sm:pt-20 pb-4 sm:pb-6 px-3 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft ambient background aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-red-100/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Center Stage: Full-Height Swiping Card Container */}
        <div className="relative w-full max-w-6xl xl:max-w-7xl h-[calc(100vh-8rem)] min-h-[500px] flex items-center justify-center select-none my-auto">
          {/* ================= CARD 01: PERMANENT LEDGER ================= */}
          <motion.div
            style={{
              x: x0,
              scale: scale0,
              rotate: rotate0,
              opacity: opacity0,
              zIndex: 30,
              willChange: 'transform, opacity',
            }}
            className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-900/[0.04] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 overflow-y-auto lg:overflow-hidden"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-400 to-amber-400" />

            {/* Left Column: Narrative Copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80">
                <BookOpen className="w-4 h-4" />
                <span>01 • Persistent Ledger</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight leading-[1.12]">
                  A Pokédex That <br className="hidden sm:block" />
                  <span className="text-red-600">Never Resets</span>.
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  Traditional trivia quizzes discard your progress the second you close the tab.
                  Pokellects gives your Pokémon knowledge permanence, archiving every species into an
                  immutable national ledger.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>1,025 Species National Roster</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Permanent Local & Cloud Sync</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Zero Session Loss Guarantee</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Real-time Regional Breakdown</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Interactive Ledger Preview (Light Mode) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="w-full max-w-md lg:max-w-lg rounded-2xl bg-slate-50/90 text-slate-800 p-6 sm:p-7 border border-slate-200/90 shadow-2xs relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      National Archive
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    SYNCED
                  </span>
                </div>

                {/* Progress Gauge */}
                <div className="py-2 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-mono">
                    <span className="text-slate-500">Ledger Completion</span>
                    <span className="text-red-600 font-bold">384 / 1,025 (37.5%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 rounded-full w-[37.5%]" />
                  </div>
                </div>

                {/* Mini Grid of Species in Clean Light Cards */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {/* #006 Charizard */}
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                    <span className="text-[10px] font-mono text-slate-400 self-start">#006</span>
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
                      alt="Charizard"
                      className="w-14 h-14 object-contain filter drop-shadow-sm my-1"
                    />
                    <span className="text-xs font-bold text-slate-800 truncate w-full">Charizard</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 mt-1 font-semibold border border-red-200/60">Fire</span>
                  </div>

                  {/* #094 Gengar */}
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                    <span className="text-[10px] font-mono text-slate-400 self-start">#094</span>
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
                      alt="Gengar"
                      className="w-14 h-14 object-contain filter drop-shadow-sm my-1"
                    />
                    <span className="text-xs font-bold text-slate-800 truncate w-full">Gengar</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 mt-1 font-semibold border border-purple-200/60">Ghost</span>
                  </div>

                  {/* #448 Lucario */}
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
                    <span className="text-[10px] font-mono text-slate-400 self-start">#448</span>
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png"
                      alt="Lucario"
                      className="w-14 h-14 object-contain filter drop-shadow-sm my-1"
                    />
                    <span className="text-xs font-bold text-slate-800 truncate w-full">Lucario</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 mt-1 font-semibold border border-blue-200/60">Steel</span>
                  </div>

                  {/* 3 Undiscovered Mystery Slots */}
                  {[1, 2, 3].map((slot) => (
                    <div
                      key={slot}
                      className="bg-slate-100/70 rounded-xl p-2.5 border border-dashed border-slate-300/80 flex flex-col items-center justify-center text-center py-5"
                    >
                      <Lock className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-mono text-slate-400 font-bold">???</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= CARD 02: FLUID FAST INPUT ================= */}
          <motion.div
            style={{
              x: x1,
              scale: scale1,
              rotate: rotate1,
              opacity: opacity1,
              zIndex: 20,
              willChange: 'transform, opacity',
            }}
            className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-900/[0.04] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 overflow-y-auto lg:overflow-hidden"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

            {/* Left Column: Narrative Copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Keyboard className="w-4 h-4" />
                <span>02 • Rapid Input Engine</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight leading-[1.12]">
                  Continuous <br className="hidden sm:block" />
                  <span className="text-blue-600">Fast Recall</span>.
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  Engineered specifically for lightning-fast memory recall. Type any species name
                  into the floating omnibar, inspect typing multipliers, then hit <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-xs font-semibold text-slate-800">Esc</kbd> to return instantly to the search bar.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Instant Keystroke Fuzzy Match</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Esc Key Instant Focus Reset</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Zero-Mouse Workflow Tuning</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Live Type Multiplier Matrix</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Omnibar Keyboard HUD (Light Mode) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="w-full max-w-md lg:max-w-lg rounded-2xl bg-slate-50/90 text-slate-800 p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4 relative">
                {/* Floating Search Bar Mockup */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-blue-400/60 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-blue-500 font-mono text-base font-bold">/</span>
                    <span className="text-base font-semibold text-slate-900">Gengar</span>
                    <span className="w-2 h-5 bg-blue-500 animate-pulse" />
                  </div>
                  <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 font-medium">
                    Esc to Clear
                  </kbd>
                </div>

                {/* Instant Match Result Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                  <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
                    alt="Gengar"
                    className="w-16 h-16 object-contain filter drop-shadow-sm"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">#094 Gengar</span>
                      <span className="text-xs font-mono text-slate-400">Gen 1</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold">Ghost</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200/70 font-semibold">Poison</span>
                    </div>
                  </div>
                </div>

                {/* Type Matrix Matchup Pill Breakdown */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/70 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Immunity (0×)</span>
                    <span className="text-emerald-700 font-semibold">Normal, Fighting</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Weakness (2×)</span>
                    <span className="text-rose-600 font-semibold">Ground, Psychic, Ghost, Dark</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-500">
                  <span>Tab: Next match</span>
                  <span className="text-blue-600 font-semibold">Enter: Inspect Full Stats</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= CARD 03: ARENA DISCOVERY ================= */}
          <motion.div
            style={{
              x: x2,
              scale: scale2,
              rotate: rotate2,
              opacity: opacity2,
              zIndex: 10,
              willChange: 'transform, opacity',
            }}
            className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-900/[0.04] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 overflow-y-auto lg:overflow-hidden"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-400 to-amber-400" />

            {/* Left Column: Narrative Copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                <Trophy className="w-4 h-4" />
                <span>03 • Minigame Discovery</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight leading-[1.12]">
                  Game-Driven <br className="hidden sm:block" />
                  <span className="text-purple-600">Smart Unlocks</span>.
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  Challenges in Pokellects carry permanent progression. Every victory in our
                  minigames algorithmically rewards a guaranteed undiscovered species directly into your
                  ledger, accelerating full roster completion.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Guaranteed Undiscovered Unlocks</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Streak Multiplier Bonuses</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Deduction & Acoustic Mechanics</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Mythical & Legendary Milestones</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Minigame Victory & Unlock HUD (Light Mode) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="w-full max-w-md lg:max-w-lg rounded-2xl bg-slate-50/90 text-slate-800 p-6 sm:p-7 border border-slate-200/90 shadow-2xs relative overflow-hidden space-y-4">
                {/* Header: Victory Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2 text-amber-600 text-xs sm:text-sm font-bold font-mono">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>MINIGAME VICTORY</span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    5-WIN STREAK
                  </span>
                </div>

                {/* Newly Discovered Pokémon Holographic Showcase */}
                <div className="relative rounded-xl bg-gradient-to-b from-purple-50 via-white to-white p-5 border border-purple-200/80 shadow-2xs flex flex-col items-center text-center overflow-hidden">
                  <span className="text-[11px] font-mono text-purple-600 font-bold uppercase tracking-wider mb-2">
                    ★ Rare Discovery Unlocked ★
                  </span>

                  <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png"
                    alt="Dragonite"
                    className="w-28 h-28 object-contain filter drop-shadow-sm my-1 animate-bounce"
                    style={{ animationDuration: '3s' }}
                  />

                  <div className="space-y-1 mt-1">
                    <span className="text-base font-extrabold text-slate-900">#149 Dragonite</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">Dragon</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200/60">Flying</span>
                    </div>
                  </div>
                </div>

                {/* Ledger Registration Stamp */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono">
                  <span className="text-slate-500">Ledger Entry:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    +1 Permanent Roster Entry
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
