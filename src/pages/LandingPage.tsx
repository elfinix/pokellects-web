import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Gamepad2,
  Trophy,
  Zap,
  Search,
} from 'lucide-react';
import ThreeHeroCanvas from '../components/landing/ThreeHeroCanvas';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-200">
              P
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                Pokellects
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                Personal Pokédex
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-rose-600 transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-rose-600 transition-colors">
              Features
            </a>
            <a href="#arena" className="hover:text-rose-600 transition-colors">
              Arena Games
            </a>
            <a href="#developer" className="hover:text-rose-600 transition-colors">
              Meet the Developer
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm cursor-pointer shadow-md shadow-slate-200 transition-all flex items-center gap-2 hover:gap-2.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with ThreeJS 3D Canvas */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-rose-100/50 via-sky-100/40 to-amber-100/30 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>A Permanent Pokémon Knowledge Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display leading-[1.12]">
              Build your personal Pokédex, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">discovery by discovery</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Unlike traditional quizzes where answers vanish when the tab closes,
              <strong> Pokellects preserves your progress</strong>. Every Pokémon you identify,
              remember, and unlock becomes a permanent piece of your personal collection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-base shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Launch Your Pokédex</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#about"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-200 shadow-2xs transition-all text-center"
              >
                Learn How It Works
              </a>
            </div>

            {/* Quick Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-display">1,025</div>
                <div className="text-xs text-slate-500">National Pokédex</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-rose-600 font-display">Persistent</div>
                <div className="text-xs text-slate-500">SQLite Synced</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-display">Gen 1–9</div>
                <div className="text-xs text-slate-500">Full Universe</div>
              </div>
            </div>
          </div>

          {/* Right Column: ThreeJS 3D Pokéball */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-slate-200/80 shadow-xl relative group">
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-md">
                <Zap className="w-3 h-3 text-amber-400" />
                Three.js 3D WebGL
              </div>
              <ThreeHeroCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* 3. About the System */}
      <section id="about" className="py-20 bg-white border-y border-slate-200/80 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              The Pokellects Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Why settle for temporary trivia scores when you can fill a Pokédex?
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Standard trivia games reset every session. Pokellects turns your Pokémon acumen into a
              tangible, growing encyclopedia. Every quiz completed and every silhouette guessed adds
              a permanent badge to your trainer ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-rose-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personal Pokédex Vault</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track completion metrics across all nine generations. See your captured species in full
                color while mystery silhouettes fuel your desire to discover what’s missing.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-rose-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Keyboard-First Continuous Play</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Designed for high flow. Type a name in the floating bar → reveal detailed stats and
                cries in a glassmorphic dialog → press <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">Esc</kbd> to refocus and keep registering.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-rose-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Arena-Driven Discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stuck on what to register next? The Arena exclusively presents Pokémon you haven’t
                unlocked yet, rewarding your game victories with direct Pokédex entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Arena Minigames Showcase */}
      <section id="arena" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                Play to Unlock
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                The Battle Arena Minigames
              </h2>
              <p className="text-slate-600 text-sm max-w-xl">
                Every victory unlocks a new Pokémon you didn’t have in your collection before.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Play in Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                  Easy • Visual
                </span>
                <h3 className="text-lg font-bold text-slate-900">Who's That Pokémon?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The iconic TV silhouette challenge. Identify species before the countdown expires to
                  claim the entry.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Timer: 15s</span>
                <span className="text-emerald-600 font-semibold">Available Now</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                  Medium • Word Puzzle
                </span>
                <h3 className="text-lg font-bold text-slate-900">Hangmon</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Classic hangman mechanics tailored for Pokémon names. Deduce the letters before
                  strikes run out.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Strikes: 6</span>
                <span className="text-emerald-600 font-semibold">Available Now</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                  Hard • Audio
                </span>
                <h3 className="text-lg font-bold text-slate-900">Identicry</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Train your acoustic instincts. Listen to the authentic sound cry and match it to the
                  correct species.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Replays: 3</span>
                <span className="text-emerald-600 font-semibold">Available Now</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/80 border border-dashed border-slate-300 space-y-4 flex flex-col justify-between opacity-85">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                  Coming Soon
                </span>
                <h3 className="text-lg font-bold text-slate-800">Pokédle</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Multi-criteria deduction puzzle testing generation, dual typing, height, weight, and
                  evolution lines.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                <span>In Development</span>
                <span>Next Release</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Meet the Developer (Single Developer as explicitly requested) */}
      <section id="developer" className="py-20 bg-white border-t border-slate-200/80 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              Creator & Architect
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              Meet the Developer
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Crafted with attention to performance, modern React patterns, and passion for Pokémon lore.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Profile */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-300 p-1 shadow-lg shadow-rose-200">
                <div className="w-full h-full rounded-[22px] bg-slate-900 text-white flex flex-col items-center justify-center font-display font-black text-3xl">
                  <span>DEV</span>
                  <span className="text-[11px] tracking-widest text-rose-400 font-mono">POKÉ</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold border-2 border-white shadow-xs">
                Creator
              </div>
            </div>

            {/* Bio & Details */}
            <div className="space-y-4 text-center md:text-left flex-1">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  Lead Software Engineer
                </h3>
                <p className="text-xs font-semibold text-rose-600 mt-0.5">
                  Full-Stack Web Architect & Pokémon Trainer
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                "Pokellects was born out of a desire to give Pokémon quizzes the permanence they
                deserve. By blending modern web standards with Three.js rendering, reactive state, and
                keyboard-first ergonomics, our goal is to build the ultimate web Pokédex experience."
              </p>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {[
                  'React 19',
                  'Vite 8',
                  'TypeScript',
                  'Tailwind CSS v4',
                  'Three.js',
                  'SQLite Ready',
                  'Recharts',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                P
              </div>
              <span className="font-extrabold text-lg text-white font-display">
                Pokellects
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">
                About System
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Architecture
              </a>
              <a href="#arena" className="hover:text-white transition-colors">
                Minigames
              </a>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              Pokellects © 2026. Built with React 19, Tailwind CSS v4 & Three.js.
            </p>
            <p className="text-center sm:text-right">
              Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and Game Freak.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
