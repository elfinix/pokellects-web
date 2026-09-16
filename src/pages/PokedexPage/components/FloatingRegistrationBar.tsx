import React, { useState, useRef, useEffect } from 'react';
import { Crosshair, CheckCircle2, AlertCircle, X } from 'lucide-react';
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

  // Auto-dismiss feedback message after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    // We accept Pokémon names only - reject if numeric or "#"
    if (/^\s*#?\d+\s*$/.test(cleanQuery)) {
      setFeedback({
        message: 'Please enter the Pokémon name (e.g. Pikachu), not the Pokédex number.',
        isError: true,
      });
      return;
    }

    const result = registerByQuery(cleanQuery);
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
    <div className="fixed bottom-6 sm:bottom-8 z-30 left-0 right-0 md:left-[var(--sidebar-width,16rem)] pointer-events-none flex justify-center px-4 transition-[left] duration-300 ease-in-out">
      {/* Floating Pill Card (Centered specifically on the Main Page, ignoring the sidebar) */}
      <div className="pointer-events-auto w-full max-w-xl md:max-w-2xl bg-white/95 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xl shadow-slate-900/15 hover:shadow-slate-900/20 transition-all space-y-2 relative overflow-hidden">
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
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Omnibar Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <div className="relative flex-1 flex items-center">
            {/* Thematic Pokéball Icon */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4.5 h-4.5 text-red-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M 2 12 H 22" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <path d="M 2.2 11 A 9.8 9.8 0 0 1 21.8 11 Z" fill="currentColor" fillOpacity="0.15" />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Register Pokémon by name..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all shadow-2xs font-medium placeholder:text-slate-400"
            />

            {/* Clear Input Button (when text is typed) */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Register</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloatingRegistrationBar;
