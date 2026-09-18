import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Pokemon } from '../../../../types/pokemon';
import { normalizePokemonQuery, getAllKnownPokemon } from '../../../../services/pokemonIndex';

interface IdentificationInputProps {
  targetPokemon: Pokemon | null;
  isRevealed: boolean;
  onGuessCorrect: () => void;
  onSkip: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const IdentificationInput: React.FC<IdentificationInputProps> = ({
  targetPokemon,
  isRevealed,
  onGuessCorrect,
  onSkip,
  onNext,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [incorrectAttempts, setIncorrectAttempts] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // All known Pokémon for autocomplete suggestions
  const allPokemon = useMemo(() => getAllKnownPokemon(), []);

  // Filter autocomplete suggestions based on current query
  const suggestions = useMemo(() => {
    const norm = normalizePokemonQuery(query);
    if (!norm || norm.length < 2 || isRevealed) return [];

    return allPokemon
      .filter((p) => {
        const normName = normalizePokemonQuery(p.name);
        const normDisplay = normalizePokemonQuery(p.displayName);
        return (
          normName.startsWith(norm) ||
          normDisplay.startsWith(norm) ||
          normName.includes(norm) ||
          normDisplay.includes(norm)
        );
      })
      .slice(0, 5);
  }, [query, allPokemon, isRevealed]);

  // Reset state when new round / target starts
  useEffect(() => {
    setQuery('');
    setIncorrectAttempts([]);
    setHasError(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [targetPokemon?.id]);

  // Check if input matches target Pokémon
  const checkAnswer = (inputName: string) => {
    if (!targetPokemon || isRevealed || disabled) return;

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
      setHasError(false);
      onGuessCorrect();
    } else {
      setHasError(true);
      if (!incorrectAttempts.includes(inputName.trim())) {
        setIncorrectAttempts((prev) => [inputName.trim(), ...prev]);
      }
      setQuery('');
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed) {
      onNext();
      return;
    }
    if (query.trim()) {
      checkAnswer(query);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Species Identification
          </h3>
          <p className="text-xs text-slate-500">
            {isRevealed
              ? 'Species identified! Ready for next mystery.'
              : 'Type the exact name of this Pokémon.'}
          </p>
        </div>

        {incorrectAttempts.length > 0 && !isRevealed && (
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
            {incorrectAttempts.length} {incorrectAttempts.length === 1 ? 'try' : 'tries'}
          </span>
        )}
      </div>

      {/* Main Input Form / Card */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {!isRevealed ? (
          <form onSubmit={handleSubmit} className="space-y-3 relative">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (hasError) setHasError(false);
                }}
                disabled={disabled}
                placeholder="Enter Pokémon name..."
                autoComplete="off"
                spellCheck="false"
                className={`w-full py-3.5 pl-11 pr-10 rounded-2xl bg-white border text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs ${
                  hasError
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-200/90 focus:border-amber-500 ring-0 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />

              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete suggestions dropdown */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-20"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setQuery(s.displayName);
                          checkAnswer(s.displayName);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-amber-50/50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        <span>{s.displayName}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          #{String(s.id).padStart(4, '0')}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 text-xs font-semibold text-rose-600 px-1"
                >
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Not quite! Try another species or skip.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Previous Incorrect Guesses Chips */}
            {incorrectAttempts.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Tried:</span>
                {incorrectAttempts.slice(0, 4).map((attempt, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium line-through"
                  >
                    {attempt}
                  </span>
                ))}
              </div>
            )}
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2 text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-emerald-950 font-display">
              Correct! It's {targetPokemon?.displayName}!
            </h4>
            <p className="text-xs text-emerald-700 font-medium">
              Registered into your Pokédex collection.
            </p>
          </motion.div>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {!isRevealed ? (
          <>
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
            >
              <SkipForward className="w-3.5 h-3.5 text-slate-500" />
              <span>Skip Pokémon</span>
            </button>

            <button
              type="button"
              onClick={() => checkAnswer(query)}
              disabled={disabled || !query.trim()}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>Submit Guess</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <span>Next Pokémon</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default IdentificationInput;
