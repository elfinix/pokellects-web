import React, { useState, useEffect, useRef } from 'react';
import { Pokemon } from '../../types/pokemon';
import { createPokemonStub, fetchPokemon } from '../../services/pokeapi';
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

// Popular starter IDs across generations for prominent showcase
const STARTER_SHOWCASE_IDS = [1, 4, 7, 25, 133, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912];

function pickRandomTrio(): Pokemon[] {
  const shuffled = [...STARTER_SHOWCASE_IDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((id) => createPokemonStub(id));
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
  const [revealedPokemonList, setRevealedPokemonList] = useState<Pokemon[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const nextTrioRef = useRef<Pokemon[]>([]);

  // Pre-generate and preload the next trio of Pokémon sprites from PokeAPI
  const prepareNextTrio = () => {
    const nextThree = pickRandomTrio();
    nextThree.forEach((poke) => {
      const img = new Image();
      img.src = poke.spriteUrl;
      // Fetch rich details in background
      fetchPokemon(poke.id).then((full) => {
        if (full) {
          Object.assign(poke, full);
        }
      });
    });
    nextTrioRef.current = nextThree;
  };

  // On initial mount, preload showcase sprites
  useEffect(() => {
    STARTER_SHOWCASE_IDS.forEach((id) => {
      const img = new Image();
      img.src = createPokemonStub(id).spriteUrl;
    });
    prepareNextTrio();
  }, []);

  const handleBallClick = () => {
    // Instantly use the preloaded trio for zero-latency appearance
    if (nextTrioRef.current.length === 3) {
      setRevealedPokemonList(nextTrioRef.current);
    } else {
      setRevealedPokemonList(pickRandomTrio());
    }
    setRevealCount((c) => c + 1);
    // Immediately queue the subsequent trio in advance
    prepareNextTrio();
  };

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950 relative text-slate-900 dark:text-white flex flex-col selection:bg-red-600 selection:text-white">
        {/* Dynamic Interactive Background System */}
        <BackgroundSystem />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header onNavigateToLogin={onNavigateToLogin} />
          <main className="flex-1">
            <Hero
              onNavigateToLogin={onNavigateToLogin}
              revealedPokemonList={revealedPokemonList}
              revealCount={revealCount}
              onBallClick={handleBallClick}
            />
            <AboutSection />
            <ArenaSection />
            <DeveloperSection />
          </main>
          <Footer onNavigateToLogin={onNavigateToLogin} />
        </div>
      </div>
    </SmoothScrollProvider>
  );
};

export default LandingPage;
