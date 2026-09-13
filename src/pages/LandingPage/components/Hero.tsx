import React, { useEffect } from 'react';
import { ArrowRight, ChevronDown, Flame, Compass, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { Pokemon } from '../../../types/pokemon';
import ThreeHeroCanvas from './ThreeHeroCanvas';
import PokeBallBurst from './PokeBallBurst';

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
    <section id="hero" className="relative overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-28 px-6 bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Ambient subtle light glow backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

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
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs select-none"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-slate-900">1,025 Species Roster</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">Gen 1–9 Ready</span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-display leading-[1.12]"
            >
              Build your Pokédex,{' '}
              <br />
              <span className="text-red-600 underline decoration-red-200 underline-offset-4">
                one name at a time
              </span>
              .
            </motion.h1>

            {/* Value Description */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Unlike traditional quizzes where your scores disappear when you reload,{' '}
              <strong>Pokellects gives your Pokémon knowledge permanence</strong>. Test your memory,
              uncover species, and complete a personal Pokédex ledger that stays with you.
            </motion.p>

            {/* CTAs with solid high-contrast buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <motion.button
                type="button"
                onClick={onNavigateToLogin}
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.975 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-xs hover:shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Your Pokédex</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.a
                href="#about"
                onClick={handleScrollToAbout}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300 shadow-2xs transition-colors text-center"
              >
                How It Works
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Column: Clean Floating 3D Pokéball with Holographic Emergence */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-md flex items-center justify-center relative">
              <ThreeHeroCanvas onBallClick={onBallClick} />
              <PokeBallBurst
                revealedPokemonList={revealedPokemonList}
                revealCount={revealCount}
              />
            </div>
          </div>
        </div>

        {/* 3 Refined Glass Metric Tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-slate-200/80"
        >
          {/* Metric 1 */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">1,025</div>
              <div className="text-xs text-slate-500 font-medium">Species to Discover</div>
            </div>
          </motion.div>

          {/* Metric 2 */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">9</div>
              <div className="text-xs text-slate-500 font-medium">Generations Covered</div>
            </div>
          </motion.div>

          {/* Metric 3 */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">18</div>
              <div className="text-xs text-slate-500 font-medium">Elemental Types</div>
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors select-none cursor-pointer"
          >
            <span>Explore the Ledger</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
