import React from 'react';
import { PokellectsLogo } from '../../../components/common/PokellectsLogo';

interface FooterProps {
  onNavigateToLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToLogin }) => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 dark:text-slate-400 py-10 px-6 border-t border-slate-800 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <PokellectsLogo size={28} className="shadow-xs" />
            <span className="font-extrabold text-base text-white font-display">
              Pokellects
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#games" className="hover:text-white transition-colors">
              Minigames
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500">
          <p>
            Pokellects © 2026. A personal Pokémon collection and knowledge game.
          </p>
          <p className="text-center sm:text-right">
            Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and Game Freak.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
