import { Pokemon, PokemonType, EvolutionNode, PokemonStat, PokemonAbility } from '../types/pokemon';

// Base API endpoints
export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

// In-memory caches to minimize network roundtrips
const pokemonCache = new Map<number | string, Pokemon>();
const speciesCache = new Map<number | string, any>();
const evolutionUrlCache = new Map<string, EvolutionNode>();
let allPokemonListCache: { id: number; name: string; url: string }[] | null = null;

/**
 * Authentic canonical generation totals (Gen 1 - 9 = 1,025 Total).
 */
export const GENERATION_TOTALS: Record<number, number> = {
  1: 151, // 1 - 151
  2: 100, // 152 - 251
  3: 135, // 252 - 386
  4: 107, // 387 - 493
  5: 156, // 494 - 649
  6: 72,  // 650 - 721
  7: 88,  // 722 - 809
  8: 96,  // 810 - 905 (Galar: 810-898, Hisui: 899-905)
  9: 120, // 906 - 1025
};

/**
 * Calculates generation number (1 - 9) based on National Dex ID.
 */
export function getGenerationFromId(id: number): number {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

/**
 * Official artwork sprite URL generator.
 */
export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/**
 * Pixel in-game front_default sprite URL generator (sprites > front_default).
 */
export function getFrontDefaultSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

/**
 * Shiny official artwork sprite URL generator.
 */
export function getShinyArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

/**
 * Authentic latest Pokémon cry audio OGG URL generator.
 */
export function getCryAudioUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
}

/**
 * Formats a canonical slug name (e.g. "porygon-z" or "mr-mime") into a polished display name.
 */
export function formatDisplayName(slug: string): string {
  if (!slug) return '';
  if (slug === 'nidoran-f') return 'Nidoran♀';
  if (slug === 'nidoran-m') return 'Nidoran♂';
  if (slug === 'mr-mime') return 'Mr. Mime';
  if (slug === 'mr-rime') return 'Mr. Rime';
  if (slug === 'mime-jr') return 'Mime Jr.';
  if (slug === 'ho-oh') return 'Ho-Oh';
  if (slug === 'porygon-z') return 'Porygon-Z';
  if (slug === 'type-null') return 'Type: Null';
  if (slug === 'jangmo-o') return 'Jangmo-o';
  if (slug === 'hakamo-o') return 'Hakamo-o';
  if (slug === 'kommo-o') return 'Kommo-o';
  if (slug === 'tapu-koko') return 'Tapu Koko';
  if (slug === 'tapu-lele') return 'Tapu Lele';
  if (slug === 'tapu-bulu') return 'Tapu Bulu';
  if (slug === 'tapu-fini') return 'Tapu Fini';
  if (slug === 'wo-chien') return 'Wo-Chien';
  if (slug === 'chien-pao') return 'Chien-Pao';
  if (slug === 'ting-lu') return 'Ting-Lu';
  if (slug === 'chi-yu') return 'Chi-Yu';
  if (slug === 'flabebe') return 'Flabébé';

  // Capitalize hyphenated words or spaces
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates sensible aliases for robust lookup.
 */
export function generateAliases(slug: string, displayName: string): string[] {
  const set = new Set<string>();
  set.add(slug.toLowerCase());
  set.add(displayName.toLowerCase());
  set.add(slug.replace(/-/g, ' ').toLowerCase());
  set.add(slug.replace(/[-.':\s]/g, '').toLowerCase());

  if (slug === 'nidoran-f') {
    set.add('nidoran');
    set.add('nidoran f');
    set.add('nidoran female');
  }
  if (slug === 'nidoran-m') {
    set.add('nidoran');
    set.add('nidoran m');
    set.add('nidoran male');
  }
  if (slug === 'porygon-z') {
    set.add('porygon z');
    set.add('porygonz');
  }
  if (slug === 'mr-mime') {
    set.add('mr mime');
    set.add('mrmime');
  }
  if (slug === 'flabebe') {
    set.add('flabébé');
  }

  return Array.from(set);
}

/**
 * Creates a lightweight stub Pokémon for fast rendering and skeleton placeholders.
 */
export function createPokemonStub(id: number, name?: string): Pokemon {
  const slug = name || `pokemon-${id}`;
  const displayName = formatDisplayName(slug);
  return {
    id,
    name: slug,
    displayName,
    aliases: generateAliases(slug, displayName),
    generation: getGenerationFromId(id),
    types: ['normal'],
    spriteUrl: getOfficialArtworkUrl(id),
    shinySpriteUrl: getShinyArtworkUrl(id),
    frontDefaultUrl: getFrontDefaultSpriteUrl(id),
    cryUrl: getCryAudioUrl(id),
    height: 10,
    weight: 100,
    genus: 'Pokémon Species',
    flavorText: `A Pokémon discovered in Generation ${getGenerationFromId(id)}.`,
    stats: [
      { name: 'hp', baseStat: 50 },
      { name: 'attack', baseStat: 50 },
      { name: 'defense', baseStat: 50 },
      { name: 'special-attack', baseStat: 50 },
      { name: 'special-defense', baseStat: 50 },
      { name: 'speed', baseStat: 50 },
    ],
    abilities: [],
  };
}

/**
 * Generates the full 1,025 Pokémon stub catalogue.
 */
export function generateInitialDexStubs(): Pokemon[] {
  const stubs: Pokemon[] = [];
  for (let i = 1; i <= 1025; i++) {
    stubs.push(createPokemonStub(i));
  }
  return stubs;
}

/**
 * Fetches the complete list of Pokémon names & IDs from PokéAPI v2 (`/pokemon?limit=1025`).
 * Cached in memory for zero-latency queries.
 */
export async function fetchAllPokemonList(): Promise<{ id: number; name: string; url: string }[]> {
  if (allPokemonListCache && allPokemonListCache.length > 0) {
    return allPokemonListCache;
  }

  try {
    const res = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1025&offset=0`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const list = (data.results || []).map((item: { name: string; url: string }) => {
      const match = item.url.match(/\/pokemon\/(\d+)\//);
      const id = match ? parseInt(match[1], 10) : 0;
      return { id, name: item.name, url: item.url };
    });

    allPokemonListCache = list;
    return list;
  } catch (err) {
    console.warn('[PokeAPI] Could not fetch all Pokémon list from network, using stub list:', err);
    const fallbackList = [];
    for (let i = 1; i <= 1025; i++) {
      fallbackList.push({
        id: i,
        name: `pokemon-${i}`,
        url: `${POKEAPI_BASE_URL}/pokemon/${i}/`,
      });
    }
    allPokemonListCache = fallbackList;
    return fallbackList;
  }
}

/**
 * Fetches detailed Pokémon data from PokéAPI v2 (`/api/v2/pokemon/{id or name}`).
 */
export async function fetchPokemon(idOrName: number | string): Promise<Pokemon | null> {
  const cacheKey = typeof idOrName === 'string' ? idOrName.toLowerCase().trim() : idOrName;
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`);
    if (!res.ok) {
      if (typeof idOrName === 'number' && idOrName >= 1 && idOrName <= 1025) {
        return createPokemonStub(idOrName);
      }
      return null;
    }
    const data = await res.json();

    const id = data.id;
    const name = data.name;
    const displayName = formatDisplayName(name);
    const aliases = generateAliases(name, displayName);
    const generation = getGenerationFromId(id);

    const types: PokemonType[] = data.types.map((t: any) => t.type.name as PokemonType);

    const spriteUrl =
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      getOfficialArtworkUrl(id);

    const shinySpriteUrl =
      data.sprites?.other?.['official-artwork']?.front_shiny ||
      data.sprites?.front_shiny ||
      getShinyArtworkUrl(id);

    const frontDefaultUrl = data.sprites?.front_default || getFrontDefaultSpriteUrl(id);

    const cryUrl = data.cries?.latest || getCryAudioUrl(id);

    const stats: PokemonStat[] = [
      'hp',
      'attack',
      'defense',
      'special-attack',
      'special-defense',
      'speed',
    ].map((statName) => {
      const found = data.stats?.find((s: any) => s.stat?.name === statName);
      return {
        name: statName as PokemonStat['name'],
        baseStat: found ? found.base_stat : 50,
      };
    });

    const abilities: PokemonAbility[] = (data.abilities || []).map((a: any) => ({
      name: formatDisplayName(a.ability?.name || ''),
      isHidden: a.is_hidden || false,
    }));

    const pokemon: Pokemon = {
      id,
      name,
      displayName,
      aliases,
      generation,
      types,
      spriteUrl,
      shinySpriteUrl,
      frontDefaultUrl,
      cryUrl,
      height: data.height || 10,
      weight: data.weight || 100,
      genus: `${types[0]} Pokémon`,
      flavorText: `A ${types.join('/')} type Pokémon from Generation ${generation}.`,
      stats,
      abilities,
    };

    pokemonCache.set(id, pokemon);
    pokemonCache.set(name, pokemon);
    return pokemon;
  } catch (err) {
    console.warn(`[PokeAPI] Fetch failed for ${idOrName}:`, err);
    if (typeof idOrName === 'number' && idOrName >= 1 && idOrName <= 1025) {
      return createPokemonStub(idOrName);
    }
    return null;
  }
}

/**
 * Fetches species lore, genus, and flavor text from `/api/v2/pokemon-species/{id}`.
 */
export async function fetchSpeciesLore(id: number): Promise<{
  flavorText?: string;
  genus?: string;
  generation?: number;
  isLegendary?: boolean;
  isMythical?: boolean;
  evolutionChainUrl?: string;
}> {
  if (speciesCache.has(id)) {
    return speciesCache.get(id)!;
  }

  try {
    const res = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${id}/`);
    if (!res.ok) {
      return {
        flavorText: `A Pokémon discovered in Generation ${getGenerationFromId(id)}.`,
        genus: 'Pokémon Species',
        generation: getGenerationFromId(id),
      };
    }
    const data = await res.json();

    const englishEntry = data.flavor_text_entries?.find(
      (entry: { language: { name: string } }) => entry.language.name === 'en'
    );

    const englishGenus = data.genera?.find(
      (g: { language: { name: string } }) => g.language.name === 'en'
    );

    const lore = {
      flavorText: englishEntry?.flavor_text?.replace(/[\f\n\r]/g, ' '),
      genus: englishGenus?.genus || 'Pokémon Species',
      generation: getGenerationFromId(id),
      isLegendary: Boolean(data.is_legendary),
      isMythical: Boolean(data.is_mythical),
      evolutionChainUrl: data.evolution_chain?.url,
    };

    speciesCache.set(id, lore);
    return lore;
  } catch (err) {
    console.warn(`[PokeAPI] Species lore fetch failed for #${id}:`, err);
    return {
      flavorText: `A Pokémon discovered in Generation ${getGenerationFromId(id)}.`,
      genus: 'Pokémon Species',
      generation: getGenerationFromId(id),
    };
  }
}

/**
 * Fetches complete unified Pokémon representation by merging `/pokemon` and `/pokemon-species`.
 */
export async function fetchCompletePokemon(idOrName: number | string): Promise<Pokemon | null> {
  const base = await fetchPokemon(idOrName);
  if (!base) return null;

  try {
    const lore = await fetchSpeciesLore(base.id);
    const complete: Pokemon = {
      ...base,
      flavorText: lore.flavorText || base.flavorText,
      genus: lore.genus || base.genus,
      isLegendary: lore.isLegendary ?? base.isLegendary,
      isMythical: lore.isMythical ?? base.isMythical,
    };

    pokemonCache.set(base.id, complete);
    pokemonCache.set(base.name, complete);
    return complete;
  } catch {
    return base;
  }
}

/**
 * Fetches species evolution chain and recursively builds the EvolutionNode tree.
 */
export async function fetchEvolutionChain(chainUrl: string): Promise<EvolutionNode | null> {
  if (evolutionUrlCache.has(chainUrl)) {
    return evolutionUrlCache.get(chainUrl)!;
  }

  try {
    const res = await fetch(chainUrl);
    if (!res.ok) return null;
    const data = await res.json();

    const parseChainLink = (link: any): EvolutionNode => {
      const match = link.species?.url?.match(/\/pokemon-species\/(\d+)\//);
      const id = match ? parseInt(match[1], 10) : 0;
      const detail = link.evolution_details?.[0];

      return {
        id,
        name: link.species?.name || '',
        minLevel: detail?.min_level || undefined,
        item: detail?.item?.name ? formatDisplayName(detail.item.name) : undefined,
        trigger: detail?.trigger?.name ? formatDisplayName(detail.trigger.name) : undefined,
        evolvesTo: link.evolves_to && link.evolves_to.length > 0 ? link.evolves_to.map(parseChainLink) : [],
      };
    };

    const tree = parseChainLink(data.chain);
    evolutionUrlCache.set(chainUrl, tree);
    return tree;
  } catch (err) {
    console.warn('[PokeAPI] Evolution chain fetch failed:', err);
    return null;
  }
}

export default {
  GENERATION_TOTALS,
  fetchAllPokemonList,
  fetchPokemon,
  fetchSpeciesLore,
  fetchCompletePokemon,
  fetchEvolutionChain,
  formatDisplayName,
  generateAliases,
  getGenerationFromId,
  getOfficialArtworkUrl,
  getShinyArtworkUrl,
  getCryAudioUrl,
  createPokemonStub,
  generateInitialDexStubs,
};
