import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Pokemon, UnlockedPokemonEntry } from '../types/pokemon';
import {
  resolvePokemonByQuery,
  resolvePokemonByQueryAsync,
  getPokemonById,
  getPokemonByIdAsync,
  getAllKnownPokemon,
} from '../services/pokemonIndex';
import {
  GENERATION_TOTALS,
  fetchAllPokemonList,
  fetchPokemon,
  getGenerationFromId,
} from '../services/pokeapi';
import { useAuth } from './AuthContext';

export interface RegisterResult {
  success: boolean;
  registeredList: Pokemon[];
  alreadyUnlockedCount: number;
  newlyUnlockedCount: number;
  message: string;
}

export interface PokedexStats {
  totalUnlocked: number;
  totalDexCount: number; // 1025 standard
  completionRatePercent: number;
  byGeneration: Record<number, { unlocked: number; total: number }>;
  byType: Record<string, number>;
}

interface PokedexContextType {
  unlockedIds: number[];
  unlockedEntries: UnlockedPokemonEntry[];
  isPokemonUnlocked: (id: number) => boolean;
  registerByQuery: (
    query: string,
    method?: UnlockedPokemonEntry['discoveryMethod']
  ) => Promise<RegisterResult>;
  registerById: (
    id: number,
    method?: UnlockedPokemonEntry['discoveryMethod']
  ) => Promise<RegisterResult>;
  selectedPokemon: Pokemon | null;
  isModalOpen: boolean;
  isNewlyRegistered: boolean;
  openDetailModal: (pokemon: Pokemon, isNewlyRegistered?: boolean) => void;
  closeDetailModal: () => void;
  stats: PokedexStats;
  allPokemon: Pokemon[];
}

const PokedexContext = createContext<PokedexContextType | undefined>(undefined);

export const PokedexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const convexEntries = useQuery(api.pokedex.mine, currentUser ? {} : 'skip');
  const registerEntry = useMutation(api.pokedex.register);
  const ensureStarter = useMutation(api.pokedex.ensureStarter);
  const unlockedEntries = useMemo<UnlockedPokemonEntry[]>(() => (convexEntries ?? []).map((entry) => ({ ...entry, unlockedAt: new Date(entry.unlockedAt).toISOString() })), [convexEntries]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewlyRegistered, setIsNewlyRegistered] = useState(false);
  const [allPokemonList, setAllPokemonList] = useState<Pokemon[]>(() => getAllKnownPokemon());

  useEffect(() => {
    if (currentUser) void ensureStarter();
  }, [currentUser, ensureStarter]);

  const unlockedIds = useMemo(
    () => unlockedEntries.map((e) => e.pokemonId),
    [unlockedEntries]
  );

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds]);

  // Initial load: Fetch the list of all 1,025 Pokémon names from PokeAPI v2
  useEffect(() => {
    fetchAllPokemonList().then(() => {
      setAllPokemonList(getAllKnownPokemon());
    });
  }, []);

  // Hydrate full Pokémon details from PokeAPI v2 for all unlocked Pokémon
  useEffect(() => {
    if (unlockedIds.length > 0) {
      let mounted = true;
      const promises = unlockedIds.map(async (id) => {
        const existing = getPokemonById(id);
        if (!existing || existing.abilities.length === 0) {
          return getPokemonByIdAsync(id);
        }
        return existing;
      });

      Promise.all(promises).then(() => {
        if (mounted) {
          setAllPokemonList(getAllKnownPokemon());
        }
      });

      return () => {
        mounted = false;
      };
    }
  }, [unlockedIds]);

  const isPokemonUnlocked = useCallback(
    (id: number) => unlockedSet.has(id),
    [unlockedSet]
  );

  const openDetailModal = useCallback(async (pokemon: Pokemon, isNew = false) => {
    setSelectedPokemon(pokemon);
    setIsNewlyRegistered(isNew);
    setIsModalOpen(true);

    // Fetch rich species details in background if not already fully fetched
    if (pokemon.abilities.length === 0) {
      const full = await getPokemonByIdAsync(pokemon.id);
      if (full) {
        setSelectedPokemon(full);
        setAllPokemonList(getAllKnownPokemon());
      }
    }
  }, []);

  const closeDetailModal = useCallback(() => {
    setIsModalOpen(false);
    setIsNewlyRegistered(false);
  }, []);

  /**
   * Registers a Pokémon using user search input via PokéAPI v2.
   * Implements Option A multi-matching for variants (e.g. "Nidoran").
   */
  const registerByQuery = useCallback(
    async (
      query: string,
      method: UnlockedPokemonEntry['discoveryMethod'] = 'manual_dex_input'
    ): Promise<RegisterResult> => {
      let matches = await resolvePokemonByQueryAsync(query);

      if (matches.length === 0) {
        return {
          success: false,
          registeredList: [],
          alreadyUnlockedCount: 0,
          newlyUnlockedCount: 0,
          message: `No Pokémon matching "${query}" was found in the National Pokédex.`,
        };
      }

      let newCount = 0;
      let alreadyCount = 0;

      for (const p of matches) {
        const isNew = await registerEntry({ pokemonId: p.id, discoveryMethod: method });
        if (isNew) {
          newCount += 1;
        } else {
          alreadyCount += 1;
        }
      }
      setAllPokemonList(getAllKnownPokemon());

      // Open detail modal for the primary/first match with newly-registered status
      openDetailModal(matches[0], newCount > 0);

      let message = '';
      if (matches.length > 1) {
        message = `Registered all ${matches.length} matching variants for "${matches[0].displayName}"! (${newCount} new, ${alreadyCount} already known)`;
      } else if (newCount > 0) {
        message = `Successfully registered #${matches[0].id} ${matches[0].displayName} to your Pokédex!`;
      } else {
        message = `#${matches[0].id} ${matches[0].displayName} is already registered in your Pokédex.`;
      }

      return {
        success: true,
        registeredList: matches,
        alreadyUnlockedCount: alreadyCount,
        newlyUnlockedCount: newCount,
        message,
      };
    },
    [registerEntry, openDetailModal]
  );

  /**
   * Direct registration by ID (e.g. from Arena mini-games)
   */
  const registerById = useCallback(
    async (
      id: number,
      method: UnlockedPokemonEntry['discoveryMethod'] = 'whos_that_pokemon'
    ): Promise<RegisterResult> => {
      let pokemon = await getPokemonByIdAsync(id);

      if (!pokemon) {
        return {
          success: false,
          registeredList: [],
          alreadyUnlockedCount: 0,
          newlyUnlockedCount: 0,
          message: `Pokémon #${id} not found.`,
        };
      }

      const isNew = await registerEntry({ pokemonId: id, discoveryMethod: method });
      setAllPokemonList(getAllKnownPokemon());

      return {
        success: true,
        registeredList: [pokemon],
        alreadyUnlockedCount: isNew ? 0 : 1,
        newlyUnlockedCount: isNew ? 1 : 0,
        message: isNew
          ? `Discovered and registered #${pokemon.id} ${pokemon.displayName}!`
          : `#${pokemon.id} ${pokemon.displayName} was already in your Pokédex.`,
      };
    },
    [registerEntry, openDetailModal]
  );


  // Calculate comprehensive stats for Dashboard & Pokédex Toolbox
  const stats: PokedexStats = useMemo(() => {
    const totalUnlocked = unlockedEntries.length;
    const totalDexCount = 1025;
    const completionRatePercent = Math.min(
      100,
      parseFloat(((totalUnlocked / totalDexCount) * 100).toFixed(1))
    );

    const byGeneration: Record<number, { unlocked: number; total: number }> = {};
    for (let g = 1; g <= 9; g += 1) {
      const totalInGen = GENERATION_TOTALS[g] || 100;
      let unlockedInGen = 0;
      for (const id of unlockedIds) {
        if (getGenerationFromId(id) === g) {
          unlockedInGen += 1;
        }
      }
      byGeneration[g] = { unlocked: unlockedInGen, total: totalInGen };
    }

    const byType: Record<string, number> = {};
    unlockedEntries.forEach((entry) => {
      const poke = getPokemonById(entry.pokemonId);
      if (poke) {
        poke.types.forEach((t) => {
          byType[t] = (byType[t] || 0) + 1;
        });
      }
    });

    return {
      totalUnlocked,
      totalDexCount,
      completionRatePercent,
      byGeneration,
      byType,
    };
  }, [unlockedEntries, unlockedIds]);

  return (
    <PokedexContext.Provider
      value={{
        unlockedIds,
        unlockedEntries,
        isPokemonUnlocked,
        registerByQuery,
        registerById,
        selectedPokemon,
        isModalOpen,
        isNewlyRegistered,
        openDetailModal,
        closeDetailModal,
        stats,
        allPokemon: allPokemonList,
      }}

    >
      {children}
    </PokedexContext.Provider>
  );
};

export function usePokedex() {
  const context = useContext(PokedexContext);
  if (!context) {
    throw new Error('usePokedex must be used within a PokedexProvider');
  }
  return context;
}

export default PokedexProvider;
