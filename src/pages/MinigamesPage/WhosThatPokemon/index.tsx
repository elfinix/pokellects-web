import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Eye,
  Crosshair,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Loader2,
  BookOpen,
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

interface WhosThatPokemonProps {
  onBack: () => void;
}

export const WhosThatPokemon: React.FC<WhosThatPokemonProps> = ({ onBack }) => {
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

  // Input & Guess State
  const [query, setQuery] = useState('');
  const [hasError, setHasError] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const roundCounterRef = useRef(0);

  // Stats
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  const allPokemon = useMemo(() => getAllKnownPokemon(), []);
  const gameConfig = storageService.getGameConfig().whosThatPokemon;
  const showGenerationHint = gameConfig.showGenerationHint ?? true;
  const showTypeHint = gameConfig.showTypeHint ?? true;

  // Artwork image URL
  const artworkUrl = targetPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${targetPokemon.id}.png`
    : '';

  // Pick next Pokémon: ALWAYS prioritize unregistered Pokémon with robust preloading
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

    // Fully preload the image in memory before displaying to prevent any flicker or swapping
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activeTarget.id}.png`;
    await new Promise<void>((resolve) => {
      const preloader = new Image();
      preloader.onload = () => resolve();
      preloader.onerror = () => resolve();
      preloader.src = imgUrl;
    });

    // Check if another round was requested in the meantime
    if (currentRound !== roundCounterRef.current) return;

    setTargetPokemon(activeTarget);
    setImageLoaded(true);
    setIsLoading(false);

    // Focus input after round load
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  }, [allPokemon, unlockedIds]);

  // Initial round load on mount only
  useEffect(() => {
    loadNextRound();
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
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch {
        // Confetti optional
      }

      // Register into Pokédex without triggering automatic popup
      registerById(targetPokemon.id, 'whos_that_pokemon').then((regResult) => {
        if (regResult.newlyUnlockedCount > 0 || !wasAlreadyUnlocked) {
          setIsNewlyUnlocked(true);
        }
      });

      storageService.recordArenaSession({
        userId: currentUser?.id || 'usr-player-1',
        gameType: 'whos_that_pokemon',
        pokemonId: targetPokemon.id,
        isWon: true,
        attemptsUsed: incorrectAttempts.length + 1,
        timeTakenSeconds: elapsedSeconds,
      });
    } else {
      // Incorrect attempt
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

      // Escape -> Back
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
        return;
      }

      // Space or Enter -> Next when revealed
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

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <h1 className="text-lg sm:text-2xl leading-tight font-black text-slate-900 dark:text-slate-100 font-display tracking-tight max-w-[92px] sm:max-w-none">
            Who's That Pokémon?
          </h1>
        </div>

        {/* Streak & Caught Counts */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-bold font-mono">
            <Flame
              className={`w-3.5 h-3.5 ${
                streak > 0 ? 'text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span>{streak}<span className="hidden min-[420px]:inline"> Streak</span></span>
          </div>

          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{solvedCount}<span className="hidden min-[420px]:inline"> Caught</span></span>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Canvas Area */}
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

        {/* Registered Stamp (Positioned in top-right of canvas) */}
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

        {(showGenerationHint || showTypeHint) && !isLoading && targetPokemon && (
          <div className="relative z-10 flex flex-wrap items-center gap-1.5 pl-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">Hints:</span>
            {showGenerationHint && <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Gen {targetPokemon.generation}</span>}
            {showTypeHint && targetPokemon.types.map((type) => {
              const theme = POKEMON_TYPE_THEMES[type];
              return <span key={type} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme ? theme.border : 'border-slate-200 dark:border-slate-700'} ${theme ? theme.badgeBg : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{theme ? theme.name : type}</span>;
            })}
          </div>
        )}

        {/* Central Pokémon Display (Cleanly loaded with zero flicker) */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full min-h-[260px]">
          {isLoading || !targetPokemon || !imageLoaded ? (
            <div className="flex flex-col items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <div className="relative inline-flex items-center justify-center pointer-events-none select-none">
              <img
                key={targetPokemon.id}
                src={artworkUrl}
                alt="Mystery Pokémon"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className={`${(storageService.getGameConfig().whosThatPokemon.imageSize ?? 'normal') === 'smaller' ? 'max-h-[150px] sm:max-h-[180px] md:max-h-[205px]' : 'max-h-[200px] sm:max-h-[240px] md:max-h-[270px]'} w-auto object-contain transition-all duration-500 select-none pointer-events-none ${
                  isRevealed
                    ? 'filter-none scale-100'
                    : 'brightness-0 opacity-85 scale-95 dark:invert dark:opacity-75'
                }`}
                style={{
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  WebkitTouchCallout: 'none',
                } as React.CSSProperties}
              />

              {/* Pokéball Insignia (Positioned near top-right of the Pokémon) */}
              <AnimatePresence>
                {isRevealed && (
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
                )}
              </AnimatePresence>
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
                      ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20'
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
                      className="w-full py-2.5 pl-2.5 pr-8 bg-transparent text-slate-900 dark:text-slate-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal text-sm sm:text-base focus:outline-none"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('');
                          inputRef.current?.focus();
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                      title="Skip this Pokémon"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Skip</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm shadow-purple-600/20"
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
                      <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                      Not quite! Try another guess or skip.
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
                      Type the exact name and press Enter to guess.
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="revealed-panel"
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md"
              >
                {/* Pokémon Info: Dex #, Name, Types */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                    #{String(targetPokemon?.id || 0).padStart(4, '0')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
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

      {/* Embedded Pokémon Detail Modal for "View Dex" (Single species view with insignia & stamp) */}
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

export default WhosThatPokemon;
