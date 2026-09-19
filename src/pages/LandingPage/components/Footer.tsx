import React from 'react';
import { PokellectsLogo } from '../../../components/common/PokellectsLogo';

interface FooterProps {
  onNavigateToLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToLogin }) => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-8 sm:py-10 px-4 sm:px-6 border-t border-slate-800 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-slate-800 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <PokellectsLogo size={26} className="shadow-xs" />
            <span className="font-extrabold text-base text-white font-display tracking-tight">
              Pokellects
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-400">
            <a href="#about" className="hover:text-white transition-colors py-1">
              About
            </a>
            <a href="#games" className="hover:text-white transition-colors py-1">
              Minigames
            </a>
            <a href="#developer" className="hover:text-white transition-colors py-1">
              Developer
            </a>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-red-400 hover:text-red-300 font-semibold py-1 cursor-pointer transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left leading-relaxed">
          <p>
            Pokellects © 2026 · A personal Pokémon collection and knowledge game.
          </p>
          <p className="text-center sm:text-right max-w-md">
            Pokémon and character names are trademarks of Nintendo, Creatures Inc., and Game Freak.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
