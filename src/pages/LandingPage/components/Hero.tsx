import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Flame, Compass, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { Pokemon } from '../../../types/pokemon';
import ThreeHeroCanvas from './ThreeHeroCanvas';
import PokeBallBurst from './PokeBallBurst';
import PeekingSquad from './PeekingSquad';
import PokeBallHoverDialog from './PokeBallHoverDialog';

interface HeroProps {
  onNavigateToLogin: () => void;
  onBallClick: () => void;
  revealedPokemonList: Pokemon[];
  revealCount: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export const Hero: React.FC<HeroProps> = ({
  onNavigateToLogin,
  onBallClick,
  revealedPokemonList,
  revealCount,
}) => {
  const lenis = useLenis();
  const [isPeeking, setIsPeeking] = useState(false);
  const [isBallHovered, setIsBallHovered] = useState(false);

  // Preload peeking squad sprites in memory
  useEffect(() => {
    const urls = [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    ];
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);


  // Keyboard shortcut listener: Space to summon trio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        onBallClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBallClick]);

  const handleScrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (lenis) {
      lenis.scrollTo('#about', {
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      });
    } else {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-28 px-6 bg-gradient-to-b from-transparent via-white/20 dark:via-white/5 to-transparent">
      {/* Ambient subtle light glow backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-red-100/15 dark:bg-red-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-14">
        {/* Main Grid: Left Value Proposition & Right 3D Pokéball */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Core Value Proposition */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Live System Status Pill */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs select-none"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-slate-900 dark:text-white">1,025 Species Roster</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Gen 1–9 Ready</span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-display leading-[1.12]"
            >
              Build your Pokédex,{' '}
              <br />
              <motion.span
                className="relative inline-block cursor-pointer select-none group/phrase"
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="relative z-10 inline-block bg-[linear-gradient(115deg,#dc2626_0%,#dc2626_35%,#ffffff_50%,#dc2626_65%,#dc2626_100%)] bg-[length:250%_100%] bg-[position:100%_0] group-hover/phrase:bg-[position:0%_0] bg-clip-text text-transparent transition-[background-position] duration-700 ease-out">
                  one name at a time
                </span>
                {/* Sleek animated underline with subtle glow */}
                <span className="absolute left-0 right-0 -bottom-0.5 h-[2.5px] bg-red-200 dark:bg-red-900/60 group-hover/phrase:bg-red-500 group-hover/phrase:shadow-[0_1px_8px_rgba(239,68,68,0.4)] rounded-full transition-all duration-300" />
              </motion.span>
              .
            </motion.h1>

            {/* Value Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Unlike traditional quizzes where your scores disappear when you reload,{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">Pokellects gives your Pokémon knowledge permanence</strong>. Test your memory,
              uncover species, and complete a personal Pokédex ledger that stays with you.
            </motion.p>

            {/* CTAs with specular sheen sweeps and solid high-contrast buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <motion.button
                type="button"
                onClick={onNavigateToLogin}
                onMouseEnter={() => setIsPeeking(true)}
                onMouseLeave={() => setIsPeeking(false)}
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.975 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="group relative overflow-hidden w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-xs hover:shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {/* Specular Sheen Sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <span className="relative z-10">Launch Your Pokédex</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
              <motion.a
                href="#about"
                onClick={handleScrollToAbout}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="group relative overflow-hidden w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-base border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs transition-colors text-center flex items-center justify-center"
              >
                {/* Specular Sheen Sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-slate-200/40 dark:via-white/10 to-transparent pointer-events-none" />
                <span className="relative z-10">How It Works</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Column: Clean Floating 3D Pokéball with Holographic Emergence */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-md flex items-center justify-center relative translate-y-3 sm:translate-y-4 lg:translate-y-5">
              <ThreeHeroCanvas
                onBallClick={onBallClick}
                onBallHoverChange={setIsBallHovered}
              />
              <PokeBallBurst
                revealedPokemonList={revealedPokemonList}
                revealCount={revealCount}
              />
              <PokeBallHoverDialog isVisible={isBallHovered} />
            </div>
          </div>
        </div>

        {/* 3 Refined Interactive Glass Metric Tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-slate-200/80 dark:border-slate-800"
        >
          {/* Metric 1: Species Archive */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-500/30 shadow-2xs hover:shadow-lg hover:shadow-red-500/5 dark:hover:shadow-red-500/10 transition-all duration-300 cursor-default"
          >
            {/* Top accent hairline */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Specular sheen sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-600 dark:group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105">
                <Flame className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50/80 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                National Dex
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-baseline gap-1.5">
                1,025
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider">Entries</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Documented Species</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Full National catalog with authentic stats, cries, and forms.
              </p>
            </div>
          </motion.div>

          {/* Metric 2: Generations */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/30 shadow-2xs hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300 cursor-default"
          >
            {/* Top accent hairline */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Specular sheen sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105">
                <Compass className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                Kanto → Paldea
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-baseline gap-1.5">
                9
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider">Regions</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Generations Covered</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Spans all 9 generations with regional variations and evolutions.
              </p>
            </div>
          </motion.div>

          {/* Metric 3: Type Matrix */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-500/30 shadow-2xs hover:shadow-lg hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 transition-all duration-300 cursor-default"
          >
            {/* Top accent hairline */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Specular sheen sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600 dark:group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105">
                <Shield className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60">
                Battle Matrix
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-baseline gap-1.5">
                18
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-sans uppercase tracking-wider">Types</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Elemental Types</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Full damage effectiveness charts, dual affinities, and battle matchups.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Minimalist Lenis Scroll Indicator */}
        <div className="flex justify-center pt-2">
          <motion.a
            href="#about"
            onClick={handleScrollToAbout}
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none cursor-pointer"
          >
            <span>Explore the features</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>

      {/* Playful Edge Peeking Pokémon Squad Animation */}
      <PeekingSquad isActive={isPeeking} />
    </section>
  );
};

export default Hero;
