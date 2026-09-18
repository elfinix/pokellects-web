import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Volume2,
  Crosshair,
  ArrowRight,
  SkipForward,
  XCircle,
  X,
  Loader2,
  BookOpen,
  Radio,
} from 'lucide-react';
import { Pokemon } from '../../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../../styles/theme';
import { useAuth } from '../../../context/AuthContext';
import { usePokedex } from '../../../context/PokedexContext';
import storageService from '../../../services/storageService';
import { createPokemonStub } from '../../../services/pokeapi';
import {
  getAllKnownPokemon,
  getPokemonById,
  getPokemonByIdAsync,
  getRandomUndiscoveredPokemon,
  normalizePokemonQuery,
} from '../../../services/pokemonIndex';
import ChalkRegisteredStamp from '../../../components/common/ChalkRegisteredStamp';
import PokeballChalkMark from '../../../components/common/PokeballChalkMark';
import PokemonDetailModal from '../../PokedexPage/components/PokemonDetailModal';

interface IdenticryProps {
  onBack: () => void;
}

// Visualizer waveform bar heights for audio animation
const EQUALIZER_BARS = [35, 60, 95, 50, 80, 100, 70, 90, 45, 85, 65, 40];

export const Identicry: React.FC<IdenticryProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const {
    isPokemonUnlocked,
    registerById,
    unlockedIds,
    openDetailModal,
    closeDetailModal,
    selectedPokemon,
    isModalOpen,
  } = usePokedex();

  const [targetPokemon, setTargetPokemon] = useState<Pokemon | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isNewlyUnlocked, setIsNewlyUnlocked] = useState(false);
  const [isAlreadyUnlocked, setIsAlreadyUnlocked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlayingCry, setIsPlayingCry] = useState(false);

  // Input & Guess State
  const [query, setQuery] = useState('');
  const [hasError, setHasError] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stats
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const roundCounterRef = useRef(0);
  const allPokemon = useMemo(() => getAllKnownPokemon(), []);

  // Artwork image URL
  const artworkUrl = targetPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${targetPokemon.id}.png`
    : '';

  // Play audio cry
  const playCry = useCallback((pokemonId: number) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
      const audio = new Audio(cryUrl);
      audio.volume = 0.7;
      audioRef.current = audio;
      setIsPlayingCry(true);

      audio.play().catch(() => {
        setIsPlayingCry(false);
      });
      audio.onended = () => setIsPlayingCry(false);
      audio.onerror = () => setIsPlayingCry(false);
    } catch {
      setIsPlayingCry(false);
    }
  }, []);

  // Pick next Pokémon: ALWAYS prioritize unregistered Pokémon
  const loadNextRound = useCallback(async () => {
    const currentRound = ++roundCounterRef.current;

    setIsLoading(true);
    setIsRevealed(false);
    setIsNewlyUnlocked(false);
    setIsAlreadyUnlocked(false);
    setImageLoaded(false);
    setQuery('');
    setHasError(false);
    setIncorrectAttempts([]);
    setStartTime(Date.now());

    // Always draw a strictly unregistered Pokémon for the current player
    const playerId = currentUser?.id || 'usr-player-1';
    const storageUnlocked = storageService.getPlayerUnlockedEntries(playerId).map((e) => e.pokemonId);
    const combinedUnlocked = Array.from(new Set([...unlockedIds, ...storageUnlocked]));
    let picked: Pokemon | null = getRandomUndiscoveredPokemon(combinedUnlocked);

    // Fallback only if player has unlocked all 1,025 Pokémon
    if (!picked) {
      const total = allPokemon.length > 0 ? allPokemon.length : 1025;
      const randomId = Math.floor(Math.random() * total) + 1;
      picked = getPokemonById(randomId) || null;
    }

    if (!picked) {
      picked = getPokemonById(25) || createPokemonStub(25, 'pikachu');
    }

    // Fetch full details asynchronously for complete types and artwork
    const fullTarget = await getPokemonByIdAsync(picked.id);
    const activeTarget = fullTarget || picked;

    // Fully preload image in memory before displaying
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activeTarget.id}.png`;
    await new Promise<void>((resolve) => {
      const preloader = new Image();
      preloader.onload = () => resolve();
      preloader.onerror = () => resolve();
      preloader.src = imgUrl;
    });

    if (currentRound !== roundCounterRef.current) return;

    setTargetPokemon(activeTarget);
    setImageLoaded(true);
    setIsLoading(false);

    // Focus input after round load
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    // Auto-play cry for the newly loaded target
    setTimeout(() => {
      playCry(activeTarget.id);
    }, 150);
  }, [allPokemon, unlockedIds, currentUser, playCry]);

  // Initial load
  useEffect(() => {
    loadNextRound();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Check player's guess
  const handleCheckGuess = (inputName: string) => {
    if (!targetPokemon || isRevealed || isLoading) return;

    const normInput = normalizePokemonQuery(inputName);
    if (!normInput) return;

    const normTargetName = normalizePokemonQuery(targetPokemon.name);
    const normTargetDisplay = normalizePokemonQuery(targetPokemon.displayName);
    const hasAliasMatch = (targetPokemon.aliases || []).some(
      (alias) => normalizePokemonQuery(alias) === normInput
    );

    const isMatch =
      normInput === normTargetName ||
      normInput === normTargetDisplay ||
      hasAliasMatch;

    if (isMatch) {
      // Victory!
      setHasError(false);
      setIsRevealed(true);

      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const wasAlreadyUnlocked = isPokemonUnlocked(targetPokemon.id);
      setIsAlreadyUnlocked(wasAlreadyUnlocked);

      setStreak((prev) => prev + 1);
      setSolvedCount((prev) => prev + 1);

      try {
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'],
        });
      } catch {
        // Confetti optional
      }

      // Register into Pokédex silently
      registerById(targetPokemon.id, 'identicry').then((regResult) => {
        if (regResult.newlyUnlockedCount > 0 || !wasAlreadyUnlocked) {
          setIsNewlyUnlocked(true);
        }
      });

      storageService.recordArenaSession({
        userId: currentUser?.id || 'usr-player-1',
        gameType: 'identicry',
        pokemonId: targetPokemon.id,
        isWon: true,
        attemptsUsed: incorrectAttempts.length + 1,
        timeTakenSeconds: elapsedSeconds,
      });
    } else {
      // Incorrect guess: Identity remains concealed!
      setHasError(true);
      const trimmed = inputName.trim();
      if (!incorrectAttempts.includes(trimmed)) {
        setIncorrectAttempts((prev) => [trimmed, ...prev]);
      }
      setQuery('');
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed) {
      loadNextRound();
      return;
    }
    if (query.trim()) {
      handleCheckGuess(query);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
        return;
      }

      if ((e.key === ' ' || e.key === 'Enter') && isRevealed) {
        e.preventDefault();
        loadNextRound();
        return;
      }

      // Replay cry hotkey (only when not focused on an active text input)
      if ((e.key === 'r' || e.key === 'R') && targetPokemon && document.activeElement !== inputRef.current) {
        e.preventDefault();
        playCry(targetPokemon.id);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isModalOpen, onBack, loadNextRound, targetPokemon, playCry]);

  return (
    <div className="w-full flex flex-col justify-between h-[calc(100vh-theme(spacing.20))] max-h-[860px] min-h-[580px] select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90 dark:border-slate-800">
        {/* Back Button + Game Icon + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Back to Minigames"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Identicry
          </h1>
        </div>

        {/* Streak & Solved Counts */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-bold font-mono">
            <Flame
              className={`w-3.5 h-3.5 ${
                streak > 0 ? 'text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span>{streak} Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{solvedCount} Solved</span>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Stage Area */}
      <div className="flex-1 min-h-0 my-4 relative rounded-3xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col justify-between p-6 sm:p-8">
        {/* Subtle Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 0.8px, transparent 0.8px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Decorative Scanner Corner Brackets */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-br-sm pointer-events-none" />

        {/* Registered Stamp (Positioned in top-right of canvas upon victory) */}
        <AnimatePresence>
          {isRevealed && targetPokemon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-8 right-8 sm:top-10 sm:right-10 z-20 pointer-events-none select-none"
            >
              <ChalkRegisteredStamp isNew={isNewlyUnlocked} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Stage Bar: Deduction Hints */}
        <div className="relative z-10 flex flex-col items-start gap-2 pl-4 sm:pl-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hints:
          </span>

          {isLoading || !targetPokemon ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="w-24 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border border-slate-200/80 dark:border-slate-700/80" />
              <div className="w-20 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border border-slate-200/80 dark:border-slate-700/80" />
              <div className="w-16 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border border-slate-200/80 dark:border-slate-700/80" />
              <div className="w-24 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border border-slate-200/80 dark:border-slate-700/80" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* First letter hint */}
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                Starts with '{targetPokemon.displayName.charAt(0).toUpperCase()}'
              </span>

              {/* Letter count */}
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                {targetPokemon.displayName.replace(/[^a-zA-Z]/g, '').length} Letters
              </span>

              {/* Generation */}
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                Gen {targetPokemon.generation}
              </span>

              {/* Type Badges */}
              <div className="flex items-center gap-1">
                {targetPokemon.types.map((t) => {
                  const theme = POKEMON_TYPE_THEMES[t];
                  return (
                    <span
                      key={t}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        theme ? theme.border : 'border-slate-200 dark:border-slate-700'
                      } ${theme ? theme.badgeBg : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    >
                      {theme ? theme.name : t}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Central Display: Sound Visualizer / Replay Cry OR Revealed Pokémon */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full min-h-[220px]">
          {isLoading || !targetPokemon || !imageLoaded ? (
            <div className="flex flex-col items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : isRevealed ? (
            /* Revealed Pokémon Artwork on Victory */
            <div className="relative inline-flex items-center justify-center pointer-events-none select-none">
              <img
                key={targetPokemon.id}
                src={artworkUrl}
                alt={targetPokemon.displayName}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[200px] sm:max-h-[240px] md:max-h-[270px] w-auto object-contain transition-all duration-500 select-none pointer-events-none"
                style={{
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  WebkitTouchCallout: 'none',
                } as React.CSSProperties}
              />

              {/* Pokéball Insignia (Positioned near top-right of the Pokémon) */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-3 -right-6 sm:-top-5 sm:-right-8 z-20 pointer-events-none select-none"
                >
                  <PokeballChalkMark
                    status={isNewlyUnlocked ? 'newly-registered' : 'registered'}
                    size="sm"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* Audio Frequency Visualizer Stage (Zero Visual Previews) */
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Equalizer Frequency Bars */}
              <div className="flex items-end justify-center gap-2 h-20 sm:h-24 px-6 py-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                {EQUALIZER_BARS.map((heightPercent, idx) => (
                  <div
                    key={idx}
                    className={`w-2 sm:w-2.5 rounded-full transition-all duration-150 ${
                      isPlayingCry
                        ? 'bg-purple-600 dark:bg-purple-400'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    style={{
                      height: isPlayingCry
                        ? `${Math.max(15, (heightPercent + ((idx * 17) % 35))) % 100}%`
                        : '20%',
                    }}
                  />
                ))}
              </div>

              {/* Large Replay Cry Action Button */}
              <button
                type="button"
                onClick={() => playCry(targetPokemon.id)}
                disabled={isPlayingCry}
                className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 text-purple-700 dark:text-purple-300 font-bold text-sm sm:text-base flex items-center gap-3 cursor-pointer transition-all active:scale-95 shadow-2xs disabled:opacity-75"
              >
                {isPlayingCry ? (
                  <>
                    <Radio className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <span>Playing Cry...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Replay Audio Cry</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Floating Middle-Bottom Interactive Dock */}
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="guess-input-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full space-y-2"
              >
                {/* Input Bar Form */}
                <form
                  onSubmit={handleSubmit}
                  className={`w-full flex items-center gap-2 p-1.5 sm:p-2 bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                    hasError
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-200/90 dark:border-slate-800 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20'
                  }`}
                >
                  <div className="relative flex-1 flex items-center pl-3">
                    <Crosshair className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        if (hasError) setHasError(false);
                      }}
                      disabled={isLoading}
                      placeholder="Type Pokémon name..."
                      autoComplete="off"
                      spellCheck="false"
                      className="w-full py-2.5 pl-2.5 pr-8 bg-transparent text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal text-sm sm:text-base focus:outline-none"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('');
                          inputRef.current?.focus();
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={loadNextRound}
                      disabled={isLoading}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                      title="Skip this Pokémon"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Skip</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm shadow-purple-600/20"
                    >
                      <span>Guess</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Error Banner & Tried Guesses */}
                <div className="min-h-[20px] flex items-center justify-between px-2 text-xs">
                  {hasError ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      Not quite! Listen again or try another guess.
                    </span>
                  ) : incorrectAttempts.length > 0 ? (
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                      <span>Tried:</span>
                      {incorrectAttempts.slice(0, 3).map((item, i) => (
                        <span key={i} className="line-through text-slate-500 dark:text-slate-400 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      Listen to the audio cry and type the Pokémon's name.
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Revealed Victory Banner */
              <motion.div
                key="revealed-panel"
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800"
              >
                {/* Pokémon Info: Dex #, Name, Types */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                    #{String(targetPokemon?.id || 0).padStart(4, '0')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">
                    {targetPokemon?.displayName}
                  </span>

                  {/* Types */}
                  <div className="flex items-center gap-1">
                    {targetPokemon?.types.map((t) => {
                      const theme = POKEMON_TYPE_THEMES[t];
                      return (
                        <span
                          key={t}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            theme ? theme.border : 'border-slate-200 dark:border-slate-700'
                          } ${theme ? theme.badgeBg : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          {theme ? theme.name : t}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions: View Dex + Next Pokémon */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (targetPokemon) {
                        openDetailModal(targetPokemon, false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>View Dex</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadNextRound}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm shadow-purple-600/20"
                  >
                    <span>Next Pokémon</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Embedded Pokémon Detail Modal for "View Dex" */}
      {selectedPokemon && (
        <PokemonDetailModal
          pokemon={selectedPokemon}
          isOpen={isModalOpen}
          onClose={closeDetailModal}
          unlockedIds={unlockedIds}
          registeredPokemonList={allPokemon}
          isNewlyRegistered={isNewlyUnlocked}
          isRegistered={isPokemonUnlocked(selectedPokemon.id)}
          showNavigation={false}
        />
      )}
    </div>
  );
};

export default Identicry;
