export type ArenaGameType = 'whos_that_pokemon' | 'hangmon' | 'identicry' | 'biologist' | 'pokedle';

export interface GameMetadata {
  id: ArenaGameType;
  title: string;
  tagline: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isAvailable: boolean;
  color: string;
}

export interface GameConfiguration {
  whosThatPokemon: {
    timerSeconds: number;
    showTypeHint: boolean;
    showGenerationHint: boolean;
    maxAttempts: number;
  };
  hangmon: {
    maxStrikes: number;
    showCategoryHint: boolean;
    timerSeconds: number;
  };
  identicry: {
    replayCryLimit: number;
    timerSeconds: number;
    multipleChoiceOptions: number; // 4 options
  };
  general: {
    allowAnyGeneration: boolean;
    enabledGenerations: number[]; // e.g. [1, 2, 3, 4, 5, 6, 7, 8, 9]
  };
}

export interface FeatureFlags {
  enableIdenticry: boolean;
  enableHangmon: boolean;
  enableWhosThatPokemon: boolean;
  enablePokedlePreview: boolean;
  enableAudioCries: boolean;
  enableConfetti: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'collection' | 'arena' | 'mastery';
  icon: string;
  targetCount: number;
  unlockedAt?: string;
}
