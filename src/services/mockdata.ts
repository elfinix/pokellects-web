import { PlayerUser, AdminUser } from '../types/user';
import { GameConfiguration, FeatureFlags, Achievement, GameMetadata } from '../types/game';

export const MOCK_PLAYERS: PlayerUser[] = [
  {
    id: 'usr-player-1',
    username: 'ash_ketchum',
    firstName: 'Ash',
    lastName: 'Ketchum',
    email: 'ash@pokellects.dev',
    gender: 'male',
    birthday: '2001-05-22',
    role: 'player',
    unlockedPokemonIds: [1, 4, 7, 25], // Bulbasaur, Charmander, Squirtle, Pikachu
    stats: {
      totalGuesses: 18,
      correctGuesses: 14,
      arenaWins: 8,
    },
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-player-2',
    username: 'serena_kalos',
    firstName: 'Serena',
    lastName: 'Yvonne',
    email: 'serena@pokellects.dev',
    gender: 'female',
    birthday: '2002-10-15',
    role: 'player',
    unlockedPokemonIds: [653, 656], // Fennekin, Froakie
    stats: {
      totalGuesses: 12,
      correctGuesses: 10,
      arenaWins: 5,
    },
    createdAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'usr-player-3',
    username: 'morgan_dex',
    firstName: 'Morgan',
    email: 'morgan@pokellects.dev',
    gender: 'non-binary',
    birthday: '1999-07-04',
    role: 'player',
    unlockedPokemonIds: [133, 196, 197], // Eevee, Espeon, Umbreon
    stats: {
      totalGuesses: 24,
      correctGuesses: 21,
      arenaWins: 12,
    },
    createdAt: '2026-02-15T09:30:00Z',
  },
];

export const MOCK_ADMIN: AdminUser = {
  id: 'usr-admin-1',
  username: 'prof_oak',
  firstName: 'Samuel',
  lastName: 'Oak',
  email: 'oak@pokellects.dev',
  gender: 'male',
  birthday: '1962-09-28',
  role: 'admin',
  department: 'Pokémon Ecological Research & Development',
  createdAt: '2026-01-01T00:00:00Z',
};

// Default passwords for demo/testing convenience
export const DEMO_CREDENTIALS = {
  player: {
    username: 'ash_ketchum',
    password: 'PikachuPassword123!',
  },
  admin: {
    username: 'prof_oak',
    password: 'PalletTownAdmin!',
  },
};

export const DEFAULT_GAME_CONFIG: GameConfiguration = {
  whosThatPokemon: {
    timerSeconds: 15,
    showTypeHint: true,
    showGenerationHint: true,
    maxAttempts: 3,
    imageSize: 'normal',
  },
  hangmon: {
    maxStrikes: 6,
    showCategoryHint: true,
    timerSeconds: 45,
  },
  identicry: {
    replayCryLimit: 3,
    timerSeconds: 20,
    multipleChoiceOptions: 4,
    showHints: true,
  },
  biologist: {
    showHints: true,
  },
  general: {
    allowAnyGeneration: true,
    enabledGenerations: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    pokemonFetch: 'undiscovered',
  },
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableWhosThatPokemon: true,
  enableHangmon: true,
  enableIdenticry: true,
  enablePokedlePreview: true,
  enableAudioCries: true,
  enableConfetti: true,
};

export const ARENA_GAMES_METADATA: GameMetadata[] = [
  {
    id: 'whos_that_pokemon',
    title: "Who's That Pokémon?",
    tagline: 'The iconic TV silhouette challenge.',
    description: 'A shadowy silhouette appears on the scanner. Type the exact species name to identify the mystery Pokémon at your own pace, or skip to the next.',
    difficulty: 'Easy',
    isAvailable: true,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'hangmon',
    title: 'Hangmon',
    tagline: 'Guess letter-by-letter without revealing the species.',
    description: 'Solve the concealed Pokémon name tile-by-tile. Use category cues, letter patterns, and length clues. The Pokémon is not revealed until you win or strikes run out!',
    difficulty: 'Medium',
    isAvailable: true,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'identicry',
    title: 'Identicry',
    tagline: 'Identify species solely by audio cry.',
    description: 'Hear the authentic synthesized or melodic cry of an unrevealed Pokémon with zero visual previews, and choose the correct species from 4 choices.',
    difficulty: 'Hard',
    isAvailable: true,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'biologist',
    title: 'Biolo-gist',
    tagline: 'Deduce species from Bulbapedia biology lore.',
    description: "Read authentic Bulbapedia 'Biology' sections with redacted names. Deduce the described Pokémon at your own pace, or skip if stumped.",
    difficulty: 'Medium',
    isAvailable: true,
    color: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'pokedle',
    title: 'Pokédle',
    tagline: 'Coming soon',
    description: 'Wordle-style daily attribute deduction matrix. Guess the secret species using type, generation, and size clues.',
    difficulty: 'Medium',
    isAvailable: false,
    color: 'from-slate-400 to-slate-500',
  },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-catch',
    title: 'First Step to Mastery',
    description: 'Register your very first Pokémon into the personal Pokédex.',
    category: 'collection',
    icon: 'Award',
    targetCount: 1,
    unlockedAt: '2026-01-10T08:15:00Z',
  },
  {
    id: 'ach-kanto-10',
    title: 'Kanto Explorer',
    description: 'Register at least 10 Pokémon originating from the Kanto region.',
    category: 'collection',
    icon: 'Compass',
    targetCount: 10,
  },
  {
    id: 'ach-arena-champion',
    title: 'Minigame Contender',
    description: 'Successfully complete 5 minigames.',
    category: 'arena',
    icon: 'Swords',
    targetCount: 5,
    unlockedAt: '2026-01-15T14:20:00Z',
  },
  {
    id: 'ach-sound-master',
    title: 'Golden Ear',
    description: 'Win 3 rounds of Identicry without replaying the cry audio.',
    category: 'mastery',
    icon: 'Volume2',
    targetCount: 3,
  },
];
