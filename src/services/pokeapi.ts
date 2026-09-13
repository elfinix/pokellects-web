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

export default {
  fetchPokemonDetail,
  fetchSpeciesLore,
};
