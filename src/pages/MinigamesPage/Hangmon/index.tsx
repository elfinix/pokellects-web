import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Type,
  ArrowRight,
  SkipForward,
  Sparkles,
  Loader2,
  BookOpen,
  Heart,
  HeartCrack,
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
  getRandomPokemonForGame,
  normalizePokemonQuery,
} from '../../../services/pokemonIndex';
import ChalkRegisteredStamp from '../../../components/common/ChalkRegisteredStamp';
import PokeballChalkMark from '../../../components/common/PokeballChalkMark';
import PokemonDetailModal from '../../PokedexPage/components/PokemonDetailModal';

interface HangmonProps {
  onBack: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const Hangmon: React.FC<HangmonProps> = ({ onBack }) => {
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
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isNewlyUnlocked, setIsNewlyUnlocked] = useState(false);
  const [isAlreadyUnlocked, setIsAlreadyUnlocked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Stats
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const roundCounterRef = useRef(0);

  const allPokemon = useMemo(() => getAllKnownPokemon(), []);
  const gameConfig = storageService.getGameConfig();
  const maxStrikes = gameConfig.hangmon.maxStrikes ?? 6;
  const showHints = gameConfig.hangmon.showCategoryHint ?? true;

  // Canonical letters to guess
  const targetLetters = useMemo(() => {
    if (!targetPokemon) return [];
    // Convert to uppercase letters, preserve hyphens/spaces
    return targetPokemon.name.toUpperCase().split('');
  }, [targetPokemon]);

  // Unique letters that must be guessed
  const requiredLettersSet = useMemo(() => {
    return new Set(
      targetLetters.filter((char) => /^[A-Z]$/.test(char))
    );
  }, [targetLetters]);

  // Wrong guesses count
  const wrongGuesses = useMemo(() => {
    let count = 0;
    guessedLetters.forEach((letter) => {
      if (!requiredLettersSet.has(letter)) {
        count++;
      }
    });
    return count;
  }, [guessedLetters, requiredLettersSet]);

  const strikesRemaining = maxStrikes - wrongGuesses;

  // Artwork image URL
  const artworkUrl = targetPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${targetPokemon.id}.png`
    : '';

  // Pick next Pokémon: ALWAYS prioritize unregistered Pokémon
  const loadNextRound = useCallback(async () => {
    const currentRound = ++roundCounterRef.current;

    setIsLoading(true);
    setIsRevealed(false);
    setIsWon(false);
    setIsNewlyUnlocked(false);
    setIsAlreadyUnlocked(false);
    setImageLoaded(false);
    setGuessedLetters(new Set());
    setStartTime(Date.now());

    // Always draw a strictly unregistered Pokémon for the current player
    const playerId = currentUser?.id || 'usr-player-1';
    const storageUnlocked = storageService.getPlayerUnlockedEntries(playerId).map((e) => e.pokemonId);
    const combinedUnlocked = Array.from(new Set([...unlockedIds, ...storageUnlocked]));
    const fetchMode = storageService.getGameConfig().general.pokemonFetch ?? 'undiscovered';
    let picked: Pokemon | null = getRandomPokemonForGame(combinedUnlocked, fetchMode, storageService.getGameConfig().general.enabledGenerations);

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
  }, [allPokemon, unlockedIds, currentUser]);

  // Initial load
  useEffect(() => {
    loadNextRound();
  }, []);

  // Handle letter guess
  const guessLetter = useCallback(
    (letter: string) => {
      if (isRevealed || isLoading || !targetPokemon) return;
      const upper = letter.toUpperCase();
      if (!/^[A-Z]$/.test(upper)) return;
      if (guessedLetters.has(upper)) return;

      const newGuessed = new Set(guessedLetters);
      newGuessed.add(upper);
      setGuessedLetters(newGuessed);

      // Check if this completes all required letters
      const allFound = Array.from(requiredLettersSet).every((l) => newGuessed.has(l));

      if (allFound) {
        // Victory!
        setIsRevealed(true);
        setIsWon(true);

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
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
          });
        } catch {
          // Confetti optional
        }

        // Register into Pokédex silently
        registerById(targetPokemon.id, 'hangmon').then((regResult) => {
          if (regResult.newlyUnlockedCount > 0 || !wasAlreadyUnlocked) {
            setIsNewlyUnlocked(true);
          }
        });

        storageService.recordArenaSession({
          userId: currentUser?.id || 'usr-player-1',
          gameType: 'hangmon',
          pokemonId: targetPokemon.id,
          isWon: true,
          attemptsUsed: newGuessed.size,
          timeTakenSeconds: elapsedSeconds,
        });
      } else {
        // Check if wrong guesses hit max strikes
        let wrongCount = 0;
        newGuessed.forEach((l) => {
          if (!requiredLettersSet.has(l)) wrongCount++;
        });

        if (wrongCount >= maxStrikes) {
          // Out of strikes - Loss
          setIsRevealed(true);
          setIsWon(false);
          setStreak(0);

          const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
          storageService.recordArenaSession({
            userId: currentUser?.id || 'usr-player-1',
            gameType: 'hangmon',
            pokemonId: targetPokemon.id,
            isWon: false,
            attemptsUsed: newGuessed.size,
            timeTakenSeconds: elapsedSeconds,
          });
        }
      }
    },
    [
      isRevealed,
      isLoading,
      targetPokemon,
      guessedLetters,
      requiredLettersSet,
      startTime,
      isPokemonUnlocked,
      registerById,
      currentUser,
      maxStrikes,
    ]
  );

  // Physical Keyboard Listener
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

      if (!isRevealed && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        guessLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isModalOpen, onBack, loadNextRound, guessLetter]);

  return (
    <div className="w-full flex flex-col justify-between h-[calc(100dvh-5.5rem)] min-h-[520px] md:h-[calc(100vh-theme(spacing.20))] md:max-h-[860px] md:min-h-[580px] select-none">
      {/* Top Header Bar */}
      <div className="flex items-start sm:items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-200/90 dark:border-slate-800">
        {/* Back Button + Game Icon + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Back to Minigames"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Type className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <h1 className="text-lg sm:text-2xl leading-tight font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
            Hangmon
          </h1>
        </div>

        {/* Streak & Solved Counts */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold font-mono">
            <Flame
              className={`w-3.5 h-3.5 ${
                streak > 0 ? 'text-blue-600 fill-blue-600 animate-pulse' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span>{streak}<span className="hidden min-[420px]:inline"> Streak</span></span>
          </div>

          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span>{solvedCount}<span className="hidden min-[420px]:inline"> Solved</span></span>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Stage Area */}
      <div className="flex-1 min-h-0 my-3 sm:my-4 relative rounded-3xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col justify-between p-3 sm:p-8">
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
          {isRevealed && isWon && targetPokemon && (
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

        {/* Top Stage Bar: Strikes / Lives Tracker & Hints */}
        <div className="relative z-10 flex flex-col items-start gap-2 pl-4 sm:pl-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chances:
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: maxStrikes }).map((_, idx) => {
                const isLost = idx >= strikesRemaining;
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isLost
                        ? 'bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-500 dark:text-rose-400 scale-90'
                        : 'bg-blue-600 border-blue-700 text-white'
                    }`}
                  >
                    {isLost ? (
                      <HeartCrack className="w-3 h-3" />
                    ) : (
                      <Heart className="w-3 h-3 fill-white" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showHints && (isLoading || !targetPokemon ? (
            <div className="flex items-center gap-2">
              <div className="w-14 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border border-slate-200/80 dark:border-slate-700" />
              <div className="w-32 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border border-slate-200/80 dark:border-slate-700" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                Gen {targetPokemon.generation}
              </span>
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {requiredLettersSet.size} Unique Letters
              </span>
            </div>
          ))}
        </div>

        {/* Central Display: Concealed Letter Tiles OR Revealed Pokémon (Only if won!) */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full min-h-[220px]">
          {isLoading || !targetPokemon || !imageLoaded ? (
            <div className="flex flex-col items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : isRevealed && isWon ? (
            <div className="relative inline-flex items-center justify-center pointer-events-none select-none">
              <img
                key={targetPokemon.id}
                src={artworkUrl}
                alt={targetPokemon.displayName}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[190px] sm:max-h-[220px] md:max-h-[250px] w-auto object-contain transition-all duration-500 select-none pointer-events-none"
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
          ) : isRevealed && !isWon ? (
            /* Concealed Identity State on Loss */
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-500 shadow-2xs">
                <HeartCrack className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">Chances Depleted</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                  Identity concealed to preserve the mystery for Pokédex recall!
                </p>
              </div>
            </div>
          ) : (
            /* Concealed Word Tile Slots */
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-2xl px-4 py-2">
              {targetLetters.map((char, idx) => {
                const isLetter = /^[A-Z]$/.test(char);
                const isGuessed = guessedLetters.has(char);

                if (!isLetter) {
                  // Special punctuation (hyphen, period, space)
                  return (
                    <div
                      key={idx}
                      className="w-5 sm:w-6 h-10 sm:h-12 flex items-center justify-center font-mono font-black text-xl text-slate-600 dark:text-slate-300"
                    >
                      {char}
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border flex items-center justify-center font-mono font-black text-lg sm:text-2xl transition-all ${
                      isGuessed
                        ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                        : 'bg-white/80 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-transparent border-dashed'
                    }`}
                  >
                    {isGuessed ? char : '_'}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Middle-Bottom Interactive Dock */}
        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="keyboard-dock"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full space-y-2.5"
              >
                {/* Virtual Alphabet Keyboard */}
                <div className="p-2 sm:p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-2xs">
                  {KEYBOARD_ROWS.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center justify-center gap-1 sm:gap-1.5">
                      {row.map((letter) => {
                        const isGuessed = guessedLetters.has(letter);
                        const isCorrect = isGuessed && requiredLettersSet.has(letter);
                        const isWrong = isGuessed && !requiredLettersSet.has(letter);

                        let buttonClasses =
                          'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500';

                        if (isCorrect) {
                          buttonClasses =
                            'bg-blue-600 border-blue-700 text-white font-black cursor-default';
                        } else if (isWrong) {
                          buttonClasses =
                            'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-40 line-through cursor-default';
                        }

                        return (
                          <button
                            key={letter}
                            type="button"
                            disabled={isGuessed || isLoading}
                            onClick={() => guessLetter(letter)}
                            className={`w-7 h-9 sm:w-9 sm:h-10 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:active:scale-100 ${buttonClasses}`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Skip Control */}
                <div className="flex items-center justify-between px-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    Click or type any letter A–Z on your keyboard.
                  </span>

                  <button
                    type="button"
                    onClick={loadNextRound}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Revealed Victory / Defeat Banner */
              <motion.div
                key="revealed-panel"
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md"
              >
                {isWon && targetPokemon ? (
                  <>
                    {/* Pokémon Info: Dex #, Name, Types */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        #{String(targetPokemon.id).padStart(4, '0')}
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
                        {targetPokemon.displayName}
                      </span>

                      {/* Types */}
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

                    {/* Actions: View Dex + Next Pokémon */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => openDetailModal(targetPokemon, false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>View Dex</span>
                      </button>

                      <button
                        type="button"
                        onClick={loadNextRound}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span>Next Pokémon</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Concealed Loss Notice */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <HeartCrack className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Try again on the next round!
                      </span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={loadNextRound}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span>Try Next Pokémon</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
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

export default Hangmon;
