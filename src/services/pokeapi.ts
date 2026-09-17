import { Pokemon, EvolutionNode } from '../types/pokemon';
import { getPokemonById } from './pokemonIndex';

// In-memory cache to avoid repeated network calls
const pokemonDetailCache = new Map<number, Partial<Pokemon>>();
const evolutionCache = new Map<number, EvolutionNode>();

/**
 * Service to fetch detailed supplementary information from PokeAPI.
 * Falls back gracefully to local index data if offline or rate-limited.
 */
export async function fetchPokemonDetail(id: number): Promise<Partial<Pokemon>> {
  if (pokemonDetailCache.has(id)) {
    return pokemonDetailCache.get(id)!;
  }

  const local = getPokemonById(id);

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return local || {};
    }

    const data = await res.json();

    const detail: Partial<Pokemon> = {
      height: data.height,
      weight: data.weight,
      stats: data.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
        name: s.stat.name,
        baseStat: s.base_stat,
      })),
      abilities: data.abilities.map((a: { ability: { name: string }; is_hidden: boolean }) => ({
        name: a.ability.name.replace('-', ' '),
        isHidden: a.is_hidden,
      })),
    };

    pokemonDetailCache.set(id, detail);
    return detail;
  } catch (err) {
    console.warn(`[PokeAPI] Could not fetch remote detail for #${id}, using local data:`, err);
    return local || {};
  }
}

/**
 * Fetches species flavor text and evolution chain for deep inspection tabs.
 */
export async function fetchSpeciesLore(id: number): Promise<{
  flavorText?: string;
  genus?: string;
  evolutionChainUrl?: string;
}> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
    if (!res.ok) return {};
    const data = await res.json();

    const englishEntry = data.flavor_text_entries?.find(
      (entry: { language: { name: string } }) => entry.language.name === 'en'
    );

    const englishGenus = data.genera?.find(
      (g: { language: { name: string } }) => g.language.name === 'en'
    );

    return {
      flavorText: englishEntry?.flavor_text?.replace(/[\f\n\r]/g, ' '),
      genus: englishGenus?.genus,
      evolutionChainUrl: data.evolution_chain?.url,
    };
  } catch (err) {
    console.warn(`[PokeAPI] Species lore fetch failed for #${id}:`, err);
    return {};
  }
}

/**
 * Fetches species evolution chain and recursively builds the EvolutionNode tree.
 */
const evolutionUrlCache = new Map<string, EvolutionNode>();

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
        item: detail?.item?.name?.replace('-', ' ') || undefined,
        trigger: detail?.trigger?.name?.replace('-', ' ') || undefined,
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
  fetchPokemonDetail,
  fetchSpeciesLore,
  fetchEvolutionChain,
};
