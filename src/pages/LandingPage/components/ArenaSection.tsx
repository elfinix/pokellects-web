import React, { useState, useRef } from 'react';
import {
  Eye,
  Type,
  Volume2,
  ScrollText,
  Trophy,
  ArrowRight,
  Flame,
  Sparkles,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';

interface ArenaSectionProps {
  onNavigateToLogin?: () => void;
}

type GameMode = 'silhouette' | 'hangmon' | 'identicry' | 'biologist';

export const ArenaSection: React.FC<ArenaSectionProps> = ({ onNavigateToLogin }) => {
  const { isDark } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<GameMode | null>(null);
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const cryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Web Audio Synthesizer for Identicry Hover Effect
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playIdenticryAudio = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Retro 8-bit ghost species sound cry (~750ms duration)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.55);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.72);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);

      setIsPlayingCry(true);
      if (cryTimerRef.current) clearTimeout(cryTimerRef.current);
      cryTimerRef.current = setTimeout(() => {
        setIsPlayingCry(false);
      }, 750);
    } catch {
      // Audio autoplay policy fallback
      setIsPlayingCry(true);
      if (cryTimerRef.current) clearTimeout(cryTimerRef.current);
      cryTimerRef.current = setTimeout(() => {
        setIsPlayingCry(false);
      }, 750);
    }
  };

  const handleIdenticryEnter = () => {
    setHoveredCard('identicry');
    playIdenticryAudio();
  };

  const handleIdenticryLeave = () => {
    setHoveredCard(null);
  };

  const hangmonLetters = ['C', 'H', 'A', 'R', 'I', 'Z', 'A', 'R', 'D'];
  const alphabetPool = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'M', 'N', 'O', 'P', 'R', 'T', 'Z'];

  // 36 slender frequency bars for studio-grade acoustic visualizer
  const frequencyBars = [
    18, 28, 42, 60, 78, 92, 70, 52, 38, 56, 74, 95, 84, 66, 48, 62, 80, 100,
    90, 72, 54, 36, 50, 68, 88, 76, 58, 44, 60, 82, 94, 78, 56, 40, 26, 16,
  ];

  return (
    <section id="games" className="scroll-mt-16 pt-14 lg:pt-18 pb-14 lg:pb-18 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Ambient decorative aura */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-red-100/15 dark:bg-red-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-100/10 dark:bg-amber-950/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 select-none">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Minigames Discovery Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Discovery Minigames
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            Four specialized trial formats engineered to test visual instinct, vocabulary, acoustic memory, and field literature deduction. Hover into each card to trigger its live preview.
          </p>
        </motion.div>

        {/* 2x2 Interactive Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* ================= CARD 1: WHO'S THAT POKÉMON? (Silhouette Reveal) ================= */}
          <div
            onMouseEnter={() => setHoveredCard('silhouette')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative h-[380px] sm:h-[390px] w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-6 sm:p-7 flex flex-col justify-between overflow-hidden cursor-default"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent" />

            {/* Glowing Aura on Hover */}
            <div
              className={`absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/20 via-pink-400/10 to-transparent blur-2xl pointer-events-none transition-opacity duration-300 ${
                hoveredCard === 'silhouette' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    01 · Visual Recognition
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                    Who's That Pokémon?
                  </h3>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900/60 text-purple-800 dark:text-purple-300">
                Untimed / Skip
              </span>
            </div>

            {/* Centerpiece: Dynamic Silhouette / Reveal Action */}
            <div className="my-auto py-2 relative z-10 flex items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                {/* Radar Circle Container */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-purple-50/80 to-pink-50/50 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-slate-950 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                  {/* Rotating Radar Ring */}
                  <div
                    className={`absolute inset-2 rounded-full border border-dashed border-purple-300/60 dark:border-purple-700/60 transition-all ${
                      hoveredCard === 'silhouette' ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '6s' }}
                  />

                  {/* Pokémon Sprite (Morphs from dark slate silhouette to full color artwork) */}
                  <motion.img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                    alt="Pikachu"
                    animate={{
                      filter:
                        hoveredCard === 'silhouette'
                          ? 'brightness(1) drop-shadow(0 12px 20px rgba(168,85,247,0.45))'
                          : isDark
                          ? 'brightness(0) invert(0.35) opacity(0.85) drop-shadow(0 6px 14px rgba(0,0,0,0.5))'
                          : 'brightness(0) invert(0.2) opacity(0.85) drop-shadow(0 6px 12px rgba(0,0,0,0.25))',
                      scale: hoveredCard === 'silhouette' ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain select-none z-10"
                  />
                </div>

                {/* Info & Action Feed */}
                <div className="space-y-2.5 text-left flex-1">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
                      {hoveredCard === 'silhouette' ? 'Recognition Verified' : 'Mystery Silhouette'}
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                      {hoveredCard === 'silhouette' ? '#025 Pikachu' : 'Silhouette Scan'}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {hoveredCard === 'silhouette'
                      ? 'Target confirmed! Correct deduction registers electric typing into your Dex.'
                      : 'Identify the shadowy outline at your own pace by typing the exact species name, or skip to another.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        hoveredCard === 'silhouette'
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ⚡ Electric Type
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        hoveredCard === 'silhouette'
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      📍 Gen 1 Kanto
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Cue */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs relative z-10">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {hoveredCard === 'silhouette'
                  ? '✨ Revealed on hover'
                  : 'Hover card to reveal silhouette'}
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center gap-1">
                <span>+1 Guaranteed Entry</span>
              </span>
            </div>
          </div>

          {/* ================= CARD 2: HANGMON (Words Animate to Boxes) ================= */}
          <div
            onMouseEnter={() => setHoveredCard('hangmon')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative h-[380px] sm:h-[390px] w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-6 sm:p-7 flex flex-col justify-between overflow-hidden cursor-default"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-transparent" />

            {/* Glowing Aura on Hover */}
            <div
              className={`absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-transparent blur-2xl pointer-events-none transition-opacity duration-300 ${
                hoveredCard === 'hangmon' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs shrink-0">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    02 · Letter Deduction
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                    Hangmon
                  </h3>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300">
                6 Strikes
              </span>
            </div>

            {/* Centerpiece: Letter Flying / Appearing Action */}
            <div className="my-auto py-2 relative z-10 space-y-4">
              {/* Top Status Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Clue: Flame Pokémon</span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-full transition-all duration-200 ${
                    hoveredCard === 'hangmon'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-transparent'
                  }`}
                >
                  {hoveredCard === 'hangmon' ? 'Solved: #006 Charizard ✓' : '9-Letter Target'}
                </span>
              </div>

              {/* Word Letter Slots */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {hangmonLetters.map((char, idx) => {
                  const isFilled = hoveredCard === 'hangmon';

                  return (
                    <motion.div
                      key={idx}
                      animate={{
                        scale: isFilled ? 1.05 : 1,
                        y: isFilled ? -2 : 0,
                      }}
                      transition={{
                        duration: 0.25,
                        delay: isFilled ? idx * 0.025 : 0,
                        ease: 'easeOut',
                      }}
                      className={`w-7 h-10 sm:w-8 sm:h-11 rounded-xl border-2 flex items-center justify-center font-bold text-sm sm:text-base select-none transition-colors duration-200 ${
                        isFilled
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 shadow-sm shadow-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-transparent border-dashed'
                      }`}
                    >
                      <span className={`transition-opacity duration-200 ${isFilled ? 'opacity-100' : 'opacity-0'}`}>
                        {char}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Alphabet Selection Pool */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block text-center">
                  Alphabet Selection Pool
                </span>
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap max-w-sm mx-auto">
                  {alphabetPool.map((letter) => {
                    const isUsed = hoveredCard === 'hangmon' && hangmonLetters.includes(letter);

                    return (
                      <motion.span
                        key={letter}
                        animate={{
                          scale: isUsed ? 1.06 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-xs flex items-center justify-center transition-colors duration-200 ${
                          isUsed
                            ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold border-blue-600 dark:border-blue-400 shadow-xs shadow-blue-500/30'
                            : 'text-slate-700 dark:text-slate-300 font-semibold bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 shadow-2xs'
                        }`}
                      >
                        {letter}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Cue */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs relative z-10">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {hoveredCard === 'hangmon'
                  ? '✨ Letters deduced into slots'
                  : 'Hover card to animate deduction'}
              </span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold text-xs flex items-center gap-1">
                <span>+1 Guaranteed Entry</span>
              </span>
            </div>
          </div>

          {/* ================= CARD 3: IDENTICRY (Audio Cry Identification) ================= */}
          <div
            onMouseEnter={handleIdenticryEnter}
            onMouseLeave={handleIdenticryLeave}
            className="group relative h-[380px] sm:h-[390px] w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-6 sm:p-7 flex flex-col justify-between overflow-hidden cursor-default"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-transparent" />

            {/* Glowing Aura on Hover */}
            <div
              className={`absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-transparent blur-2xl pointer-events-none transition-opacity duration-300 ${
                hoveredCard === 'identicry' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    03 · Acoustic Memory
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                    Identicry
                  </h3>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span>Audio Cry</span>
              </span>
            </div>

            {/* Centerpiece: Equalizer & Clue Identification Feed */}
            <div className="my-auto py-2 relative z-10 space-y-3.5">
              {/* Equalizer Visualizer Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingCry ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>Acoustic Frequency Profile</span>
                  </span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold text-xs">
                    {isPlayingCry
                      ? 'Playing 8-bit Cry...'
                      : 'Authentic Cry Audio'}
                  </span>
                </div>

                {/* 36 Slender Visualizer Bars */}
                <div className="flex items-end justify-between gap-[2.5px] sm:gap-[3px] h-20 w-full px-1">
                  {frequencyBars.map((baseHeight, idx) => (
                    <motion.div
                      key={idx}
                      animate={{
                        height:
                          isPlayingCry
                            ? [
                                `${Math.max(12, baseHeight * 0.3)}%`,
                                `${baseHeight}%`,
                                `${Math.max(12, baseHeight * 0.55)}%`,
                              ]
                            : '18%',
                      }}
                      transition={
                        isPlayingCry
                          ? {
                              repeat: Infinity,
                              duration: 0.32 + (idx % 6) * 0.05,
                              ease: 'easeInOut',
                            }
                          : {
                              duration: 0.65,
                              ease: [0.22, 1, 0.36, 1],
                              delay: (idx % 8) * 0.02,
                            }
                      }
                      className={`w-full max-w-[5px] rounded-t-full transition-colors duration-500 ${
                        isPlayingCry
                          ? 'bg-gradient-to-t from-amber-600 via-orange-500 to-yellow-400'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Deduction Clues Pill Feed */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60">
                    Gen 1
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60">
                    Ghost / Poison
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60">
                    6 Letters (G•••••)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 font-mono shrink-0">
                  {hoveredCard === 'identicry' ? '→ Gengar ✓' : 'Type to solve'}
                </span>
              </div>
            </div>

            {/* Footer Cue */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs relative z-10">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {hoveredCard === 'identicry'
                  ? '🔊 Sound cry & clue analysis'
                  : 'Hover card to play sound cry'}
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center gap-1">
                <span>+1 Guaranteed Entry</span>
              </span>
            </div>
          </div>

          {/* ================= CARD 4: BIOLO-GIST (Bulbapedia Field Literature) ================= */}
          <div
            onMouseEnter={() => setHoveredCard('biologist')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative h-[380px] sm:h-[390px] w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-6 sm:p-7 flex flex-col justify-between overflow-hidden cursor-default"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-transparent" />

            {/* Glowing Aura on Hover */}
            <div
              className={`absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-teal-400/20 via-emerald-400/10 to-transparent blur-2xl pointer-events-none transition-opacity duration-300 ${
                hoveredCard === 'biologist' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs shrink-0">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    04 · Field Literature
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                    Biolo-gist
                  </h3>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <span>Bulbapedia Excerpt</span>
              </span>
            </div>

            {/* Centerpiece: Masked Passage Preview */}
            <div className="my-auto py-2 relative z-10 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 text-left space-y-2 relative">
                <div className="flex items-center justify-between text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>Pokémon Biology</span>
                  </span>
                  <span className="font-mono text-slate-400 dark:text-slate-500">1× Redacted</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed line-clamp-3">
                  <span className="inline-block bg-teal-900 dark:bg-teal-950 text-teal-900 dark:text-teal-950 rounded-xs px-1.5 py-0.5 text-[10px] mx-0.5 select-none align-middle font-sans">
                    {hoveredCard === 'biologist' ? 'Lucario' : '▢▢▢▢▢'}
                  </span>
                  {' '}is a bipedal, canine Pokémon with fur that is predominantly blue and black. It possesses a short, round spike on the back of each forepaw and a third on its chest...
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hints:</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    Gen 4
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-white shadow-2xs">
                    Fighting
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-500 text-white shadow-2xs">
                    Steel
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Cue */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs relative z-10">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {hoveredCard === 'biologist'
                  ? '✨ Redaction decoded on hover'
                  : 'Hover card to reveal excerpt'}
              </span>
              <span className="text-teal-700 dark:text-teal-400 font-semibold text-xs flex items-center gap-1">
                <span>+1 Guaranteed Entry</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Minigame Feature Badges & Direct Launch CTA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle glowing corner light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
                Minigame Progression Ladder
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
              Win Streaks Unlock Higher Rarity Species
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-normal leading-relaxed">
              Reach 3-win, 5-win, and 10-win milestones to guarantee starter evolutions, pseudo-legendaries,
              and mythical Pokémon encounters directly registered into your ledger.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={onNavigateToLogin}
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="group relative overflow-hidden px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-md transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <span className="relative z-10">Launch Minigames</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ArenaSection;
