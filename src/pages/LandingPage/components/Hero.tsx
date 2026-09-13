import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Pokemon } from '../../../types/pokemon';
import ThreeHeroCanvas from './ThreeHeroCanvas';
import PokeBallBurst from './PokeBallBurst';

interface HeroProps {
  onNavigateToLogin: () => void;
  onBallClick: () => void;
  revealedPokemonList: Pokemon[];
  revealCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigateToLogin,
  onBallClick,
  revealedPokemonList,
  revealCount,
}) => {
  return (
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
            <ThreeHeroCanvas onBallClick={onBallClick} />
            <PokeBallBurst
              revealedPokemonList={revealedPokemonList}
              revealCount={revealCount}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
