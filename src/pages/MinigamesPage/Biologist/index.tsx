import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Trophy,
  ScrollText,
  Crosshair,
  ArrowRight,
  SkipForward,
  XCircle,
  X,
  Loader2,
  BookOpen,
  RefreshCw,
  Lock,
  AlertTriangle,
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
import { fetchBiologyExcerpt } from '../../../services/biologistService';
import ChalkRegisteredStamp from '../../../components/common/ChalkRegisteredStamp';
import PokeballChalkMark from '../../../components/common/PokeballChalkMark';
import PokemonDetailModal from '../../PokedexPage/components/PokemonDetailModal';

interface BiologistProps {
  onBack: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

/** Render masked text with ▢▢▢▢▢▢▢▢ shown as redaction blocks */
function RedactedText({ text }: { text?: string }) {
  if (!text || typeof text !== 'string') return null;

  // Split text into segments: normal text vs redaction markers
  const parts = text.split(/(▢▢▢▢▢▢▢▢)/g);

  return (
    <span>
      {parts.map((part, i) =>
        part === '▢▢▢▢▢▢▢▢' ? (
          <span
            key={i}
            className="inline-block bg-teal-900 dark:bg-teal-700 text-teal-900 dark:text-teal-700 rounded-sm select-none mx-0.5 px-[0.35em] leading-tight"
            title="Redacted"
            style={{ minWidth: '4rem' }}
          >
            ▢▢▢▢▢▢▢
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

/**
 * Calculates the largest font size (px) that fits the given masked text
 * inside the wrapper element without overflowing.
 * Uses an isolated off-screen element with identical typography styling to measure
 * height instantly and accurately without CSS transition delays or layout glitches.
 */
function useFitFontSize(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  text: string,
  min = 15,
  max = 22
): number {
  const [fontSize, setFontSize] = useState(18);

  const calculateFit = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !text) return;

    const availableWidth = wrapper.clientWidth;
    const availableHeight = wrapper.clientHeight;

    if (availableWidth < 100 || availableHeight < 60) return;

    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'fixed';
    measureDiv.style.top = '-9999px';
    measureDiv.style.left = '-9999px';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.pointerEvents = 'none';
    measureDiv.style.width = `${availableWidth}px`;
    measureDiv.style.boxSizing = 'border-box';
    measureDiv.style.fontFamily = 'Georgia, serif';
    measureDiv.style.lineHeight = '1.625'; // Tailwind leading-relaxed
    measureDiv.style.whiteSpace = 'normal';
    measureDiv.style.wordBreak = 'break-word';

    const parts = text.split(/(▢▢▢▢▢▢▢▢)/g);
    measureDiv.innerHTML = parts
      .map((part) =>
        part === '▢▢▢▢▢▢▢▢'
          ? `<span style="display:inline-block;min-width:4rem;padding:0 0.35em;">▢▢▢▢▢▢▢</span>`
          : `<span>${part.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
      )
      .join('');

    document.body.appendChild(measureDiv);

    try {
      let bestSize = min;
      for (let size = max; size >= min; size -= 0.5) {
        measureDiv.style.fontSize = `${size}px`;
        const contentHeight = measureDiv.scrollHeight;
        if (contentHeight <= availableHeight - 6) {
          bestSize = size;
          break;
        }
      }
      setFontSize(bestSize);
    } finally {
      document.body.removeChild(measureDiv);
    }
  }, [text, min, max, wrapperRef]);

  useEffect(() => {
    calculateFit();

    const t1 = setTimeout(calculateFit, 60);
    const t2 = setTimeout(calculateFit, 200);
    const t3 = setTimeout(calculateFit, 400);

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    const ro = new ResizeObserver(() => {
      calculateFit();
    });
    ro.observe(wrapper);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
    };
  }, [calculateFit, wrapperRef]);

  return fontSize;
}

export const Biologist: React.FC<BiologistProps> = ({ onBack }) => {
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
  const [maskedText, setMaskedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [redactionCount, setRedactionCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const [isRevealed, setIsRevealed] = useState(false);
  const [isNewlyUnlocked, setIsNewlyUnlocked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Input & Guess State
  const [query, setQuery] = useState('');
  const [hasError, setHasError] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stats
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const roundCounterRef = useRef(0);
  const allPokemon = useMemo(() => getAllKnownPokemon(), []);
  const showHints = storageService.getGameConfig().biologist?.showHints ?? true;

  // Refs for dynamic font-size fitting
  const bioTextWrapperRef = useRef<HTMLDivElement>(null);
  const bioFontSize = useFitFontSize(bioTextWrapperRef, maskedText);

  const artworkUrl = targetPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${targetPokemon.id}.png`
    : '';

  const loadNextRound = useCallback(async () => {
    const currentRound = ++roundCounterRef.current;

    setLoadState('loading');
    setIsRevealed(false);
    setIsNewlyUnlocked(false);
    setImageLoaded(false);
    setQuery('');
    setHasError(false);
    setIncorrectAttempts([]);
    setStartTime(Date.now());
    setMaskedText('');
    setOriginalText('');
    setRedactionCount(0);

    // Pick an unregistered Pokémon
    const playerId = currentUser?.id || 'usr-player-1';
    const storageUnlocked = storageService.getPlayerUnlockedEntries(playerId).map((e) => e.pokemonId);
    const combinedUnlocked = Array.from(new Set([...unlockedIds, ...storageUnlocked]));
    const fetchMode = storageService.getGameConfig().general.pokemonFetch ?? 'undiscovered';
    let picked: Pokemon | null = getRandomPokemonForGame(combinedUnlocked, fetchMode, storageService.getGameConfig().general.enabledGenerations);

    if (!picked) {
      const total = allPokemon.length > 0 ? allPokemon.length : 1025;
      const randomId = Math.floor(Math.random() * total) + 1;
      picked = getPokemonById(randomId) || null;
    }

    if (!picked) {
      picked = getPokemonById(25) || createPokemonStub(25, 'pikachu');
    }

    // Fetch full details
    const fullTarget = await getPokemonByIdAsync(picked.id);
    const activeTarget = fullTarget || picked;

    if (currentRound !== roundCounterRef.current) return;
    setTargetPokemon(activeTarget);

    // Preload artwork in parallel with the Biology fetch
    const imgPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activeTarget.id}.png`;
    });

    // Fetch Biology excerpt from Bulbapedia
    try {
      const [excerpt] = await Promise.all([
        fetchBiologyExcerpt(
          activeTarget.name,
          activeTarget.displayName,
          activeTarget.aliases ?? [],
          75,
          activeTarget.id
        ),
        imgPromise,
      ]);

      if (currentRound !== roundCounterRef.current) return;

      setMaskedText(excerpt.maskedText);
      setOriginalText(excerpt.originalText);
      setRedactionCount(excerpt.redactionCount);
      setImageLoaded(true);
      setLoadState('ready');

      setTimeout(() => inputRef.current?.focus(), 60);
    } catch {
      if (currentRound !== roundCounterRef.current) return;
      setLoadState('error');
    }
  }, [allPokemon, unlockedIds, currentUser]);

  useEffect(() => {
    loadNextRound();
  }, []);

  // Check player's guess
  const handleCheckGuess = (inputName: string) => {
    if (!targetPokemon || isRevealed || loadState !== 'ready') return;

    const normInput = normalizePokemonQuery(inputName);
    if (!normInput) return;

    const normTargetName = normalizePokemonQuery(targetPokemon.name);
    const normTargetDisplay = normalizePokemonQuery(targetPokemon.displayName);
    const hasAliasMatch = (targetPokemon.aliases || []).some(
      (alias) => normalizePokemonQuery(alias) === normInput
    );

    const isMatch =
      normInput === normTargetName || normInput === normTargetDisplay || hasAliasMatch;

    if (isMatch) {
      setHasError(false);
      setIsRevealed(true);

      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const wasAlreadyUnlocked = isPokemonUnlocked(targetPokemon.id);

      setStreak((prev) => prev + 1);
      setSolvedCount((prev) => prev + 1);

      try {
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#14b8a6', '#10b981', '#3b82f6', '#a78bfa'],
        });
      } catch {
        // Confetti optional
      }

      registerById(targetPokemon.id, 'biologist').then((regResult) => {
        if (regResult.newlyUnlockedCount > 0 || !wasAlreadyUnlocked) {
          setIsNewlyUnlocked(true);
        }
      });

      storageService.recordArenaSession({
        userId: currentUser?.id || 'usr-player-1',
        gameType: 'biologist',
        pokemonId: targetPokemon.id,
        isWon: true,
        attemptsUsed: incorrectAttempts.length + 1,
        timeTakenSeconds: elapsedSeconds,
      });
    } else {
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

  // Keyboard shortcuts
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isModalOpen, onBack, loadNextRound]);

  return (
    <div className="w-full flex flex-col justify-between h-[calc(100vh-theme(spacing.20))] max-h-[860px] min-h-[580px] select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Back to Minigames"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/20">
            <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Biolo-gist
          </h1>
        </div>

        {/* Streak & Solved */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-bold font-mono">
            <Flame
              className={`w-3.5 h-3.5 ${
                streak > 0 ? 'text-teal-600 dark:text-teal-400 fill-teal-600 dark:fill-teal-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span>{streak} Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{solvedCount} Solved</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 min-h-0 my-4 relative rounded-3xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col justify-between p-6 sm:p-8">
        {/* Dot Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 0.8px, transparent 0.8px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-br-sm pointer-events-none" />

        {/* Registered Stamp */}
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

        {/* Biology Text Display */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {loadState === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Fetching Bulbapedia entry...</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Couldn't fetch Biology entry</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                  This could be a network issue or a missing Bulbapedia page.
                </p>
              </div>
              <button
                type="button"
                onClick={loadNextRound}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Another Pokémon</span>
              </button>
            </div>
          )}

          {loadState === 'ready' && (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Bio Passage Card */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  {!isRevealed ? (
                    <motion.div
                      key="masked-bio"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 h-full flex flex-col"
                    >
                      {/* Source Attribution — fixed height */}
                      <div className="flex items-center gap-1.5 mb-4 shrink-0">
                        <Lock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                          Pokémon Biology
                        </span>
                        <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {redactionCount}× redacted
                        </span>
                      </div>

                      {/* Masked Biology Text — fills remaining card height */}
                      <div
                        ref={bioTextWrapperRef}
                        className="flex-1 min-h-0 overflow-y-auto"
                      >
                        <p
                          className="leading-relaxed text-slate-700 dark:text-slate-200 font-[Georgia,_serif]"
                          style={{ fontSize: `${bioFontSize}px` }}
                        >
                          <RedactedText text={maskedText} />
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    /* Victory: show Pokémon artwork */
                    <motion.div
                      key="revealed-pokemon"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 flex items-center justify-center h-full"
                    >
                      <div className="relative inline-flex items-center justify-center pointer-events-none select-none">
                        {imageLoaded ? (
                          <img
                            key={targetPokemon?.id}
                            src={artworkUrl}
                            alt={targetPokemon?.displayName}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            className="max-h-[200px] sm:max-h-[240px] w-auto object-contain select-none pointer-events-none"
                            style={{
                              userSelect: 'none',
                              WebkitUserDrag: 'none',
                              WebkitTouchCallout: 'none',
                            } as React.CSSProperties}
                          />
                        ) : (
                          <div className="w-40 h-40 flex items-center justify-center">
                            <Loader2 className="w-7 h-7 animate-spin text-teal-600 dark:text-teal-400" />
                          </div>
                        )}

                        {/* Pokéball Insignia */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute -top-3 -right-6 sm:-top-5 sm:-right-8 z-20 pointer-events-none select-none"
                        >
                          <PokeballChalkMark
                            status={isNewlyUnlocked ? 'newly-registered' : 'registered'}
                            size="sm"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hints Row (Gen, Types) — shown while guessing */}
              {showHints && !isRevealed && targetPokemon && (
                <div className="relative z-10 flex flex-wrap items-center gap-1.5 pl-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                    Hints:
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    Gen {targetPokemon.generation}
                  </span>
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
              )}
            </div>
          )}
        </div>

        {/* Bottom Dock */}
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center gap-2 mt-4">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="guess-dock"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full space-y-2"
              >
                {/* Input Form */}
                <form
                  onSubmit={handleSubmit}
                  className={`w-full flex items-center gap-2 p-1.5 sm:p-2 bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                    hasError
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-slate-200/90 dark:border-slate-800 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20'
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
                      disabled={loadState !== 'ready'}
                      placeholder="Identify the Pokémon..."
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
                      disabled={loadState === 'loading'}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                      title="Skip to another Pokémon"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Skip</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loadState !== 'ready' || !query.trim()}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm shadow-teal-600/20"
                    >
                      <span>Guess</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Feedback Row */}
                <div className="min-h-[20px] flex items-center justify-between px-2 text-xs">
                  {hasError ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      Not quite! Read the biology again and try another name.
                    </span>
                  ) : incorrectAttempts.length > 0 ? (
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                      <span>Tried:</span>
                      {incorrectAttempts.slice(0, 4).map((item, i) => (
                        <span key={i} className="line-through text-slate-500 dark:text-slate-400 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      Read the biology passage and identify the mystery Pokémon.
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Post-reveal panel */
              <motion.div
                key="revealed-panel"
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800"
              >
                {/* Pokémon Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 shrink-0">
                    #{String(targetPokemon?.id || 0).padStart(4, '0')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display tracking-tight truncate">
                    {targetPokemon?.displayName}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
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

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (targetPokemon) openDetailModal(targetPokemon, false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>View Dex</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadNextRound}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm shadow-teal-600/20"
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

      {/* Pokédex Detail Modal */}
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

export default Biologist;
