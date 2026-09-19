import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame, BookOpenCheck, ChartNoAxesCombined, Gamepad2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthActions } from '@convex-dev/auth/react';
import { useHotkeys } from '../../hooks/useHotkeys';
import LoginForm from './components/LoginForm';
import { PokellectsLogo } from '../../components/common/PokellectsLogo';

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
  const { currentUser } = useAuth();
  const { signIn } = useAuthActions();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() && mode === 'signIn') {
      setErrorMessage('Please enter your username.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set('username', mode === 'signUp' ? username : identifier);
      formData.set('password', password);
      formData.set('flow', mode);
      if (mode === 'signUp') {
        formData.set('firstName', firstName);
      }
      await signIn('password', formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrorMessage(message.includes('InvalidAccountId') || message.includes('InvalidSecret') || message.includes('Invalid credentials')
        ? 'Incorrect username or password.'
        : 'We could not sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => { if (currentUser) onLoginSuccess(); }, [currentUser, onLoginSuccess]);

  const currentSilhouette = MYSTERY_POKEMON[silhouetteIndex];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Lighting Orbs matching Landing Page */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-100/25 dark:bg-red-950/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-amber-100/20 dark:bg-amber-950/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-gradient-to-b from-rose-200/30 via-pink-100/15 to-transparent dark:from-rose-950/20 dark:via-pink-950/10 dark:to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <PokellectsLogo size={32} className="shadow-xs shadow-red-200 dark:shadow-red-950" />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
              Pokellects
            </span>
          </div>
        </div>
      </header>

      {/* Main Dual-Panel Content with Equal Height */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex-1 flex items-center justify-center my-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">
          {/* Left Panel: Clean Silhouette Showcase (No top accent bar so Right Panel is highlighted) */}
          <div className="hidden md:col-span-6 md:flex flex-col justify-between text-center p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 relative overflow-hidden h-full">
            {/* Top Badge: "Gotta Name em All" */}
            <div className="relative z-10 flex items-center justify-center pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/60 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
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
              <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-rose-50/70 via-slate-50/50 to-white/90 dark:from-slate-800/60 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200/80 dark:border-slate-700/60 shadow-inner dark:shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] pointer-events-none" />

              {/* Glowing inner accent ring */}
              <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-rose-200/40 dark:border-rose-500/20 pointer-events-none" />

              {/* The Silhouette Image: Sleek slate silhouette */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 z-10 flex items-center justify-center">
                <AnimatePresence>
                  <motion.img
                    key={currentSilhouette.id}
                    src={currentSilhouette.spriteUrl}
                    alt="Mystery Pokémon"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none filter brightness-0 invert-[0.2] opacity-85 dark:brightness-0 dark:invert-[0.32] dark:opacity-95 drop-shadow-[0_12px_24px_rgba(225,29,72,0.18)] dark:drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Headline & Progress Dots */}
            <div className="relative z-10 space-y-1.5 pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                Collect every{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
                  Pokémon
                </span>
                .
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
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
                      className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 relative overflow-hidden cursor-pointer shadow-2xs"
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
          <div className="md:col-span-6 flex flex-col gap-8 md:gap-0 md:h-[560px] md:justify-between p-5 sm:p-8 sm:pb-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 relative overflow-hidden">
            {/* Top Accent Gradient Line highlighting the Right Panel */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-400" />

            <div className="space-y-1 relative z-10 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                {mode === 'signUp' ? 'Start your Pokédex' : 'Welcome back'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signUp' ? 'Create your trainer account and begin collecting.' : 'Sign in to continue to your Pokédex.'}
              </p>
            </div>

            <div className="relative z-10 py-4 sm:py-5">
              <LoginForm
                mode={mode}
                identifier={identifier}
                setIdentifier={setIdentifier}
                password={password}
                setPassword={setPassword}
                firstName={firstName}
                setFirstName={setFirstName}
                username={username}
                setUsername={setUsername}
                errorMessage={errorMessage}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            <div className="relative z-10 space-y-5">
              {mode === 'signIn' && <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 px-4 py-3.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Your trainer journey</p>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1"><BookOpenCheck className="mx-auto h-4 w-4 text-rose-500" /><span className="block text-[10px] leading-tight text-slate-500 dark:text-slate-400">Personal Pokédex</span></div>
                    <div className="space-y-1"><ChartNoAxesCombined className="mx-auto h-4 w-4 text-violet-500" /><span className="block text-[10px] leading-tight text-slate-500 dark:text-slate-400">Track progress</span></div>
                    <div className="space-y-1"><Gamepad2 className="mx-auto h-4 w-4 text-amber-500" /><span className="block text-[10px] leading-tight text-slate-500 dark:text-slate-400">Learn by playing</span></div>
                  </div>
              </div>}
              <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signUp' ? 'Already have an account?' : 'New to Pokellects?'}{' '}
                <button type="button" onClick={() => { setMode(mode === 'signUp' ? 'signIn' : 'signUp'); setErrorMessage(null); }} className="font-bold text-rose-600 hover:text-rose-500 cursor-pointer">
                  {mode === 'signUp' ? 'Sign in' : 'Create an account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default LoginPage;
