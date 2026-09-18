import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/mockdata';
import { useHotkeys } from '../../hooks/useHotkeys';
import LoginForm from './components/LoginForm';
import DemoAccounts from './components/DemoAccounts';

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

// Curated iconic silhouettes with type-specific color lighting
const MYSTERY_POKEMON = [
  {
    id: 6,
    name: 'Charizard',
    speciesLabel: '#0006 • Fire / Flying',
    bgGlow: 'from-orange-500/25 via-red-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
  },
  {
    id: 25,
    name: 'Pikachu',
    speciesLabel: '#0025 • Electric',
    bgGlow: 'from-amber-400/25 via-yellow-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  {
    id: 143,
    name: 'Snorlax',
    speciesLabel: '#0143 • Normal',
    bgGlow: 'from-sky-400/25 via-teal-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
  },
  {
    id: 150,
    name: 'Mewtwo',
    speciesLabel: '#0150 • Psychic',
    bgGlow: 'from-purple-500/25 via-pink-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
  },
  {
    id: 249,
    name: 'Lugia',
    speciesLabel: '#0249 • Psychic / Flying',
    bgGlow: 'from-blue-500/25 via-indigo-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png',
  },
  {
    id: 384,
    name: 'Rayquaza',
    speciesLabel: '#0384 • Dragon / Flying',
    bgGlow: 'from-emerald-500/25 via-teal-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
  },
  {
    id: 448,
    name: 'Lucario',
    speciesLabel: '#0448 • Fighting / Steel',
    bgGlow: 'from-cyan-500/25 via-blue-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
  },
  {
    id: 658,
    name: 'Greninja',
    speciesLabel: '#0658 • Water / Dark',
    bgGlow: 'from-indigo-500/25 via-violet-500/15 to-transparent',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding, onLoginSuccess }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState(DEMO_CREDENTIALS.player.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.player.password);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [silhouetteIndex, setSilhouetteIndex] = useState(0);

  // Allow pressing Escape to return to the landing page
  useHotkeys('Escape', () => {
    onBackToLanding();
  });

  // Preload and cache all silhouettes immediately in browser memory
  useEffect(() => {
    MYSTERY_POKEMON.forEach((item) => {
      const img = new Image();
      img.src = item.spriteUrl;
    });
  }, []);

  // Comfortable interval for smooth dissolve cycles
  useEffect(() => {
    const timer = setInterval(() => {
      setSilhouetteIndex((prev) => (prev + 1) % MYSTERY_POKEMON.length);
    }, 4800);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your username or email.');
      return;
    }

    setIsSubmitting(true);

    const success = login(identifier, password);
    setIsSubmitting(false);

    if (success) {
      onLoginSuccess();
    } else {
      setErrorMessage('Invalid credentials. You can select a demo account below.');
    }
  };

  const handleDemoSelect = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
  };

  const currentSilhouette = MYSTERY_POKEMON[silhouetteIndex];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col justify-between selection:bg-rose-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Lighting Orbs matching Landing Page */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-100/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-gradient-to-b from-rose-200/30 via-pink-100/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-white/80 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center font-black text-sm shadow-xs shadow-rose-200">
              P
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 font-display">
              Pokellects
            </span>
          </div>
        </div>
      </header>

      {/* Main Dual-Panel Content with Equal Height */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left Panel: Clean Silhouette Showcase (No top accent bar so Right Panel is highlighted) */}
          <div className="md:col-span-6 flex flex-col justify-between text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-900/[0.04] relative overflow-hidden h-full">
            {/* Top Badge: "Gotta Name em All" */}
            <div className="relative z-10 flex items-center justify-center pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Gotta Name 'em All</span>
              </div>
            </div>

            {/* Silhouette Display with Simultaneous Crossfade Dissolve (No Fade to White) */}
            <div className="relative w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center mx-auto my-6">
              {/* Dynamic Aura Glow crossfade */}
              <AnimatePresence>
                <motion.div
                  key={`glow-${currentSilhouette.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentSilhouette.bgGlow} blur-3xl pointer-events-none`}
                />
              </AnimatePresence>

              {/* Illuminated Circular Pedestal */}
              <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-rose-50/70 via-slate-50/50 to-white/90 border border-slate-200/80 shadow-inner pointer-events-none" />

              {/* The Silhouette Image: Simultaneous crossfade directly from silhouette to silhouette */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 z-10">
                <AnimatePresence>
                  <motion.img
                    key={currentSilhouette.id}
                    src={currentSilhouette.spriteUrl}
                    alt="Mystery Pokémon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none filter brightness-0 opacity-85 drop-shadow-[0_12px_24px_rgba(225,29,72,0.18)]"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Headline & Progress Dots */}
            <div className="relative z-10 space-y-1.5 pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                Collect every{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
                  Pokémon
                </span>
                .
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Discover and catalog over 1,000 species into your personal collection.
              </p>

              {/* Smooth rotation indicator dots with fluid motion spring transition */}
              <div className="flex items-center justify-center gap-1.5 pt-3">
                {MYSTERY_POKEMON.map((poke, idx) => {
                  const isActive = idx === silhouetteIndex;
                  return (
                    <motion.button
                      key={poke.id}
                      type="button"
                      onClick={() => setSilhouetteIndex(idx)}
                      aria-label={`Show silhouette ${idx + 1}`}
                      layout
                      initial={false}
                      animate={{
                        width: isActive ? 24 : 6,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 26,
                      }}
                      className="h-1.5 rounded-full bg-slate-200 hover:bg-slate-300 relative overflow-hidden cursor-pointer shadow-2xs"
                    >
                      <motion.div
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Clean Authentication Form (Highlighted with Top Accent Gradient Bar) */}
          <div className="md:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-900/[0.04] relative overflow-hidden h-full space-y-5">
            {/* Top Accent Gradient Line highlighting the Right Panel */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-400" />

            <div className="space-y-1 relative z-10 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to continue to your Pokédex.
              </p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <LoginForm
                identifier={identifier}
                setIdentifier={setIdentifier}
                password={password}
                setPassword={setPassword}
                errorMessage={errorMessage}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            <div className="relative z-10">
              <DemoAccounts
                activeUsername={identifier}
                onSelectAccount={handleDemoSelect}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400">
        Pokellects • Personal Pokédex
      </footer>
    </div>
  );
};

export default LoginPage;
