import { Pokemon } from '../types/pokemon';
import {
  fetchCompletePokemon,
  fetchPokemon,
  fetchAllPokemonList,
  formatDisplayName,
  generateAliases,
  getGenerationFromId,
  createPokemonStub,
  generateInitialDexStubs,
  GENERATION_TOTALS,
} from './pokeapi';

// In-memory dynamic Pokémon registry (stores fetched full Pokémon records)
const dynamicRegistry = new Map<number, Pokemon>();

// Preload initial stubs (1 to 1025) into the registry
export const ALL_KNOWN_POKEMON = generateInitialDexStubs();
export const ALL_KNOWN_POKEMON_MAP: Record<number, Pokemon> = {};

ALL_KNOWN_POKEMON.forEach((stub) => {
  dynamicRegistry.set(stub.id, stub);
  ALL_KNOWN_POKEMON_MAP[stub.id] = stub;
});

export interface RegionMeta {
  generation: number;
  name: string;
  startId: number;
  endId: number;
}

export const REGION_METADATA: RegionMeta[] = [
  { generation: 1, name: 'Kanto', startId: 1, endId: 151 },
  { generation: 2, name: 'Johto', startId: 152, endId: 251 },
  { generation: 3, name: 'Hoenn', startId: 252, endId: 386 },
  { generation: 4, name: 'Sinnoh', startId: 387, endId: 493 },
  { generation: 5, name: 'Unova', startId: 494, endId: 649 },
  { generation: 6, name: 'Kalos', startId: 650, endId: 721 },
  { generation: 7, name: 'Alola', startId: 722, endId: 809 },
  { generation: 8, name: 'Galar & Hisui', startId: 810, endId: 905 },
  { generation: 9, name: 'Paldea', startId: 906, endId: 1025 },
];

// Asynchronously fetch canonical names from PokeAPI v2 to refine stubs
fetchAllPokemonList().then((list) => {
  list.forEach((item) => {
    const existing = dynamicRegistry.get(item.id);
    if (existing) {
      existing.name = item.name;
      existing.displayName = formatDisplayName(item.name);
      existing.aliases = generateAliases(item.name, existing.displayName);
      ALL_KNOWN_POKEMON_MAP[item.id] = existing;
    } else {
      const stub = createPokemonStub(item.id, item.name);
      dynamicRegistry.set(item.id, stub);
      ALL_KNOWN_POKEMON_MAP[item.id] = stub;
    }
  });
});

/**
 * Normalizes user input for robust comparison:
 * - Lowercases and trims
 * - Removes accents (e.g. Flabébé -> flabebe)
 * - Replaces hyphens, periods, apostrophes, and multiple spaces with a clean single space or empty string
 */
export function normalizePokemonQuery(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/['’.]/g, '') // remove punctuation like apostrophes and periods
    .replace(/[-_]/g, ' ') // convert hyphens to space
    .replace(/\s+/g, ' ') // collapse multi-spaces
    .trim();
}

/**
 * Synchronously searches the current registered Pokémon registry for matching Pokémon.
 * Implements Option A multi-matching for variants (e.g. "nidoran", "tauros").
 */
export function resolvePokemonByQuery(query: string): Pokemon[] {
  const normalized = normalizePokemonQuery(query);
  if (!normalized) return [];

  const allKnown = Array.from(dynamicRegistry.values());

  // 1. Direct ID lookup (e.g. "#25" or "25")
  const idMatch = normalized.replace(/^#/, '');
  if (/^\d+$/.test(idMatch)) {
    const num = parseInt(idMatch, 10);
    const byId = dynamicRegistry.get(num);
    return byId ? [byId] : [];
  }

  // 2. Exact name or canonical alias match
  const matches = allKnown.filter((p) => {
    const normCanonical = normalizePokemonQuery(p.name);
    const normDisplay = normalizePokemonQuery(p.displayName);
    const hasAliasMatch = (p.aliases || []).some((alias) => normalizePokemonQuery(alias) === normalized);
    return normCanonical === normalized || normDisplay === normalized || hasAliasMatch;
  });

  return matches;
}

/**
 * Asynchronously searches and resolves Pokémon by query across both local registry and PokeAPI v2.
 * Allows resolving and registering any Pokémon across all 1025 species dynamically.
 */
export async function resolvePokemonByQueryAsync(query: string): Promise<Pokemon[]> {
  const normalized = normalizePokemonQuery(query);
  if (!normalized) return [];

  const idMatch = normalized.replace(/^#/, '');
  if (/^\d+$/.test(idMatch)) {
    const id = parseInt(idMatch, 10);
    if (id >= 1 && id <= 1025) {
      const remote = await fetchCompletePokemon(id);
      if (remote) {
        dynamicRegistry.set(remote.id, remote);
        return [remote];
      }
    }
  }

  // Search through all 1025 Pokémon list
  try {
    const list = await fetchAllPokemonList();
    const slugQuery = normalized.replace(/\s+/g, '-');
    const matchingSlugs = list.filter((item) => {
      const itemNorm = normalizePokemonQuery(item.name);
      return itemNorm === normalized || item.name === slugQuery;
    });

    if (matchingSlugs.length > 0) {
      const fetchedList = await Promise.all(
        matchingSlugs.map(async (m) => {
          const remote = await fetchCompletePokemon(m.id);
          if (remote) {
            dynamicRegistry.set(remote.id, remote);
          }
          return remote;
        })
      );
      return fetchedList.filter((p): p is Pokemon => p !== null);
    }
  } catch (err) {
    console.warn('[pokemonIndex] Async query resolution failed:', err);
  }

  // Fallback to local synchronous resolution
  return resolvePokemonByQuery(query);
}

/**
 * Gets a random Pokémon from ANY generation that the user has NOT yet unlocked.
 * Randomly picks from all 1,025 valid Pokémon species.
 */
export function getRandomUndiscoveredPokemon(unlockedIds: number[]): Pokemon | null {
  const unlockedSet = new Set(unlockedIds);
  const eligibleIds: number[] = [];
  for (let i = 1; i <= 1025; i++) {
    if (!unlockedSet.has(i)) {
      eligibleIds.push(i);
    }
  }

  if (eligibleIds.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * eligibleIds.length);
  const pickedId = eligibleIds[randomIndex];
  return dynamicRegistry.get(pickedId) || createPokemonStub(pickedId);
}

/** Selects from either a trainer's undiscovered roster or the complete Pokédex. */
export function getRandomPokemonForGame(
  unlockedIds: number[],
  fetchMode: 'undiscovered' | 'all' = 'undiscovered'
): Pokemon | null {
  if (fetchMode === 'undiscovered') return getRandomUndiscoveredPokemon(unlockedIds);
  const id = Math.floor(Math.random() * 1025) + 1;
  return dynamicRegistry.get(id) || createPokemonStub(id);
}

/**
 * Helper to fetch a Pokémon by exact ID from the local registry.
 */
export function getPokemonById(id: number): Pokemon | undefined {
  return dynamicRegistry.get(id);
}

/**
 * Helper to fetch a Pokémon by exact ID asynchronously, fetching from PokeAPI if not in registry.
 */
export async function getPokemonByIdAsync(id: number): Promise<Pokemon | null> {
  const local = dynamicRegistry.get(id);
  if (local && local.abilities && local.abilities.length > 0) {
    return local;
  }

  const remote = await fetchCompletePokemon(id);
  if (remote) {
    dynamicRegistry.set(remote.id, remote);
    return remote;
  }
  return local || null;
}

/**
 * Returns all 1,025 Pokémon entries from the registry.
 */
export function getAllKnownPokemon(): Pokemon[] {
  return Array.from(dynamicRegistry.values()).sort((a, b) => a.id - b.id);
}

/**
 * Registers / stores a detailed Pokémon record into the runtime registry.
 */
export function cachePokemon(pokemon: Pokemon): void {
  dynamicRegistry.set(pokemon.id, pokemon);
}

export const pokemonIndexService = {
  normalizePokemonQuery,
  resolvePokemonByQuery,
  resolvePokemonByQueryAsync,
  getRandomUndiscoveredPokemon,
  getRandomPokemonForGame,
  getPokemonById,
  getPokemonByIdAsync,
  getAllKnownPokemon,
  cachePokemon,
  formatDisplayName,
  generateAliases,
  getGenerationFromId,
  GENERATION_TOTALS,
};

export default pokemonIndexService;
