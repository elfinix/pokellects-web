import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeaderProps {
  onNavigateToLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToLogin }) => {
  return (
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
  );
};

export default Header;
