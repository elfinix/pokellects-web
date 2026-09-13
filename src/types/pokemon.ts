export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'fairy'
  | 'dark';

export interface PokemonStat {
  name: 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
  baseStat: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  description?: string;
}

export interface EvolutionNode {
  id: number;
  name: string;
  minLevel?: number;
  item?: string;
  trigger?: string;
  evolvesTo?: EvolutionNode[];
}

export interface Pokemon {
  id: number;
  name: string; // canonical name (e.g. "porygon-z")
  displayName: string; // formatted name (e.g. "Porygon-Z")
  aliases: string[]; // name variations (e.g. ["porygon z", "porygonz"])
  generation: number; // 1 to 9
  types: PokemonType[];
  spriteUrl: string; // official-artwork
  shinySpriteUrl?: string;
  cryUrl?: string; // latest pokemon cry audio mp3/ogg
  height: number; // in decimeters
  weight: number; // in hectograms
  genus: string; // e.g. "Seed Pokémon"
  flavorText?: string;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  evolutionChain?: EvolutionNode;
  isLegendary?: boolean;
  isMythical?: boolean;
}

export interface UnlockedPokemonEntry {
  pokemonId: number;
  unlockedAt: string; // ISO timestamp
  discoveryMethod: 'manual_dex_input' | 'whos_that_pokemon' | 'hangmon' | 'identicry' | 'starter_grant';
}
