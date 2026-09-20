import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  AudioWaveform,
  Shield,
  Zap,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  HelpCircle,
  Lock,
  Info,
  Ruler,
  Weight,
  Scale,
  BookOpen,
  Quote,
  Eye,
  BarChart3,
  Rows3,
  Hexagon,
  Palette,
  Play,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { Pokemon, PokemonType, EvolutionNode } from '../../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../../styles/theme';
import { useHotkeys } from '../../../hooks/useHotkeys';
import { fetchSpeciesLore, fetchEvolutionChain, getFrontDefaultSpriteUrl } from '../../../services/pokeapi';
import { getPokemonById } from '../../../services/pokemonIndex';
import storageService from '../../../services/storageService';
import { globalStopScroll, globalStartScroll } from '../../../context/SmoothScrollContext';
import PokeballChalkMark from '../../../components/common/PokeballChalkMark';
import ChalkRegisteredStamp from '../../../components/common/ChalkRegisteredStamp';
import { useTheme } from '../../../context/ThemeContext';


export interface PokemonDetailModalProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
  registeredPokemonList?: Pokemon[];
  unlockedIds?: number[];
  onNavigatePokemon?: (pokemon: Pokemon) => void;
  isNewlyRegistered?: boolean;
  isRegistered?: boolean;
  showNavigation?: boolean;
}


type ModalTab = 'overview' | 'stats' | 'matchups' | 'evolution';

// Frequency wave heights for stylized audio spectrum visualizer (28 bars)
const AUDIO_SPECTRUM_HEIGHTS = [
  24, 38, 55, 78, 48, 92, 70, 44, 82, 98, 72, 94, 80, 56,
  88, 96, 68, 46, 76, 92, 64, 42, 84, 96, 72, 50, 36, 24
];

// Regional origin mapping by Generation
const REGION_BY_GEN: Record<number, string> = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Paldea',
};

// Type chart multiplier dictionary for 18 types
const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
};

interface StatMeta {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
}

const STAT_CONFIG: Record<string, StatMeta> = {
  hp: { key: 'hp', label: 'HP', shortLabel: 'HP', color: '#10b981' },
  attack: { key: 'attack', label: 'Attack', shortLabel: 'ATK', color: '#f97316' },
  defense: { key: 'defense', label: 'Defense', shortLabel: 'DEF', color: '#eab308' },
  'special-attack': { key: 'special-attack', label: 'Sp. Atk', shortLabel: 'SPA', color: '#06b6d4' },
  'special-defense': { key: 'special-defense', label: 'Sp. Def', shortLabel: 'SPD', color: '#6366f1' },
  speed: { key: 'speed', label: 'Speed', shortLabel: 'SPE', color: '#ec4899' },
};

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const RADAR_STAT_ORDER = ['hp', 'attack', 'defense', 'speed', 'special-defense', 'special-attack'];

const getConditionalColor = (val: number): string => {
  if (val >= 100) return '#10b981'; // Green (exceptional)
  if (val >= 70) return '#3b82f6';  // Blue (good)
  if (val >= 50) return '#f59e0b';  // Amber/Orange (average)
  return '#ef4444';                 // Red (low)
};

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({
  pokemon,
  isOpen,
  onClose,
  registeredPokemonList = [],
  unlockedIds = [],
  onNavigatePokemon,
  isNewlyRegistered = false,
  isRegistered,
  showNavigation = true,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const [cryProgress, setCryProgress] = useState(0);
  const [statViewMode, setStatViewMode] = useState<'line' | 'bar' | 'radar'>('line');
  const [statColorMode, setStatColorMode] = useState<'assorted' | 'conditional'>('assorted');

  // Compute whether this Pokémon is registered in the player's Pokédex
  const isEffectivelyRegistered =
    isRegistered !== undefined
      ? isRegistered
      : pokemon
      ? unlockedIds.length === 0 || unlockedIds.includes(pokemon.id)
      : true;

  // Evolution chain data state
  const [evolutionTree, setEvolutionTree] = useState<EvolutionNode | null>(null);
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Celebrate newly registered Pokémon with particle burst (only in main Pokédex flow, not from minigames where confetti already fired on win)
  useEffect(() => {
    if (isOpen && isNewlyRegistered && showNavigation && typeof window !== 'undefined') {
      try {
        const flags = storageService.getFeatureFlags();
        if (flags.enableConfetti) {
          confetti({
            particleCount: 75,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#ef4444', '#ffffff', '#eab308', '#10b981', '#3b82f6'],
          });
        }
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, isNewlyRegistered, showNavigation, pokemon?.id]);

  // Reset modal state to defaults on exit
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setStatViewMode('line');
      setStatColorMode('assorted');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsPlayingCry(false);
      setCryProgress(0);
    }
  }, [isOpen]);

  // Reset audio when pokemon changes
  useEffect(() => {
    if (audioRef.current) {

      audioRef.current.pause();
      audioRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlayingCry(false);
    setCryProgress(0);
  }, [pokemon?.id]);

  // Cleanup audio when unmounting
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, []);

  // Load evolution tree whenever pokemon changes
  useEffect(() => {
    if (!pokemon) return;

    let isMounted = true;
    setIsLoadingEvolution(true);

    fetchSpeciesLore(pokemon.id)
      .then((lore) => {
        if (!isMounted) return;
        if (lore.evolutionChainUrl) {
          fetchEvolutionChain(lore.evolutionChainUrl).then((chain) => {
            if (isMounted) {
              setEvolutionTree(chain);
              setIsLoadingEvolution(false);
            }
          });
        } else {
          setEvolutionTree(null);
          setIsLoadingEvolution(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEvolutionTree(null);
          setIsLoadingEvolution(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pokemon?.id]);

  // Previous & Next registered Pokémon calculations
  const { prevPokemon, nextPokemon } = useMemo(() => {
    if (!pokemon || registeredPokemonList.length === 0) {
      return { prevPokemon: null, nextPokemon: null };
    }
    const currIdx = registeredPokemonList.findIndex((p) => p.id === pokemon.id);
    if (currIdx === -1) {
      return { prevPokemon: null, nextPokemon: null };
    }
    return {
      prevPokemon: currIdx > 0 ? registeredPokemonList[currIdx - 1] : null,
      nextPokemon:
        currIdx < registeredPokemonList.length - 1 ? registeredPokemonList[currIdx + 1] : null,
    };
  }, [pokemon, registeredPokemonList]);

  useHotkeys('Escape', () => {
    if (isOpen) onClose();
  });

  // Lock document body scroll and pause Lenis smooth scroll when modal is open
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      globalStopScroll();
      return () => {
        document.body.style.overflow = originalOverflow;
        globalStartScroll();
      };
    }
  }, [isOpen]);

  if (!pokemon) return null;

  const primaryType = pokemon.types[0];
  const secondaryType = pokemon.types[1];
  const theme = POKEMON_TYPE_THEMES[primaryType];
  const secondaryTheme = secondaryType ? POKEMON_TYPE_THEMES[secondaryType] : null;
  const activeTabBgColor = `color-mix(in srgb, ${theme.accentHex} 55%, #020617 45%)`;

  const orderedStats = STAT_ORDER.map((key) => {
    const found = pokemon.stats.find((s) => s.name === key);
    const meta = STAT_CONFIG[key] || { key, label: key, shortLabel: key.toUpperCase().slice(0, 3), color: '#64748b' };
    return {
      ...meta,
      value: found ? found.baseStat : 0,
    };
  });

  const radarStats = RADAR_STAT_ORDER.map((key) => {
    const found = pokemon.stats.find((s) => s.name === key);
    const meta = STAT_CONFIG[key] || { key, label: key, shortLabel: key.toUpperCase().slice(0, 3), color: '#64748b' };
    return {
      ...meta,
      value: found ? found.baseStat : 0,
    };
  });

  const highestStat = orderedStats.reduce((max, s) => (s.value > max.value ? s : max), orderedStats[0]);
  const lowestStat = orderedStats.reduce((min, s) => (s.value < min.value ? s : min), orderedStats[0]);
  const physTotal =
    (pokemon.stats.find((s) => s.name === 'attack')?.baseStat || 0) +
    (pokemon.stats.find((s) => s.name === 'defense')?.baseStat || 0);
  const specTotal =
    (pokemon.stats.find((s) => s.name === 'special-attack')?.baseStat || 0) +
    (pokemon.stats.find((s) => s.name === 'special-defense')?.baseStat || 0);

  // Defensive Multipliers calculation
  const allTypes: PokemonType[] = Object.keys(TYPE_CHART) as PokemonType[];
  const defensiveMultipliers: Record<PokemonType, number> = {} as any;

  allTypes.forEach((attackingType) => {
    let multiplier = 1;
    pokemon.types.forEach((defendingType) => {
      const effect = TYPE_CHART[attackingType]?.[defendingType];
      if (effect !== undefined) {
        multiplier *= effect;
      }
    });
    defensiveMultipliers[attackingType] = multiplier;
  });

  // Categorized defensive groupings
  const quadWeaknesses = allTypes.filter((t) => defensiveMultipliers[t] >= 4);
  const doubleWeaknesses = allTypes.filter((t) => defensiveMultipliers[t] === 2);
  const halfResistances = allTypes.filter((t) => defensiveMultipliers[t] === 0.5);
  const quadResistances = allTypes.filter((t) => defensiveMultipliers[t] <= 0.25 && defensiveMultipliers[t] > 0);
  const immunities = allTypes.filter((t) => defensiveMultipliers[t] === 0);

  const regularDamageTypes = allTypes.filter((t) => defensiveMultipliers[t] === 1);

  const getEvolutionStage = (tree: EvolutionNode | null, currentId: number): string => {
    if (!tree) return 'Standalone Taxonomy';
    if (!tree.evolvesTo || tree.evolvesTo.length === 0) return 'Standalone Species (No Evolutions)';
    if (tree.id === currentId) {
      return 'Base Form (First Stage)';
    }
    for (const child of tree.evolvesTo) {
      if (child.id === currentId) {
        return child.evolvesTo && child.evolvesTo.length > 0 ? 'Stage 1 Evolution' : 'Final Evolution Stage';
      }
      if (child.evolvesTo) {
        for (const grandchild of child.evolvesTo) {
          if (grandchild.id === currentId) {
            return 'Stage 2 (Final)';
          }
        }
      }
    }
    return 'Evolutionary Lineage';
  };

  const totalBaseStats = pokemon.stats.reduce((sum, s) => sum + s.baseStat, 0);

  const toggleCry = () => {
    if (!pokemon.cryUrl) return;

    if (isPlayingCry && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsPlayingCry(false);
      setCryProgress(0);
      return;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const audio = new Audio(pokemon.cryUrl);
    audio.volume = 0.20;
    audioRef.current = audio;
    setIsPlayingCry(true);
    setCryProgress(0);

    const trackProgress = () => {
      if (!audioRef.current || audioRef.current.paused || audioRef.current.ended) {
        return;
      }
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        setCryProgress(Math.min(1, Math.max(0, cur / dur)));
      }
      animFrameRef.current = requestAnimationFrame(trackProgress);
    };

    audio.onplay = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(trackProgress);
    };

    audio.ontimeupdate = () => {
      const cur = audio.currentTime;
      const dur = audio.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        setCryProgress(Math.min(1, Math.max(0, cur / dur)));
      }
    };

    audio.onended = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsPlayingCry(false);
      setCryProgress(0);
      audioRef.current = null;
    };

    audio.onerror = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsPlayingCry(false);
      setCryProgress(0);
      audioRef.current = null;
    };

    audio.play().then(() => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(trackProgress);
    }).catch(() => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsPlayingCry(false);
      setCryProgress(0);
      audioRef.current = null;
    });
  };

  const TAB_ITEMS: { id: ModalTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'stats', label: 'Base Stats', icon: Activity },
    { id: 'matchups', label: 'Type Matchups', icon: Shield },
    { id: 'evolution', label: 'Evolution', icon: GitBranch },
  ];

  // Physical parameters formatting (Metric + Imperial)
  const heightM = pokemon.height ? pokemon.height / 10 : null;
  const heightImperial = heightM
    ? (() => {
        const totalInches = heightM * 39.3701;
        const ft = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${ft}'${String(inches).padStart(2, '0')}"`;
      })()
    : null;

  const weightKg = pokemon.weight ? pokemon.weight / 10 : null;
  const weightImperial = weightKg ? `${(weightKg * 2.20462).toFixed(1)} lbs` : null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pokemon-detail-backdrop"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/60 backdrop-blur-xs"
          data-lenis-prevent
          onClick={onClose}
        >
          <motion.div
            key="pokemon-detail-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
            data-lenis-prevent
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl sm:max-w-3xl w-full p-4 pt-6 sm:p-7 sm:pt-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between h-[min(680px,calc(100dvh-1rem))] sm:h-[610px] max-h-[calc(100dvh-1rem)] sm:max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Type Accent Border (Supporting mono- or dual-type palette) */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
              style={{
                background: secondaryTheme
                  ? `linear-gradient(to right, ${theme.accentHex}, ${secondaryTheme.accentHex})`
                  : `linear-gradient(to right, ${theme.accentHex}, ${theme.accentHex}88)`,
              }}
            />

            {/* Ambient Top-Right Radial Glow Gradient on main card */}
            <div
              className="absolute -top-28 -right-28 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
              style={{
                background: secondaryTheme
                  ? `radial-gradient(circle, ${secondaryTheme.accentHex} 0%, ${theme.accentHex} 60%, transparent 80%)`
                  : `radial-gradient(circle, ${theme.accentHex} 0%, transparent 75%)`,
              }}
            />

            {/* Modal Header */}
            <div className="flex items-start justify-between relative z-10 pt-1 sm:pt-0 pb-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                    #{String(pokemon.id).padStart(4, '0')}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    Gen {pokemon.generation}
                  </span>
                  {pokemon.isLegendary && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                      Legendary
                    </span>
                  )}
                  {pokemon.isMythical && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
                      Mythical
                    </span>
                  )}

                  {!isEffectivelyRegistered && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold">
                      <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>UNDISCOVERED</span>
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
                  {pokemon.displayName}
                </h2>

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{pokemon.genus}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Official Red Chalk Speed Pokéball Mark in Header */}
                {isNewlyRegistered ? (
                  <PokeballChalkMark
                    status="newly-registered"
                    size="sm"
                    animateStamp={true}
                    className="shrink-0"
                  />
                ) : isEffectivelyRegistered ? (
                  <PokeballChalkMark
                    status="registered"
                    size="xs"
                    className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                  />
                ) : null}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Close (Esc)"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>


            {/* Minimalist Tabs Navigation with Animated Sliding Tab Indicator */}
            <div className="relative z-10 pt-3 pb-1">
              <div className="grid grid-cols-2 sm:flex sm:w-full items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                {TAB_ITEMS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative w-full sm:flex-1 py-2 px-2 sm:px-3 rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none font-semibold ${
                        isActive
                          ? 'text-white font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeModalTabIndicator"
                          className="absolute inset-0 rounded-xl shadow-xs"
                          style={{ backgroundColor: activeTabBgColor }}
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.28 }}
                        />
                      )}
                      <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content Body with Consistent Fixed Height */}
            <div className="relative z-10 flex-1 overflow-y-auto py-2 sm:py-2.5 min-h-0 pr-1">
              <AnimatePresence mode="wait">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row items-center sm:items-stretch gap-5 sm:gap-6 py-1 h-full"
                  >
              {/* LEFT COLUMN: Sprite on geometric shape platform + Height & Weight below */}
              <div className="flex flex-col items-center justify-between gap-3 w-full sm:w-56 shrink-0">
                {/* Geometric 360° Rotating Platform Pedestal with Pokémon Sprite (Unobstructed) */}
                <div className="relative w-48 sm:w-56 h-48 sm:h-52 flex items-center justify-center shrink-0 group">


                  {/* 3D Tilted Rotating Platform System */}
                  <div
                    className="absolute bottom-1 w-44 sm:w-52 h-20 flex items-center justify-center pointer-events-none select-none"
                    style={{ perspective: '400px' }}
                  >
                    {/* Base Shadow & Pedestal */}
                    <div
                      className="w-40 sm:w-48 h-40 sm:h-48 rounded-full flex items-center justify-center relative"
                      style={{
                        transform: 'rotateX(68deg)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Outer base shadow */}
                      <div className="absolute inset-0 rounded-full bg-slate-900/10 dark:bg-black/30 blur-sm transform translate-z-[-8px]" />

                      {/* Outermost Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-slate-200/90 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 shadow-xs" />

                      {/* Primary 360° Rotating Tech Ring */}
                      <div
                        className="absolute inset-1.5 rounded-full border border-dashed flex items-center justify-center animate-[spin_18s_linear_infinite]"
                        style={{ borderColor: `${theme.accentHex}88` }}
                      >
                        {/* Orbital Marker Dots */}
                        <div
                          className="absolute -top-1 w-2.5 h-2.5 rounded-full shadow-xs"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                        <div
                          className="absolute -bottom-1 w-2.5 h-2.5 rounded-full shadow-xs"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                        <div
                          className="absolute -left-1 w-2.5 h-2.5 rounded-full shadow-xs opacity-60"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                        <div
                          className="absolute -right-1 w-2.5 h-2.5 rounded-full shadow-xs opacity-60"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                      </div>

                      {/* Counter-Rotating Segmented Inner Ring */}
                      <div
                        className="absolute inset-5 rounded-full border border-dotted border-slate-300/80 dark:border-slate-600/80 flex items-center justify-center animate-[spin_14s_linear_infinite_reverse]"
                      >
                        <div
                          className="w-full h-full rounded-full opacity-25"
                          style={{
                            background: `conic-gradient(from 0deg, ${theme.accentHex} 0deg, transparent 90deg, ${theme.accentHex} 180deg, transparent 270deg, ${theme.accentHex} 360deg)`,
                          }}
                        />
                      </div>

                      {/* Center Core Platform */}
                      <div className="absolute inset-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center">
                        <div
                          className="w-7 h-7 rounded-full opacity-40 shadow-inner"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pokémon Sprite (Gently floats above the rotating platform) */}
                  <motion.img
                    src={pokemon.spriteUrl}
                    alt={pokemon.displayName}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-38 h-38 sm:w-44 sm:h-44 object-contain drop-shadow-md select-none relative z-10 transition-transform duration-200 group-hover:scale-105 mb-2.5"
                  />
                </div>


                {/* Height & Weight below sprite */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      <Ruler className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      <span>Height</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 leading-tight">
                      {heightM !== null ? `${heightM.toFixed(1)} m` : '—'}
                    </span>
                    {heightImperial && (
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                        {heightImperial}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      <Weight className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      <span>Weight</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 leading-tight">
                      {weightKg !== null ? `${weightKg.toFixed(1)} kg` : '—'}
                    </span>
                    {weightImperial && (
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                        {weightImperial}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: [ type & abilities group ], [ flexible dex entry ], [ pure audio spectrum player ] */}
              <div className="flex-1 w-full flex flex-col justify-between gap-3 text-left h-full">
                {/* Top Group: Type & Abilities with natural compact spacing */}
                <div className="space-y-2.5 shrink-0">
                  {/* [ type cards ] */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">
                      Type
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pokemon.types.map((t) => {
                        const typeTheme = POKEMON_TYPE_THEMES[t];
                        return (
                          <div
                            key={t}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-xs transition-all duration-150 hover:scale-105 select-none border border-white/20"
                            style={{
                              background: `linear-gradient(135deg, ${typeTheme.accentHex} 0%, color-mix(in srgb, ${typeTheme.accentHex} 70%, #000 30%) 100%)`,
                              boxShadow: `0 3px 10px ${typeTheme.accentHex}35`,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />
                            <span>{typeTheme.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* [ ability cards ] */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">
                      Abilities
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {pokemon.abilities && pokemon.abilities.length > 0 ? (
                        pokemon.abilities.map((ability) => {
                          const formattedName = ability.name.replace(/-/g, ' ');
                          return (
                            <div
                              key={ability.name}
                              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all text-xs font-bold ${
                                ability.isHidden
                                  ? 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-2xs'
                                  : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              {ability.isHidden ? (
                                <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              ) : (
                                <div
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: theme.accentHex }}
                                />
                              )}
                              <span className="capitalize">{formattedName}</span>
                              <span
                                className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md font-semibold border ${
                                  ability.isHidden
                                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700'
                                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-600/60'
                                }`}
                              >
                                {ability.isHidden ? 'Hidden' : 'Standard'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">No listed abilities</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* [ dex entry ] (clean without verbose headers, expands to fit nicely) */}
                <div
                  className="flex-1 min-h-[72px] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs relative overflow-hidden flex items-center bg-slate-50/70 dark:bg-slate-950/60"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, color-mix(in srgb, ${theme.accentHex} 12%, #090d16) 0%, #0b1120 100%)`
                      : `linear-gradient(135deg, color-mix(in srgb, ${theme.accentHex} 6%, #ffffff) 0%, #f8fafc 100%)`,
                  }}
                >
                  <Quote className="w-12 h-12 text-slate-300/30 dark:text-slate-700/30 absolute -right-1 -bottom-1 pointer-events-none rotate-12" />
                  <div
                    className="relative pl-3 border-l-3 py-0.5 z-10 w-full"
                    style={{ borderColor: theme.accentHex }}
                  >
                    <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                      "{pokemon.flavorText || 'No official Pokédex description entry recorded for this species.'}"
                    </p>
                  </div>
                </div>

                {/* [ pure interactive audio cry spectrum toggle rectangle with left-to-right fill progress ] */}
                <button
                  type="button"
                  onClick={toggleCry}
                  disabled={!pokemon.cryUrl}
                  className={`w-full h-13 sm:h-14 py-3 px-4 sm:px-6 rounded-2xl border transition-all duration-200 flex items-center justify-center shadow-2xs group shrink-0 ${
                    pokemon.cryUrl
                      ? isPlayingCry
                        ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 ring-2 ring-offset-1 dark:ring-offset-slate-900 cursor-pointer active:scale-[0.99]'
                        : 'bg-slate-50/90 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer active:scale-[0.99]'
                      : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/50 opacity-50 cursor-not-allowed'
                  }`}
                  style={
                    isPlayingCry && pokemon.cryUrl
                      ? {
                          borderColor: theme.accentHex,
                          boxShadow: `0 3px 12px ${theme.accentHex}25`,
                        }
                      : undefined
                  }
                  title={
                    pokemon.cryUrl
                      ? isPlayingCry
                        ? `Pause ${pokemon.displayName} audio cry`
                        : `Play ${pokemon.displayName} audio cry`
                      : 'Audio cry unavailable'
                  }
                  aria-label={`Toggle audio cry for ${pokemon.displayName}`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-7 sm:h-8 w-full max-w-sm px-1">
                    {AUDIO_SPECTRUM_HEIGHTS.map((h, idx) => {
                      const barFraction = idx / (AUDIO_SPECTRUM_HEIGHTS.length - 1);
                      const isFilled = isPlayingCry && barFraction <= cryProgress;

                      return (
                        <div
                          key={idx}
                          className="w-[3px] sm:w-[3.5px] rounded-full transition-colors duration-75"
                          style={{
                            height: `${h}%`,
                            backgroundColor: isFilled ? activeTabBgColor : (isDark ? '#334155' : '#cbd5e1'),
                          }}
                        />
                      );
                    })}
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BASE STATS (Line, Bar, Radar View Modes + Simplified BST Below) */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="space-y-3 sm:space-y-2.5 pt-0.5 h-full flex flex-col justify-between"
            >
              {/* Chart Body with Left-Stacked Vertical Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 sm:gap-3.5">
                {/* Vertically Stacked Controls on the Left */}
                <div className="grid grid-cols-4 sm:flex sm:flex-col items-center sm:justify-start gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shrink-0">
                  {/* Line View Mode Icon */}
                  <button
                    type="button"
                    onClick={() => setStatViewMode('line')}
                    style={statViewMode === 'line' ? { backgroundColor: activeTabBgColor, color: '#ffffff' } : undefined}
                    className={`w-full sm:w-auto p-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      statViewMode === 'line'
                        ? 'shadow-xs text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                    }`}
                    title="Line / Progress Bar View"
                    aria-label="Line View"
                  >
                    <Rows3 className="w-4 h-4" />
                  </button>

                  {/* Bar View Mode Icon */}
                  <button
                    type="button"
                    onClick={() => setStatViewMode('bar')}
                    style={statViewMode === 'bar' ? { backgroundColor: activeTabBgColor, color: '#ffffff' } : undefined}
                    className={`w-full sm:w-auto p-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      statViewMode === 'bar'
                        ? 'shadow-xs text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                    }`}
                    title="Vertical Column Chart View"
                    aria-label="Bar View"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  {/* Radar View Mode Icon */}
                  <button
                    type="button"
                    onClick={() => setStatViewMode('radar')}
                    style={statViewMode === 'radar' ? { backgroundColor: activeTabBgColor, color: '#ffffff' } : undefined}
                    className={`w-full sm:w-auto p-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      statViewMode === 'radar'
                        ? 'shadow-xs text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                    }`}
                    title="Radar / Spider Chart View"
                    aria-label="Radar View"
                  >
                    <Hexagon className="w-4 h-4" />
                  </button>

                  {/* Divider */}
                  <div className="hidden sm:block h-px w-full bg-slate-200/80 dark:bg-slate-800 my-0.5" />

                  {/* Color Toggle: Assorted vs Conditional */}
                  <button
                    type="button"
                    onClick={() => setStatColorMode((prev) => (prev === 'assorted' ? 'conditional' : 'assorted'))}
                    className={`w-full sm:w-auto p-2 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      statColorMode === 'conditional'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                    }`}
                    title={`Toggle Palette: Currently ${statColorMode === 'assorted' ? 'Assorted (Per Stat)' : 'Conditional (By Value)'}`}
                    aria-label={`Color Mode: ${statColorMode}`}
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Chart Area on Right with Mode-Switch Crossfade & Transitions */}
                <div className="flex-1 min-w-0 w-full">
                  <AnimatePresence mode="wait">
                    {/* MODE 1: LINE (Default) - Animated from Left to Right */}
                    {statViewMode === 'line' && (
                      <motion.div
                        key="stat-mode-line"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="h-64 sm:h-[268px] w-full px-3 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                      >
                        {orderedStats.map((stat, idx) => {
                          const percent = Math.min(100, Math.round((stat.value / 255) * 100));
                          const statColor = statColorMode === 'conditional' ? getConditionalColor(stat.value) : stat.color;
                          return (
                            <div key={stat.key} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs leading-none">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-8 text-center py-0.5 rounded font-mono font-bold text-[9px] text-white shadow-2xs"
                                    style={{ backgroundColor: statColor }}
                                  >
                                    {stat.shortLabel}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px] sm:text-xs">{stat.label}</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs">
                                  <motion.span
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.35, delay: idx * 0.04 + 0.1 }}
                                    className="font-black text-slate-900 dark:text-slate-100"
                                  >
                                    {stat.value}
                                  </motion.span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">/ 255</span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full overflow-hidden p-px border border-slate-200/40 dark:border-slate-700/40">
                                <motion.div
                                  key={`stat-line-${stat.key}-${statColorMode}`}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.55, delay: idx * 0.05 + 0.05, ease: [0.16, 1, 0.3, 1] }}
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percent}%`,
                                    transformOrigin: 'left',
                                    backgroundColor: statColor,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* MODE 2: BAR (Vertical Columns) - Animated from Bottom to Up */}
                    {statViewMode === 'bar' && (
                      <motion.div
                        key="stat-mode-bar"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="relative h-64 sm:h-[268px] w-full flex items-end justify-between gap-2 sm:gap-4 px-3 sm:px-6 pt-5 pb-3 bg-slate-50/70 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800"
                      >
                        {/* Background horizontal guide lines */}
                        <div className="absolute inset-x-3 sm:inset-x-6 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-35">
                          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                        </div>

                        {orderedStats.map((stat, idx) => {
                          const heightPercent = Math.min(100, Math.max(10, Math.round((stat.value / 220) * 100)));
                          const statColor = statColorMode === 'conditional' ? getConditionalColor(stat.value) : stat.color;
                          return (
                            <div key={stat.key} className="flex-1 flex flex-col items-center h-full justify-end z-10">
                              <motion.span
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: idx * 0.05 + 0.15 }}
                                className="font-mono text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 mb-1"
                              >
                                {stat.value}
                              </motion.span>
                              <div className="w-full max-w-[28px] sm:max-w-[36px] bg-slate-200/70 dark:bg-slate-800/80 rounded-t-lg overflow-hidden flex items-end h-[70%]">
                                <motion.div
                                  key={`stat-bar-${stat.key}-${statColorMode}`}
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{ duration: 0.55, delay: idx * 0.05 + 0.05, ease: [0.16, 1, 0.3, 1] }}
                                  className="w-full rounded-t-lg shadow-xs"
                                  style={{
                                    height: `${heightPercent}%`,
                                    transformOrigin: 'bottom',
                                    backgroundColor: statColor,
                                  }}
                                />
                              </div>
                              <span
                                className="mt-1.5 text-[10px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-2xs"
                                style={{ backgroundColor: statColor }}
                              >
                                {stat.shortLabel}
                              </span>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* MODE 3: RADAR (Expanded, High-Contrast 6-Axis Spider Chart) - Radial Centering Out */}
                    {statViewMode === 'radar' && (
                      <motion.div
                        key="stat-mode-radar"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center justify-between p-2 sm:px-3 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full h-64 sm:h-[268px] relative overflow-hidden"
                      >
                        {/* Left Flank: Best Stat & Physical Total */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="hidden sm:flex flex-col gap-2 shrink-0 z-10 w-24 sm:w-28 text-left"
                        >
                          <div className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block truncate">
                              Top Stat
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span
                                className="px-1 py-0.2 rounded text-[9px] font-black text-white"
                                style={{ backgroundColor: highestStat.color }}
                              >
                                {highestStat.shortLabel}
                              </span>
                              <span className="font-black text-slate-900 dark:text-slate-100 text-xs">{highestStat.value}</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block truncate">
                              Physical
                            </span>
                            <div className="flex items-baseline gap-1 font-mono">
                              <span className="font-black text-slate-900 dark:text-slate-100 text-xs">{physTotal}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">ATK+DEF</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Center: Scaled Radar SVG with Radial Expand Animation */}
                        <div className="flex-1 flex items-center justify-center h-full min-w-0">
                          <svg
                            viewBox="0 0 340 268"
                            className="w-full h-full max-w-[340px] select-none"
                          >
                            {/* Master Radar Group: Pure Centering Out Animation from Center (170, 134) */}
                            <motion.g
                              key={`radar-art-${pokemon.id}-${statColorMode}-${isDark ? 'dark' : 'light'}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              style={{ transformOrigin: '170px 134px', transformBox: 'view-box' }}
                            >
                              {/* Concentric Reference Hexagons with Alternating Shading */}
                              <g>
                                {[0.33, 0.66, 1.0].map((frac, idx) => {
                                  const pts = Array.from({ length: 6 }, (_, j) => {
                                    const a = -Math.PI / 2 + (j * Math.PI) / 3;
                                    return `${170 + 96 * frac * Math.cos(a)},${134 + 96 * frac * Math.sin(a)}`;
                                  }).join(' ');
                                  return (
                                    <polygon
                                      key={frac}
                                      points={pts}
                                      fill={
                                        idx % 2 === 0
                                          ? isDark
                                            ? 'rgba(30, 41, 59, 0.6)'
                                            : 'rgba(241, 245, 249, 0.7)'
                                          : isDark
                                          ? 'rgba(15, 23, 42, 0.7)'
                                          : 'rgba(255, 255, 255, 0.8)'
                                      }
                                      stroke={isDark ? '#475569' : '#cbd5e1'}
                                      strokeWidth={frac === 1 ? '1.5' : '1'}
                                      strokeDasharray={frac === 1 ? undefined : '3 3'}
                                    />
                                  );
                                })}

                                {/* 6 Radial Spokes */}
                                {Array.from({ length: 6 }, (_, j) => {
                                  const a = -Math.PI / 2 + (j * Math.PI) / 3;
                                  return (
                                    <line
                                      key={j}
                                      x1={170}
                                      y1={134}
                                      x2={170 + 96 * Math.cos(a)}
                                      y2={134 + 96 * Math.sin(a)}
                                      stroke={isDark ? '#334155' : '#e2e8f0'}
                                      strokeWidth="1"
                                    />
                                  );
                                })}
                              </g>

                              {/* Filled Radar Polygon (Radial Expand from Center Origin) */}
                              <motion.polygon
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.55, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                  transformOrigin: '170px 134px',
                                  transformBox: 'view-box',
                                  fill: statColorMode === 'conditional'
                                    ? 'color-mix(in srgb, #3b82f6 30%, transparent)'
                                    : `color-mix(in srgb, ${theme.accentHex} 32%, transparent)`,
                                  stroke: statColorMode === 'conditional' ? '#3b82f6' : theme.accentHex,
                                  strokeWidth: 2.5,
                                }}
                                points={radarStats
                                  .map((stat, i) => {
                                    const a = -Math.PI / 2 + (i * Math.PI) / 3;
                                    const r = Math.max(20, Math.min(96, (stat.value / 125) * 96));
                                    return `${170 + r * Math.cos(a)},${134 + r * Math.sin(a)}`;
                                  })
                                  .join(' ')}
                              />

                              {/* Center Pivot Dot */}
                              <circle cx={170} cy={134} r={2.5} fill={isDark ? '#475569' : '#cbd5e1'} />

                              {/* Vertices & Stat Value Badge Pills */}
                              {radarStats.map((stat, i) => {
                                const a = -Math.PI / 2 + (i * Math.PI) / 3;
                                const r = Math.max(20, Math.min(96, (stat.value / 125) * 96));
                                const px = 170 + r * Math.cos(a);
                                const py = 134 + r * Math.sin(a);

                                const labelR = 118;
                                const lx = 170 + labelR * Math.cos(a);
                                const ly = 134 + labelR * Math.sin(a);
                                const statColor = statColorMode === 'conditional' ? getConditionalColor(stat.value) : stat.color;

                                return (
                                  <motion.g
                                    key={stat.key}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.08 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ transformOrigin: `${lx}px ${ly}px`, transformBox: 'view-box' }}
                                  >
                                    {/* Data Point Vertex Dot */}
                                    <circle
                                      cx={px}
                                      cy={py}
                                      r={4}
                                      fill={statColor}
                                      stroke={isDark ? '#0f172a' : '#ffffff'}
                                      strokeWidth={1.5}
                                    />

                                    {/* Stat Value Badge Pill */}
                                    <rect
                                      x={lx - 24}
                                      y={ly - 10}
                                      width={48}
                                      height={20}
                                      rx={6}
                                      fill={isDark ? '#1e293b' : '#ffffff'}
                                      stroke={isDark ? '#334155' : '#e2e8f0'}
                                      strokeWidth={1}
                                    />
                                    <text
                                      x={lx}
                                      y={ly}
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      className="text-[10px] font-mono font-bold select-none"
                                    >
                                      <tspan fill={statColor} fontWeight="800">
                                        {stat.shortLabel}
                                      </tspan>{' '}
                                      <tspan fill={isDark ? '#f8fafc' : '#0f172a'} fontWeight="900">
                                        {stat.value}
                                      </tspan>
                                    </text>
                                  </motion.g>
                                );
                              })}
                            </motion.g>
                          </svg>
                        </div>

                        {/* Right Flank: Lowest Stat & Special Total */}
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="hidden sm:flex flex-col gap-2 shrink-0 z-10 w-24 sm:w-28 text-right"
                        >
                          <div className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block truncate">
                              Lowest Stat
                            </span>
                            <div className="flex items-center justify-end gap-1.5 font-mono">
                              <span className="font-black text-slate-900 dark:text-slate-100 text-xs">{lowestStat.value}</span>
                              <span
                                className="px-1 py-0.2 rounded text-[9px] font-black text-white"
                                style={{ backgroundColor: lowestStat.color }}
                              >
                                {lowestStat.shortLabel}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block truncate">
                              Special
                            </span>
                            <div className="flex items-baseline justify-end gap-1 font-mono">
                              <span className="font-black text-slate-900 dark:text-slate-100 text-xs">{specTotal}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">SPA+SPD</span>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Card: Clean, Simple Base Stat Total (BST) */}
              <div className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" style={{ color: theme.accentHex }} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Stat Total</span>
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {totalBaseStats}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                  <span>Average:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{(totalBaseStats / 6).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">/ stat</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: TYPE MATCHUPS (Full-Height Tactical Battle Matrix) */}
          {activeTab === 'matchups' && (
            <motion.div
              key="matchups"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex flex-col justify-between gap-2.5 h-full text-left pt-0.5"
            >
              {/* Header / Summary Bar */}
              <div className="flex items-center justify-between shrink-0 px-0.5">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Defensive Type Matchups</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Damage multipliers when attacked by move types:</p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                    {quadWeaknesses.length + doubleWeaknesses.length} Weak
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                    {quadResistances.length + halfResistances.length} Resist
                  </span>
                  {immunities.length > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60">
                      {immunities.length} Immune
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Column Matrix Spanning Height with Direct Mouse Wheel Scrolling */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0" data-lenis-prevent>
                {/* LEFT COLUMN: Vulnerabilities */}
                <div
                  className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 flex flex-col gap-2.5 overflow-y-auto overscroll-contain h-full"
                  data-lenis-prevent
                >
                  <div className="flex items-center justify-between pb-1 border-b border-rose-200/60 dark:border-rose-900/40 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                      <Zap className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Vulnerabilities</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                      Takes &gt; 1× DMG
                    </span>
                  </div>

                  {quadWeaknesses.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400 block">
                        Extreme Weakness (4×)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quadWeaknesses.map((t) => (
                          <div
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                          >
                            <span className="capitalize">{t}</span>
                            <span className="bg-black/30 text-[10px] font-mono px-1 rounded-sm">4×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {doubleWeaknesses.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400 block">
                        Weaknesses (2×)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {doubleWeaknesses.map((t) => (
                          <div
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                          >
                            <span className="capitalize">{t}</span>
                            <span className="bg-black/30 text-[10px] font-mono px-1 rounded-sm">2×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quadWeaknesses.length === 0 && doubleWeaknesses.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-center p-3 text-xs text-rose-600/80 dark:text-rose-400/80 italic font-medium">
                      No known elemental weaknesses.
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Resistances & Immunities */}
                <div
                  className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 flex flex-col gap-2.5 overflow-y-auto overscroll-contain h-full"
                  data-lenis-prevent
                >
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60 dark:border-emerald-900/40 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Resistances & Defenses</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Takes &le; ½× DMG
                    </span>
                  </div>

                  {immunities.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-700 dark:text-sky-400 block">
                        Immunities (0×)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {immunities.map((t) => (
                          <div
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                          >
                            <span className="capitalize">{t}</span>
                            <span className="bg-black/30 text-[10px] font-mono px-1 rounded-sm">0×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quadResistances.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400 block">
                        Double Resistance (¼×)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quadResistances.map((t) => (
                          <div
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                          >
                            <span className="capitalize">{t}</span>
                            <span className="bg-black/30 text-[10px] font-mono px-1 rounded-sm">¼×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {halfResistances.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 block">
                        Resistances (½×)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {halfResistances.map((t) => (
                          <div
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                          >
                            <span className="capitalize">{t}</span>
                            <span className="bg-black/30 text-[10px] font-mono px-1 rounded-sm">½×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {immunities.length === 0 && quadResistances.length === 0 && halfResistances.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-center p-3 text-xs text-emerald-600/80 dark:text-emerald-400/80 italic font-medium">
                      No elemental resistances or immunities.
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM BAR: Neutral Damage (1×) Types */}
              <div className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between shrink-0 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <Scale className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Neutral (1×)</span>
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {regularDamageTypes.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {regularDamageTypes.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider shrink-0"
                      style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                      title={`${POKEMON_TYPE_THEMES[t].name}: Takes 1× Normal Damage`}
                    >
                      {t.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: EVOLUTION (Full-Height Taxonomy & Lineage Tree) */}
          {activeTab === 'evolution' && (
            <motion.div
              key="evolution"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex flex-col justify-between gap-2.5 h-full text-left pt-0.5"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between shrink-0 px-0.5">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Evolutionary Lineage & Taxonomy</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Family tree and branch progression requirements:
                  </p>
                </div>
              </div>

              {/* Main Evolution Canvas — perfectly centered for standard lineages, smoothly scrollable for multi-branch trees */}
              <div
                className="flex-1 w-full bg-slate-50/70 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 min-h-0 overflow-auto overscroll-contain relative flex"
                data-lenis-prevent
              >
                {isLoadingEvolution ? (
                  <div className="m-auto flex flex-col items-center justify-center gap-3">
                    <div className="w-7 h-7 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                      Tracing evolutionary lineage...
                    </span>
                  </div>
                ) : evolutionTree && evolutionTree.evolvesTo && evolutionTree.evolvesTo.length > 0 ? (
                  <div className="m-auto flex items-center justify-center min-w-max min-h-max py-2 px-1">
                    <EvolutionBranchRenderer
                      node={evolutionTree}
                      currentPokemonId={pokemon.id}
                      unlockedIds={unlockedIds}
                      activeTabBgColor={activeTabBgColor}
                      onSelectPokemon={(p) => onNavigatePokemon && onNavigatePokemon(p)}
                    />
                  </div>
                ) : (
                  <div className="m-auto flex flex-col items-center justify-center text-center p-4 space-y-2 max-w-sm">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute bottom-2 w-16 h-4 rounded-[50%] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs" />
                      <img
                        src={pokemon.spriteUrl}
                        alt={pokemon.displayName}
                        className="w-16 h-16 object-contain drop-shadow-sm relative z-10"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{pokemon.displayName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        This species does not evolve into or from any other Pokémon.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Bar: Evolutionary Stage Insight */}
              <div className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5" style={{ color: theme.accentHex }} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Taxonomy Status:</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {getEvolutionStage(evolutionTree, pokemon.id)}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Click any unlocked species to navigate
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Footer: Registered Previous & Next Navigation OR Minigame Insignia & Stamp */}
      <div className="mt-3 pt-3.5 sm:mt-0 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 relative z-10">
        {showNavigation ? (
          <>
            {/* Previous Registered Pokemon Button */}
            <button
              type="button"
              disabled={!prevPokemon}
              onClick={() => prevPokemon && onNavigatePokemon && onNavigatePokemon(prevPokemon)}
              className={`flex items-center justify-center gap-1 w-16 sm:w-20 h-11 sm:h-12 px-1.5 sm:px-2.5 rounded-2xl border transition-all duration-150 shrink-0 ${
                prevPokemon
                  ? 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer active:scale-95 shadow-2xs'
                  : 'opacity-20 border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              title={prevPokemon ? `Previous: #${prevPokemon.id} ${prevPokemon.displayName}` : 'No previous registered Pokémon'}
              aria-label={prevPokemon ? `Previous Pokémon: ${prevPokemon.displayName}` : 'No previous registered Pokémon'}
            >
              <ChevronLeft className="w-4 h-4 shrink-0 text-slate-600 dark:text-slate-400" />
              {prevPokemon ? (
                <img
                  src={prevPokemon.frontDefaultUrl || getFrontDefaultSpriteUrl(prevPokemon.id)}
                  alt={prevPokemon.displayName}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs"
                  loading="lazy"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10" />
              )}
            </button>

            {/* Center: Chalk "REGISTERED" Stamp Banner (Only for Newly Registered) */}
            {isNewlyRegistered ? (
              <div className="flex-1 flex items-center justify-center px-1">
                <ChalkRegisteredStamp isNew={true} />
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Next Registered Pokemon Button */}
            <button
              type="button"
              disabled={!nextPokemon}
              onClick={() => nextPokemon && onNavigatePokemon && onNavigatePokemon(nextPokemon)}
              className={`flex items-center justify-center gap-1 w-16 sm:w-20 h-11 sm:h-12 px-1.5 sm:px-2.5 rounded-2xl border transition-all duration-150 shrink-0 ${
                nextPokemon
                  ? 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer active:scale-95 shadow-2xs'
                  : 'opacity-20 border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              title={nextPokemon ? `Next: #${nextPokemon.id} ${nextPokemon.displayName}` : 'No next registered Pokémon'}
              aria-label={nextPokemon ? `Next Pokémon: ${nextPokemon.displayName}` : 'No next registered Pokémon'}
            >
              {nextPokemon ? (
                <img
                  src={nextPokemon.frontDefaultUrl || getFrontDefaultSpriteUrl(nextPokemon.id)}
                  alt={nextPokemon.displayName}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs"
                  loading="lazy"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10" />
              )}
              <ChevronRight className="w-4 h-4 shrink-0 text-slate-600 dark:text-slate-400" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center py-1">
            <ChalkRegisteredStamp isNew={isNewlyRegistered} />
          </div>
        )}
      </div>

    </motion.div>
  </motion.div>
)}
</AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

// ==========================================
// Subcomponent: Evolution Branch Trigger Badge
// ==========================================
const EvolutionTriggerBadge: React.FC<{
  child: EvolutionNode;
}> = ({ child }) => {
  const text =
    child.evolutionDetailsText ||
    (child.minLevel
      ? `Lv. ${child.minLevel}`
      : child.item
      ? child.item.replace(/-/g, ' ')
      : child.trigger
      ? child.trigger.replace(/-/g, ' ')
      : 'Evolution');

  return (
    <div
      className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-2xs whitespace-nowrap max-w-[150px] truncate select-none shrink-0"
      title={text}
    >
      <span>{text}</span>
    </div>
  );
};

// ==========================================
// Subcomponent: Evolution Branch Renderer
// ==========================================
const EvolutionBranchRenderer: React.FC<{
  node: EvolutionNode;
  currentPokemonId: number;
  unlockedIds: number[];
  activeTabBgColor?: string;
  onSelectPokemon: (pokemon: Pokemon) => void;
}> = ({ node, currentPokemonId, unlockedIds, activeTabBgColor, onSelectPokemon }) => {
  const isUnlocked = unlockedIds.includes(node.id);
  const isCurrent = node.id === currentPokemonId;
  const pokemonData = isUnlocked ? getPokemonById(node.id) : null;
  const hasEvolutions = !!(node.evolvesTo && node.evolvesTo.length > 0);
  const isMultiBranch = hasEvolutions && node.evolvesTo!.length > 1;

  // Node Card Component
  const renderCard = () => (
    <div className="flex flex-col items-center shrink-0">
      {isUnlocked && pokemonData ? (
        /* Discovered Pokémon: Interactive Card */
        <button
          type="button"
          onClick={() => onSelectPokemon(pokemonData)}
          className={`group p-2.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between text-center w-26 sm:w-28 h-36 sm:h-40 cursor-pointer relative shadow-2xs shrink-0 ${
            isCurrent
              ? 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-2 ring-offset-1 dark:ring-offset-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105'
          }`}
          style={isCurrent ? { borderColor: activeTabBgColor } : undefined}
          title={`View #${pokemonData.id} ${pokemonData.displayName}`}
        >
          {isCurrent && (
            <span
              className="absolute -top-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase text-white tracking-wider shadow-xs z-20"
              style={{ backgroundColor: activeTabBgColor || '#0f172a' }}
            >
              Viewing
            </span>
          )}
          <div className="w-13 h-13 sm:w-15 sm:h-15 relative flex items-center justify-center my-0.5 shrink-0">
            <div className="absolute bottom-0.5 w-11 sm:w-13 h-3.5 rounded-[50%] bg-slate-100 dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600/60 shadow-2xs" />
            <img
              src={pokemonData.spriteUrl}
              alt={pokemonData.displayName}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain relative z-10 transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="space-y-0.5 w-full">
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block truncate">
              {pokemonData.displayName}
            </span>
            <span className="text-[9px] font-mono font-medium text-slate-400 dark:text-slate-500 block">
              #{String(pokemonData.id).padStart(4, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 justify-center flex-wrap">
            {pokemonData.types.map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase shadow-2xs"
                style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
              >
                {t}
              </span>
            ))}
          </div>
        </button>
      ) : (
        /* Undiscovered Pokémon: Concealed Mystery Slot */
        <div
          className="p-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 flex flex-col items-center justify-between text-center w-26 sm:w-28 h-36 sm:h-40 select-none shrink-0"
          title="Undiscovered Pokémon — register this species in your Pokédex to unlock"
        >
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 flex items-center justify-center my-0.5 shrink-0">
            <HelpCircle className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-1 w-full mt-0.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block font-mono">
              ???
            </span>
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[8px] font-semibold text-slate-500 dark:text-slate-400">
              <Lock className="w-2.5 h-2.5" />
              <span>Undiscovered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!hasEvolutions) {
    return renderCard();
  }

  // Single-child linear branch
  if (!isMultiBranch) {
    const singleChild = node.evolvesTo![0];
    return (
      <div className="flex items-center shrink-0">
        {renderCard()}

        {/* Linear Connector */}
        <div className="flex items-center px-1 shrink-0">
          <div className="w-3 sm:w-4 h-[2px] bg-slate-300 dark:bg-slate-700" />
          <EvolutionTriggerBadge child={singleChild} />
          <div className="w-3 sm:w-4 h-[2px] bg-slate-300 dark:bg-slate-700" />
          <ArrowRight className="w-3.5 h-3.5 -ml-1 text-slate-400 dark:text-slate-500 shrink-0" />
        </div>

        {/* Child Tree */}
        <EvolutionBranchRenderer
          node={singleChild}
          currentPokemonId={currentPokemonId}
          unlockedIds={unlockedIds}
          activeTabBgColor={activeTabBgColor}
          onSelectPokemon={onSelectPokemon}
        />
      </div>
    );
  }

  // Multi-branch tree
  return (
    <div className="flex items-center shrink-0">
      {renderCard()}

      {/* Parent Stem to Spine */}
      <div className="w-3 sm:w-5 h-[2px] bg-slate-300 dark:bg-slate-700 shrink-0" />

      {/* Children Vertical Stack */}
      <div className="flex flex-col shrink-0">
        {node.evolvesTo!.map((child, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === node.evolvesTo!.length - 1;

          return (
            <div key={child.id} className="relative flex items-center py-2 pl-4 sm:pl-6 shrink-0">
              {/* Continuous Spine Segment */}
              <div
                className={`absolute left-0 w-[2px] bg-slate-300 dark:bg-slate-700 ${
                  isFirst
                    ? 'top-1/2 bottom-0 rounded-tl-sm'
                    : isLast
                    ? 'top-0 bottom-1/2 rounded-bl-sm'
                    : 'top-0 bottom-0'
                }`}
              />

              {/* Horizontal Branch Arm */}
              <div className="absolute left-0 top-1/2 w-4 sm:w-6 h-[2px] bg-slate-300 dark:bg-slate-700" />

              {/* Branch Trigger Badge and Arrow */}
              <div className="flex items-center px-1 shrink-0">
                <EvolutionTriggerBadge child={child} />
                <div className="w-2 sm:w-3 h-[2px] bg-slate-300 dark:bg-slate-700" />
                <ArrowRight className="w-3.5 h-3.5 -ml-1 text-slate-400 dark:text-slate-500 shrink-0" />
              </div>

              {/* Child Subtree */}
              <EvolutionBranchRenderer
                node={child}
                currentPokemonId={currentPokemonId}
                unlockedIds={unlockedIds}
                activeTabBgColor={activeTabBgColor}
                onSelectPokemon={onSelectPokemon}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonDetailModal;
