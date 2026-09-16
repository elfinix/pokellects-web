import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';
import { usePokedex } from '../../../context/PokedexContext';

interface FloatingRegistrationBarProps {
  isModalOpen: boolean;
  onRegisteredPokemon?: (pokemonId: number) => void;
}

export const FloatingRegistrationBar: React.FC<FloatingRegistrationBarProps> = ({
  isModalOpen,
  onRegisteredPokemon,
}) => {
  const { registerByQuery } = usePokedex();
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused on mount and whenever modal closes
  useEffect(() => {
    if (!isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const result = registerByQuery(query);
    if (result.success) {
      setFeedback({ message: result.message, isError: false });
      setQuery('');
      if (result.registeredList && result.registeredList.length > 0 && onRegisteredPokemon) {
        onRegisteredPokemon(result.registeredList[0].id);
      }
    } else {
      setFeedback({ message: result.message, isError: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setFeedback(null);
    }
  };

  return (
    <div className="sticky bottom-4 z-30 max-w-3xl w-full mx-auto px-4 pointer-events-auto">
      {/* Floating Pill Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xl shadow-slate-900/10 space-y-2 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Feedback Message Banner */}
        {feedback && (
          <div
            className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
              feedback.isError
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {feedback.isError ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className="font-semibold truncate">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Omnibar Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Type Pokémon to register (e.g. "Nidoran", "Tauros", "Porygon Z", "Mr. Mime")...'
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all shadow-2xs font-medium placeholder:text-slate-400"
            />
            <span className="hidden sm:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd>
            </span>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Register</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloatingRegistrationBar;
