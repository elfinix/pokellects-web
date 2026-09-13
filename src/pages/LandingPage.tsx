import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Gamepad2,
  Trophy,
  Search,
  Eye,
  Type,
  Volume2,
  HelpCircle,
  Check,
} from 'lucide-react';
import ThreeHeroCanvas from '../components/landing/ThreeHeroCanvas';
import { POKEMON_DATABASE } from '../services/pokemonIndex';
import { POKEMON_TYPE_THEMES } from '../styles/theme';
import { Pokemon } from '../types/pokemon';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
  const [revealedPokemonList, setRevealedPokemonList] = useState<Pokemon[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const nextTrioRef = useRef<Pokemon[]>([]);

  // Pre-generate and preload the next trio of Pokémon sprites in memory
  const prepareNextTrio = () => {
    const shuffled = [...POKEMON_DATABASE].sort(() => 0.5 - Math.random());
    const nextThree = shuffled.slice(0, 3);
    nextThree.forEach((poke) => {
      const img = new Image();
      img.src = poke.spriteUrl;
    });
    nextTrioRef.current = nextThree;
  };

  // On initial mount, preload all database images into the browser cache
  useEffect(() => {
    POKEMON_DATABASE.forEach((poke) => {
      const img = new Image();
      img.src = poke.spriteUrl;
    });
    prepareNextTrio();
  }, []);

  const handleBallClick = () => {
    // Instantly use the preloaded trio for zero-latency appearance
    if (nextTrioRef.current.length === 3) {
      setRevealedPokemonList(nextTrioRef.current);
    } else {
      const shuffled = [...POKEMON_DATABASE].sort(() => 0.5 - Math.random());
      setRevealedPokemonList(shuffled.slice(0, 3));
    }
    setRevealCount((c) => c + 1);
    // Immediately queue the subsequent trio in advance
    prepareNextTrio();
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-600 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              P
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
              Pokellects
            </span>
          </div>

          {/* Middle Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#about" className="hover:text-slate-900 transition-colors">
              About
            </a>
            <a href="#arena" className="hover:text-slate-900 transition-colors">
              Arena Games
            </a>
            <a href="#developer" className="hover:text-slate-900 transition-colors">
              Meet the Developer
            </a>
          </nav>

          {/* Sleek Refined CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-4.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>A Permanent Pokémon Knowledge Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-display leading-[1.12]">
              Build your personal Pokédex, <span className="text-red-600">one discovery at a time</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Unlike traditional quizzes where your answers vanish once the tab closes,
              <strong> Pokellects saves every entry you uncover</strong>. Identify species, test
              your memory, and unlock Pokémon into a lasting personal collection.
            </p>

            {/* CTAs with solid high-contrast buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Your Pokédex</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#about"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300 shadow-2xs transition-colors text-center"
              >
                How It Works
              </a>
            </div>

            {/* Numerical Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">1,025</div>
                <div className="text-xs text-slate-500 mt-0.5">Species to Discover</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">9</div>
                <div className="text-xs text-slate-500 mt-0.5">Generations Covered</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">18</div>
                <div className="text-xs text-slate-500 mt-0.5">Elemental Types</div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Floating 3D Pokéball with Random Pokémon Emergence */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-md flex items-center justify-center relative">
              <ThreeHeroCanvas onBallClick={handleBallClick} />

              {/* Revealed 3 Random Pokémon Emergence (Overlapping in Front of Upper Pokéball) */}
              {revealedPokemonList.length > 0 && (
                <div
                  key={revealCount}
                  className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center -space-x-2 sm:space-x-1 w-full max-w-[440px] pointer-events-none px-2"
                >
                  {revealedPokemonList.map((poke, index) => {
                    const theme = POKEMON_TYPE_THEMES[poke.types[0]];
                    const animClass =
                      index === 0
                        ? 'animate-burst-left z-10 hover:z-30 hover:rotate-0'
                        : index === 1
                        ? 'animate-burst-center z-20 hover:z-30'
                        : 'animate-burst-right z-10 hover:z-30 hover:rotate-0';

                    const delays = ['0ms', '80ms', '160ms'];

                    return (
                      <div
                        key={`${poke.id}-${revealCount}-${index}`}
                        className={`${animClass} bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center text-center flex-1 max-w-[125px] sm:max-w-[132px] transition-all pointer-events-auto hover:scale-110 cursor-pointer`}
                        style={{ animationDelay: delays[index] }}
                        title={`${poke.displayName} (#${poke.id})`}
                      >
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          #{String(poke.id).padStart(4, '0')}
                        </span>
                        <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center my-0.5">
                          <img
                            src={poke.spriteUrl}
                            alt={poke.displayName}
                            loading="eager"
                            decoding="sync"
                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-xs"
                          />
                        </div>
                        <div className="w-full">
                          <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                            {poke.displayName}
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            <span
                              className="px-1.5 py-0.2 rounded text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-white"
                              style={{ backgroundColor: theme.accentHex }}
                            >
                              {poke.types[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. About the System */}
      <section id="about" className="py-20 bg-white border-y border-slate-200 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              The Pokellects Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              A Pokédex That Never Resets
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Standard trivia games reset with every reload. Pokellects gives your knowledge permanence,
              turning identification and memory into a persistent, rewarding archive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Personal Collection Ledger</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track completion progress across the National Pokédex. Unlocked Pokémon appear in full
                vibrant detail, while undiscovered entries challenge you to complete the roster.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Continuous Fast Input</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Streamlined for speed. Type a Pokémon’s name in the floating bar, inspect its entry,
                then hit <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-xs">Esc</kbd> to return immediately to the input bar.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Arena-Driven Discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every victory in the Arena registers a brand new Pokémon directly into your ledger.
                The game specifically selects species you haven’t discovered yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Battle Arena Minigames (Centered header & clean cards) */}
      <section id="arena" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Centered Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Minigame Arena
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Battle Arena Challenges
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every game round is drawn exclusively from Pokémon you have not yet unlocked.
              Win the challenge to register that species directly into your Pokédex.
            </p>
          </div>

          {/* Clean, Polished Minigame Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Who's That Pokémon */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Silhouette
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Who's That Pokémon?</h3>
                  <p className="text-xs text-slate-500 mt-1">Visual Recognition</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Identify the shadowy silhouette against a 15-second timer. Use optional generation
                  and type hints to secure the unlock before time runs out.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Timer: 15s</span>
                <span className="font-medium text-slate-700">3 Attempts</span>
              </div>
            </div>

            {/* 2. Hangmon */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Type className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Word Puzzle
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hangmon</h3>
                  <p className="text-xs text-slate-500 mt-1">Letter Deduction</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Solve the concealed Pokémon name letter-by-letter. Rely on category cues and word
                  length before reaching maximum strikes.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Strikes: 6</span>
                <span className="font-medium text-slate-700">Category Hint</span>
              </div>
            </div>

            {/* 3. Identicry */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Audio Cry
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Identicry</h3>
                  <p className="text-xs text-slate-500 mt-1">Acoustic Training</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Listen to the authentic Pokémon sound cry and select the matching species from four
                  choices. Replays are limited to test auditory memory.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>3 Audio Replays</span>
                <span className="font-medium text-slate-700">4 Choices</span>
              </div>
            </div>

            {/* 4. Pokédle (Coming Soon) */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Coming Soon
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Pokédle</h3>
                  <p className="text-xs text-slate-400 mt-1">Multi-Criteria Deduction</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Deduce the secret Pokémon using feedback on primary/secondary types, height, weight,
                  generation, and evolution stage.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                <span>In Development</span>
                <span className="font-medium">Future Update</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Meet the Developer (Single Developer, no tech stack listing) */}
      <section id="developer" className="py-20 bg-white border-t border-slate-200 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Behind the Project
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              Meet the Developer
            </h2>
            <p className="text-slate-500 text-sm">
              Built out of passion for Pokémon knowledge and thoughtful web design.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-2xl shrink-0 shadow-sm">
              DEV
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Pokellects Creator
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Lifelong Pokémon Fan & Software Developer
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                "I wanted to create a platform where testing your Pokémon memory feels genuinely
                rewarding. Instead of a temporary quiz score that disappears when you leave the page,
                Pokellects is designed as a persistent, keyboard-first Pokédex companion that grows with
                you."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer (No tech stack mentions) */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">
                P
              </div>
              <span className="font-extrabold text-base text-white font-display">
                Pokellects
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#arena" className="hover:text-white transition-colors">
                Arena Games
              </a>
              <a href="#developer" className="hover:text-white transition-colors">
                Developer
              </a>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Pokellects © 2026. A personal Pokémon collection and knowledge game.
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
