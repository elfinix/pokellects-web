import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Trophy,
  Play,
  Search,
  X,
  LayoutGrid,
  Rows3,
  Eye,
  Type,
  Volume2,
  ScrollText,
  Grid3X3,
  Lock,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import storageService, { ArenaSessionRecord } from '../../services/storageService';
import { ARENA_GAMES_METADATA } from '../../services/mockdata';
import { GameMetadata, ArenaGameType } from '../../types/game';
import { useDatabaseVersion } from '../../hooks/useDatabaseVersion';
import WhosThatPokemon from './WhosThatPokemon';
import Hangmon from './Hangmon';
import Identicry from './Identicry';
import Biologist from './Biologist';

interface MinigamesPageProps {
  onPlayGame?: (gameId: ArenaGameType) => void;
}

interface GameCustomTheme {
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  cardBgGradient: string;
  iconBg: string;
  iconColor: string;
  buttonGradient: string;
  rules: string[];
  specs: string[];
}

const GAME_THEMES: Record<ArenaGameType, GameCustomTheme> = {
  whos_that_pokemon: {
    icon: Eye,
    accentColor: 'text-purple-500',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-900/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    cardBorder: 'border-purple-200/70 dark:border-purple-900/50 hover:border-purple-400/90 dark:hover:border-purple-500/80',
    cardBgGradient: 'from-purple-500/8 dark:from-purple-500/15 via-pink-500/4 dark:via-pink-500/8 to-transparent',
    iconBg: 'bg-purple-100/80 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    iconColor: 'text-purple-600 dark:text-purple-400',
    buttonGradient: 'bg-purple-600 hover:bg-purple-700 text-white',
    specs: ['Guessing Game', 'Identification', 'Silhouette Scan'],
    rules: [
      'A mystery silhouette appears on the scanner screen.',
      'Type the exact species name to identify the Pokémon, or skip to another.',
      'Each correct victory registers an undiscovered Pokémon into your Pokédex.',
    ],
  },
  hangmon: {
    icon: Type,
    accentColor: 'text-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    cardBorder: 'border-blue-200/70 dark:border-blue-900/50 hover:border-blue-400/90 dark:hover:border-blue-500/80',
    cardBgGradient: 'from-blue-500/8 dark:from-blue-500/15 via-cyan-500/4 dark:via-cyan-500/8 to-transparent',
    iconBg: 'bg-blue-100/80 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonGradient: 'bg-blue-600 hover:bg-blue-700 text-white',
    specs: ['6 Strikes Max', 'Letter Guesser', 'Clues'],
    rules: [
      'Guess the hidden Pokémon name letter-by-letter before strikes run out.',
      'The Pokémon identity and sprite remain completely concealed throughout the challenge.',
      'Solve the name to capture the Pokémon directly into your collection.',
    ],
  },
  identicry: {
    icon: Volume2,
    accentColor: 'text-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    cardBorder: 'border-amber-200/70 dark:border-amber-900/50 hover:border-amber-400/90 dark:hover:border-amber-500/80',
    cardBgGradient: 'from-amber-500/8 dark:from-amber-500/15 via-rose-500/4 dark:via-rose-500/8 to-transparent',
    iconBg: 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    buttonGradient: 'bg-amber-500 hover:bg-amber-600 text-white',
    specs: ['Audio Cry', 'Identification', 'Clues'],
    rules: [
      'Listen to the authentic audio cry of an unknown species without visual previews.',
      'Type the species name based solely on the audio — no multiple choice spoilers.',
      'Replay the cry as many times as needed and lock in your guess for a Pokédex entry.',
    ],
  },
  biologist: {
    icon: ScrollText,
    accentColor: 'text-teal-500',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200/80 dark:border-teal-900/60',
    badgeText: 'text-teal-700 dark:text-teal-300',
    cardBorder: 'border-teal-200/70 dark:border-teal-900/50 hover:border-teal-400/90 dark:hover:border-teal-500/80',
    cardBgGradient: 'from-teal-500/8 dark:from-teal-500/15 via-emerald-500/4 dark:via-emerald-500/8 to-transparent',
    iconBg: 'bg-teal-100/80 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400',
    iconColor: 'text-teal-600 dark:text-teal-400',
    buttonGradient: 'bg-teal-600 hover:bg-teal-700 text-white',
    specs: ['Bulbapedia', 'Identification', 'Familiarity'],
    rules: [
      'Read authentic physical traits and ecological lore scraped directly from Bulbapedia.',
      'Species names and explicit giveaways are redacted for maximum deduction fun.',
      'Identify the described Pokémon at your own pace, or skip to the next clue.',
    ],
  },
  pokedle: {
    icon: Grid3X3,
    accentColor: 'text-slate-400',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700',
    badgeText: 'text-slate-600 dark:text-slate-400',
    cardBorder: 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
    cardBgGradient: 'from-slate-500/5 dark:from-slate-500/10 via-slate-500/2 dark:via-slate-500/5 to-transparent',
    iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500',
    iconColor: 'text-slate-400 dark:text-slate-500',
    buttonGradient: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-700 cursor-not-allowed',
    specs: [],
    rules: [
      'Guess the secret Pokémon within 6 attempts.',
      'Receive color-coded feedback on Type, Generation, Height, Weight, and Stage.',
      'Currently in development for the upcoming season.',
    ],
  },
};

export const MinigamesPage: React.FC<MinigamesPageProps> = ({ onPlayGame }) => {
  const { currentUser } = useAuth();
  const databaseVersion = useDatabaseVersion();
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);
  const [activeGame, setActiveGame] = useState<ArenaGameType | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'row'>('grid');
  const [sessions, setSessions] = useState<ArenaSessionRecord[]>([]);

  const handleViewModeChange = (mode: 'grid' | 'row') => {
    setViewMode(mode);
    if (currentUser) storageService.updateUserSettings(currentUser.id, { minigamesView: mode });
  };

  useEffect(() => {
    const records = storageService.getArenaSessions(currentUser?.id);
    setSessions(records);
    if (currentUser) setViewMode(storageService.getUserSettings(currentUser.id).minigamesView);
  }, [currentUser?.id, databaseVersion]);

  const totalVictories = useMemo(() => sessions.filter((s) => s.isWon).length, [sessions]);
  const totalPlayed = useMemo(() => sessions.length, [sessions]);

  const filteredGames = useMemo(() => {
    const flags = storageService.getFeatureFlags();
    const games = ARENA_GAMES_METADATA.map((game) => ({
      ...game,
      isAvailable: game.id === 'whos_that_pokemon' ? flags.enableWhosThatPokemon
        : game.id === 'hangmon' ? flags.enableHangmon
        : game.id === 'identicry' ? flags.enableIdenticry
        : game.id === 'pokedle' ? flags.enablePokedlePreview && game.isAvailable
        : game.isAvailable,
    }));
    if (!search.trim()) return games;
    const q = search.toLowerCase();
    return games.filter(
      (game) =>
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.tagline.toLowerCase().includes(q)
    );
  }, [search, databaseVersion]);

  const handleLaunchGame = (gameId: ArenaGameType) => {
    setSelectedGame(null);
    if (
      gameId === 'whos_that_pokemon' ||
      gameId === 'hangmon' ||
      gameId === 'identicry' ||
      gameId === 'biologist'
    ) {
      setActiveGame(gameId);
    }
    if (onPlayGame) {
      onPlayGame(gameId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedGame) return;
      if (e.key === 'Escape') {
        setSelectedGame(null);
      } else if (e.key === 'Enter' && selectedGame.isAvailable) {
        handleLaunchGame(selectedGame.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame, onPlayGame]);

  if (activeGame === 'whos_that_pokemon') {
    return (
      <WhosThatPokemon
        onBack={() => {
          setActiveGame(null);
          setSessions(storageService.getArenaSessions(currentUser?.id));
        }}
      />
    );
  }

  if (activeGame === 'hangmon') {
    return (
      <Hangmon
        onBack={() => {
          setActiveGame(null);
          setSessions(storageService.getArenaSessions(currentUser?.id));
        }}
      />
    );
  }

  if (activeGame === 'identicry') {
    return (
      <Identicry
        onBack={() => {
          setActiveGame(null);
          setSessions(storageService.getArenaSessions(currentUser?.id));
        }}
      />
    );
  }

  if (activeGame === 'biologist') {
    return (
      <Biologist
        onBack={() => {
          setActiveGame(null);
          setSessions(storageService.getArenaSessions(currentUser?.id));
        }}
      />
    );
  }

  return (
    <div className="space-y-7 sm:space-y-8 pb-6 relative">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-1">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span>Minigames</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Win challenges to register undiscovered Pokémon into your Pokédex.
          </p>
        </div>

        {/* Quick Trainer Minigame Stats Chips */}
        <div className="grid grid-cols-2 w-full sm:w-auto gap-3 shrink-0 self-start sm:self-auto sm:pt-0.5">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Victories</div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono leading-none mt-0.5">{totalVictories}</div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Played</div>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono leading-none mt-0.5">{totalPlayed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search Input & View Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 transition-all relative z-10 shadow-xs">
        {/* Search Field */}
        <div className="relative flex-1 min-w-0 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search minigames..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-hidden focus:border-red-500/80 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500/10 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle: Grid (2x2) vs Row (1 per row) */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0">
          <button
            type="button"
            onClick={() => handleViewModeChange('grid')}
            aria-label="Grid view"
            className={`w-10 sm:w-auto h-10 flex items-center justify-center gap-2 sm:px-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-bold ${
              viewMode === 'grid'
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                : 'bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('row')}
            aria-label="Row view"
            className={`w-10 sm:w-auto h-10 flex items-center justify-center gap-2 sm:px-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-bold ${
              viewMode === 'row'
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                : 'bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Rows3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Row</span>
          </button>
        </div>
      </div>

      {/* Minigame Cards: Grid vs Row Layout */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredGames.map((game) => {
            const theme = GAME_THEMES[game.id];
            const IconComponent = theme.icon;
            const gameSessions = sessions.filter((s) => s.gameType === game.id);
            const gameWins = gameSessions.filter((s) => s.isWon).length;

            return (
              <div
                key={game.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border ${theme.cardBorder} transition-colors flex flex-col justify-between space-y-5 relative overflow-hidden bg-gradient-to-br ${theme.cardBgGradient}`}
              >
                {/* Card Top Section: Icon, Title, Badges */}
                <div className="space-y-3.5 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${theme.iconBg}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight leading-tight">
                          {game.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {game.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Badges: Difficulty & Status */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText}`}
                      >
                        {game.difficulty}
                      </span>
                      {!game.isAvailable && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" />
                          <span>In Dev</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1-sentence clean description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {game.description}
                  </p>

                  {/* Feature / Specs Pills */}
                  {theme.specs.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {theme.specs.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-2xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>Mode mechanics in development</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Reward info & Full-Width Styled Action Button */}
                <div className="pt-4 border-t border-slate-100/90 dark:border-slate-800 space-y-3 relative z-10">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        {game.isAvailable ? (
                          <>
                            <strong className="font-semibold text-slate-700 dark:text-slate-200">+1 Pokédex Entry</strong> on win
                          </>
                        ) : (
                          'Dev is cooking'
                        )}
                      </span>
                    </div>

                    {gameSessions.length > 0 && (
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-medium">
                        Wins: {gameWins}/{gameSessions.length}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!game.isAvailable}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                      game.isAvailable
                        ? `${theme.buttonGradient} cursor-pointer active:scale-[0.99]`
                        : `${theme.buttonGradient}`
                    }`}
                  >
                    {game.isAvailable ? (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Play Challenge</span>
                        <ArrowRight className="w-4 h-4 opacity-75" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>In Development</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          {filteredGames.map((game) => {
            const theme = GAME_THEMES[game.id];
            const IconComponent = theme.icon;
            const gameSessions = sessions.filter((s) => s.gameType === game.id);
            const gameWins = gameSessions.filter((s) => s.isWon).length;

            return (
              <div
                key={game.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border ${theme.cardBorder} transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r ${theme.cardBgGradient}`}
              >
                {/* Left & Middle: Icon (Top-Left) + Content Column */}
                <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0 relative z-10">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${theme.iconBg}`}
                  >
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Title + Tagline + Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight leading-none">
                        {game.title}
                      </h3>
                      <span className="text-xs text-slate-400 dark:text-slate-600 font-medium hidden lg:inline">•</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline truncate">
                        {game.tagline}
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText}`}
                        >
                          {game.difficulty}
                        </span>
                        {!game.isAvailable && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>In Dev</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 1-sentence clean description with constrained max width */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-lg lg:max-w-xl">
                      {game.description}
                    </p>

                    {/* Feature / Specs Pills & Dex Reward */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {theme.specs.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-2xs"
                        >
                          {spec}
                        </span>
                      ))}
                      {theme.specs.length > 0 && (
                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          {game.isAvailable ? '+1 Pokédex Entry on win' : 'Dev is cooking'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action: Play Button & Win Record (Vertically Centered in Middle) */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center md:self-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100/90 dark:border-slate-800 relative z-10">
                  {gameSessions.length > 0 && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-medium">
                      Wins: {gameWins}/{gameSessions.length}
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={!game.isAvailable}
                    onClick={() => setSelectedGame(game)}
                    className={`py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0 ${
                      game.isAvailable
                        ? `${theme.buttonGradient} cursor-pointer active:scale-[0.98]`
                        : `${theme.buttonGradient}`
                    }`}
                  >
                    {game.isAvailable ? (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Play Challenge</span>
                        <ArrowRight className="w-4 h-4 opacity-75" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>In Development</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when search has no results */}
      {filteredGames.length === 0 && (
        <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No minigames found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords.
          </p>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Quick Launch & Briefing Modal */}
      <AnimatePresence>
        {selectedGame && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const theme = GAME_THEMES[selectedGame.id];
                    const IconComp = theme.icon;
                    return (
                      <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 font-display leading-tight">
                      {selectedGame.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {selectedGame.tagline}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${GAME_THEMES[selectedGame.id].badgeBg} ${GAME_THEMES[selectedGame.id].badgeText}`}
                >
                  {selectedGame.difficulty}
                </span>
              </div>

              {/* Rules & Gameplay Briefing */}
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  How to Play
                </div>
                <div className="space-y-2">
                  {GAME_THEMES[selectedGame.id].rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reward Callout */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Victories register the Pokémon into your Pokédex!</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedGame(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  {selectedGame.isAvailable && (
                    <button
                      type="button"
                      onClick={() => handleLaunchGame(selectedGame.id)}
                      className={`px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${GAME_THEMES[selectedGame.id].buttonGradient}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch Challenge</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MinigamesPage;
