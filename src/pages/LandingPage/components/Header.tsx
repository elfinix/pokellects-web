import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useLenis } from 'lenis/react';
import { Sun, Moon } from 'lucide-react';
import { PokellectsLogo } from '../../../components/common/PokellectsLogo';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

interface HeaderProps {
  onNavigateToLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const { currentUser, isAuthenticated } = useAuth();
  const { publicTheme, togglePublicTheme, isDark } = useTheme();
  const hasActiveSession = isAuthenticated || Boolean(currentUser);
  const pageIsDark = hasActiveSession ? isDark : publicTheme === 'dark';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  const handleNavClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (lenis) {
      if (id === '#hero' || id === '#top') {
        lenis.scrollTo(0, {
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        });
      } else {
        lenis.scrollTo(id, {
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        });
      }
    } else {
      if (id === '#hero' || id === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.querySelector(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 px-6 py-3.5 transition-colors duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border-b border-slate-200/50 dark:border-slate-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo - Clickable to redirect to Hero / top */}
        <a
          href="#hero"
          onClick={handleNavClick('#hero')}
          className="flex items-center gap-2.5 select-none cursor-pointer group"
        >
          <PokellectsLogo size={32} className="shadow-xs transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-display group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            Pokellects
          </span>
        </a>

        {/* Middle Navigation with Lenis smooth anchor offset */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a
            href="#about"
            onClick={handleNavClick('#about')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            About
          </a>
          <a
            href="#games"
            onClick={handleNavClick('#games')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Minigames
          </a>
          <a
            href="#developer"
            onClick={handleNavClick('#developer')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Developer
          </a>
        </nav>

        {/* Right Actions: Theme Toggle & Get Started CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePublicTheme}
            aria-label={pageIsDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 shrink-0 rounded-xl inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/80 dark:border-slate-700 shadow-2xs cursor-pointer"
          >
            {pageIsDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <motion.button
            type="button"
            onClick={onNavigateToLogin}
            whileHover={{ scale: 1.025, y: -0.5 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="group relative h-9 px-4 shrink-0 rounded-xl border border-slate-300/90 dark:border-slate-700 bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs"
          >
            <span className="relative z-10 leading-none">{hasActiveSession ? 'Continue' : 'Get Started'}</span>
            {/* Animated Pokéball that spins and scales on hover */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 relative z-10 transition-transform duration-500 ease-out group-hover:rotate-[360deg] group-hover:scale-110 drop-shadow-xs shrink-0"
              aria-hidden="true"
            >
              {/* Top half (red) */}
              <path
                d="M 2 12 A 10 10 0 0 1 22 12 H 14.5 A 2.5 2.5 0 0 0 9.5 12 Z"
                fill="#ef4444"
              />
              {/* Bottom half (white) */}
              <path
                d="M 22 12 A 10 10 0 0 1 2 12 H 9.5 A 2.5 2.5 0 0 0 14.5 12 Z"
                fill="#ffffff"
              />
              {/* Outer boundary circle */}
              <circle cx="12" cy="12" r="10" stroke="#0f172a" strokeWidth="1.5" />
              {/* Center dividing lines */}
              <line x1="2" y1="12" x2="9.5" y2="12" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="14.5" y1="12" x2="22" y2="12" stroke="#0f172a" strokeWidth="1.5" />
              {/* Center outer button */}
              <circle cx="12" cy="12" r="3" fill="#0f172a" />
              {/* Center inner button */}
              <circle
                cx="12"
                cy="12"
                r="1.4"
                fill="#ffffff"
                className="group-hover:fill-rose-200 transition-colors"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
