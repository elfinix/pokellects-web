import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useLenis } from 'lenis/react';

interface HeaderProps {
  onNavigateToLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();

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
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs'
          : 'bg-white/80 backdrop-blur-xs border-b border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo - Clickable to redirect to Hero / top */}
        <a
          href="#hero"
          onClick={handleNavClick('#hero')}
          className="flex items-center gap-2.5 select-none cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center font-black text-base shadow-xs transition-colors">
            P
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display group-hover:text-slate-700 transition-colors">
            Pokellects
          </span>
        </a>

        {/* Middle Navigation with Lenis smooth anchor offset */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a
            href="#about"
            onClick={handleNavClick('#about')}
            className="hover:text-slate-900 transition-colors"
          >
            About
          </a>
          <a
            href="#arena"
            onClick={handleNavClick('#arena')}
            className="hover:text-slate-900 transition-colors"
          >
            Minigames
          </a>
          <a
            href="#developer"
            onClick={handleNavClick('#developer')}
            className="hover:text-slate-900 transition-colors"
          >
            Developer
          </a>
        </nav>

        {/* Sleek Refined CTA with tactile spring & specular sheen sweep */}
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={onNavigateToLogin}
            whileHover={{ scale: 1.025, y: -0.5 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="group relative overflow-hidden px-4.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            {/* Specular Sheen Sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200 relative z-10" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
