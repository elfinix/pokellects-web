import React, { useState, useEffect, useRef } from 'react';
import { POKEMON_DATABASE } from '../../services/pokemonIndex';
import { Pokemon } from '../../types/pokemon';
import SmoothScrollProvider from '../../components/common/SmoothScrollProvider';
import BackgroundSystem from './components/BackgroundSystem';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ArenaSection from './components/ArenaSection';
import DeveloperSection from './components/DeveloperSection';
import Footer from './components/Footer';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
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
    <SmoothScrollProvider>
      <div className="min-h-screen bg-slate-50/40 relative text-slate-900 flex flex-col selection:bg-red-600 selection:text-white">
        {/* Dynamic Interactive Background System */}
        <BackgroundSystem />

        {/* 1. Header / Navbar */}
        <Header onNavigateToLogin={onNavigateToLogin} />

        {/* 2. Hero Section with 3D Canvas & Burst Cards */}
        <Hero
          onNavigateToLogin={onNavigateToLogin}
          onBallClick={handleBallClick}
          revealedPokemonList={revealedPokemonList}
          revealCount={revealCount}
        />

        {/* 3. About the System */}
        <AboutSection />

        {/* 4. Battle Arena Minigames */}
        <ArenaSection onNavigateToLogin={onNavigateToLogin} />

        {/* 5. Meet the Developer */}
        <DeveloperSection />

        {/* 6. Footer */}
        <Footer onNavigateToLogin={onNavigateToLogin} />
      </div>
    </SmoothScrollProvider>
  );
};

export default LandingPage;
