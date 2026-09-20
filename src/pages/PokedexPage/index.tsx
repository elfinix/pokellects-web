import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, HelpCircle, ChevronDown, Check, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePokedex } from '../../context/PokedexContext';
import { Pokemon } from '../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';
import { getPokemonById, getPokemonByIdAsync } from '../../services/pokemonIndex';
import Toolbox, { ToolboxFilters, DisplayMode } from '../../components/common/Toolbox';
import { RegionId, REGIONS } from './components/RegionFilterBar';
import PokemonDetailModal from './components/PokemonDetailModal';
import FloatingRegistrationBar from './components/FloatingRegistrationBar';

// Region ID ranges for filtering
const REGION_ID_RANGES: Record<RegionId, [number, number]> = {
  national: [1, 1025],
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unova: [494, 649],
  kalos: [650, 721],
  alola: [722, 809],
  galar: [810, 898],
  hisui: [899, 905],
  paldea: [906, 1025],
  lumiose: [650, 721],
};

// Dynamic loading skeleton card for initial load & progressive batch loading
const PokemonCardSkeleton: React.FC = React.memo(() => (
  <div
    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 195px' } as React.CSSProperties}
    className="relative p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white/95  flex flex-col items-center justify-between text-center overflow-hidden select-none min-h-[195px]"
  >
    {/* Shimmer Wave Effect */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/80 to-transparent pointer-events-none z-10" />

    {/* Header skeleton */}
    <div className="w-full flex items-center justify-between relative z-0">
      <div className="w-12 h-3.5 rounded-md bg-slate-100 animate-pulse" />
      <div className="w-8 h-3 rounded-md bg-slate-100 animate-pulse" />
    </div>

    {/* Center Sprite Pedestal Shimmer */}
    <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center my-2 relative z-0">
      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-100/90 animate-pulse" />
    </div>

    {/* Bottom: Name & Badges Placeholder */}
    <div className="w-full space-y-1.5 flex flex-col items-center relative z-0">
      <div className="w-20 h-3.5 rounded-md bg-slate-100 animate-pulse" />
      <div className="flex items-center gap-1.5 justify-center">
        <div className="w-10 h-3.5 rounded-md bg-slate-100 animate-pulse" />
        <div className="w-10 h-3.5 rounded-md bg-slate-100 animate-pulse" />
      </div>
    </div>
  </div>
));

// Undiscovered Pokémon Card (Memoized)
const UndiscoveredPokemonCard: React.FC<{ poke: Pokemon }> = React.memo(({ poke }) => (
  <div
    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 195px' } as React.CSSProperties}
    className="group relative p-4 rounded-2xl border border-dashed border-slate-200/90 dark:border-slate-800/80 bg-gradient-to-b from-white/70 via-slate-50/50 to-slate-100/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/80 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col items-center justify-between text-center select-none transition-all duration-150 ease-out min-h-[195px]"
  >
    {/* Dex ID Header */}
    <div className="w-full flex items-center justify-between">
      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
        #{String(poke.id).padStart(4, '0')}
      </span>
      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-300 dark:text-slate-600">
        Gen {poke.generation}
      </span>
    </div>

    {/* Customized Question Mark Icon (No silhouette) */}
    <div className="my-3 relative flex items-center justify-center">
      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/60 dark:from-slate-800/90 dark:via-slate-800/40 dark:to-slate-900/90 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center group-hover:scale-105 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all duration-150 ease-out shadow-xs dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
        <HelpCircle className="w-8 h-8 sm:w-9 sm:h-9 text-slate-300 dark:text-slate-500 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition-colors" />
      </div>
      {/* Subtle Radar Pulse */}
      <div className="absolute inset-0 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 pointer-events-none" />
    </div>

    {/* Mystery Metadata - displays "???" instead of "Unknown Species" */}
    <div className="w-full space-y-1">
      <div className="text-sm font-black text-slate-400 dark:text-slate-500 font-display tracking-tight">
        ???
      </div>
      <div className="inline-block px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
        Undiscovered
      </div>
    </div>
  </div>
));

// Registered Pokémon Card with image lazy loading and skeleton shimmer (Memoized)
const RegisteredPokemonCard: React.FC<{
  poke: Pokemon;
  theme: (typeof POKEMON_TYPE_THEMES)[keyof typeof POKEMON_TYPE_THEMES];
  onOpenModal: (p: Pokemon) => void;
}> = React.memo(({ poke, theme, onOpenModal }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpenModal(poke)}
      style={
        {
          '--type-color': theme.accentHex,
          '--type-bg': `${theme.accentHex}18`,
          contentVisibility: 'auto',
          containIntrinsicSize: '0 195px',
        } as React.CSSProperties
      }
      className="group relative p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300/90 dark:hover:border-slate-700 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-150 ease-out flex flex-col items-center justify-between text-center cursor-pointer overflow-hidden min-h-[195px]"
    >
      {/* Type Accent Top Highlight Line */}
      <div
        className="absolute top-0 inset-x-0 h-1 rounded-t-2xl transition-all duration-150 group-hover:h-1.5"
        style={{ backgroundColor: theme.accentHex }}
      />

      {/* Ambient Type Radial Glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity duration-150 group-hover:opacity-50"
        style={{ backgroundColor: theme.accentHex }}
      />

      {/* Top Header: Dex ID + Gen */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 relative z-10">
        <span className="px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-colors duration-150 font-bold group-hover:text-[var(--type-color)] group-hover:bg-[var(--type-bg)]">
          #{String(poke.id).padStart(4, '0')}
        </span>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
          Gen {poke.generation}
        </span>
      </div>

      {/* High-res Sprite with Synchronized 150ms Scale + Loading Skeleton Shimmer */}
      <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center my-1.5">
        <div className="absolute inset-0 rounded-full bg-slate-50/80 dark:bg-slate-800/60 group-hover:bg-slate-100/60 dark:group-hover:bg-slate-800/90 scale-75 group-hover:scale-95 transition-all duration-150" />
        {!imageLoaded && (
          <div className="absolute w-14 h-14 rounded-full bg-slate-200/70 dark:bg-slate-700/70 animate-pulse z-0" />
        )}
        <img
          src={poke.spriteUrl}
          alt={poke.displayName}
          onLoad={() => setImageLoaded(true)}
          className={`w-18 h-18 sm:w-20 sm:h-20 object-contain group-hover:scale-115 transition-all duration-150 ease-out relative z-10 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Species Name and Type Badges */}
      <div className="w-full space-y-2 relative z-10">
        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display truncate transition-colors duration-150 group-hover:text-[var(--type-color)]">
          {poke.displayName}
        </div>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {poke.types.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white transition-transform duration-150 group-hover:scale-105"
              style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
});
// Dynamic loading skeleton row for initial load & progressive batch loading
const PokemonRowSkeleton: React.FC = React.memo(() => (
  <div
    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 56px' } as React.CSSProperties}
    className="relative p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between overflow-hidden select-none min-h-[56px]"
  >
    {/* Shimmer Wave Effect */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/80 to-transparent pointer-events-none z-10" />

    {/* Left: ID + Sprite placeholder + Name placeholder */}
    <div className="flex items-center gap-3 relative z-0">
      <div className="w-12 h-4 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="w-24 sm:w-32 h-4 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>

    {/* Right: Badges placeholder */}
    <div className="flex items-center gap-2 relative z-0">
      <div className="w-12 h-4 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="w-10 h-4 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  </div>
));

// Undiscovered Pokémon Row (Memoized)
const UndiscoveredPokemonRow: React.FC<{ poke: Pokemon }> = React.memo(({ poke }) => (
  <div
    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 56px' } as React.CSSProperties}
    className="group relative p-2.5 sm:p-3 rounded-2xl border border-dashed border-slate-200/90 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-left select-none transition-colors min-h-[56px]"
  >
    {/* Left section: Dex ID + Help Icon + ??? */}
    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
        #{String(poke.id).padStart(4, '0')}
      </span>

      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
        <HelpCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
      </div>

      <div className="min-w-0">
        <span className="text-xs sm:text-sm font-black text-slate-400 dark:text-slate-500 font-display block">
          ???
        </span>
        <span className="text-[9px] uppercase font-semibold text-slate-400 dark:text-slate-600 sm:hidden block">
          Gen {poke.generation}
        </span>
      </div>
    </div>

    {/* Right section: Locked status + Gen */}
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <span className="px-2 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
        Undiscovered
      </span>
      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100/60 dark:bg-slate-800/60 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-600">
        Gen {poke.generation}
      </span>
    </div>
  </div>
));

// Registered Pokémon Row with image lazy loading and fast horizontal layout (Memoized)
const RegisteredPokemonRow: React.FC<{
  poke: Pokemon;
  theme: (typeof POKEMON_TYPE_THEMES)[keyof typeof POKEMON_TYPE_THEMES];
  onOpenModal: (p: Pokemon) => void;
}> = React.memo(({ poke, theme, onOpenModal }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpenModal(poke)}
      style={
        {
          '--type-color': theme.accentHex,
          '--type-bg': `${theme.accentHex}18`,
          contentVisibility: 'auto',
          containIntrinsicSize: '0 56px',
        } as React.CSSProperties
      }
      className="group relative w-full p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300/90 dark:hover:border-slate-700 hover:bg-slate-50/90 dark:hover:bg-slate-850 hover:shadow-xs transition-all duration-150 ease-out flex items-center justify-between text-left cursor-pointer overflow-hidden min-h-[56px]"
    >
      {/* Type Accent Left Highlight Strip */}
      <div
        className="absolute left-0 inset-y-0 w-1 rounded-l-2xl transition-all duration-150 group-hover:w-1.5"
        style={{ backgroundColor: theme.accentHex }}
      />

      {/* Left section: Dex ID + Sprite + Name */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pl-1.5">
        <span className="px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-colors duration-150 font-bold text-[10px] font-mono group-hover:text-[var(--type-color)] group-hover:bg-[var(--type-bg)] shrink-0">
          #{String(poke.id).padStart(4, '0')}
        </span>

        <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
          {!imageLoaded && (
            <div className="absolute w-7 h-7 rounded-full bg-slate-200/70 dark:bg-slate-700/70 animate-pulse" />
          )}
          <img
            src={poke.spriteUrl}
            alt={poke.displayName}
            onLoad={() => setImageLoaded(true)}
            className={`w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-115 transition-transform duration-150 relative z-10 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display truncate block group-hover:text-[var(--type-color)] transition-colors">
            {poke.displayName}
          </span>
          <span className="text-[9px] uppercase font-semibold text-slate-400 dark:text-slate-500 sm:hidden block">
            Gen {poke.generation}
          </span>
        </div>
      </div>

      {/* Right section: Type Badges + Generation + Chevron */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1">
          {poke.types.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white transition-transform duration-150 group-hover:scale-105"
              style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
            >
              {t}
            </span>
          ))}
        </div>

        <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
          Gen {poke.generation}
        </span>

        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
});

export const PokedexPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    allPokemon,
    unlockedIds,
    selectedPokemon,
    isModalOpen,
    isNewlyRegistered,
    openDetailModal,
    closeDetailModal,
    stats,
  } = usePokedex();

  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    return (localStorage.getItem('pokellects_pokedex_display_mode') as DisplayMode) || 'card';
  });

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    try {
      localStorage.setItem('pokellects_pokedex_display_mode', mode);
    } catch {
      // ignore storage error in private mode
    }
  };

  const regionDropdownRef = useRef<HTMLDivElement>(null);

  // When a new user enters the Pokedex page, immediately show the Pikachu registration popup modal
  useEffect(() => {
    if (!currentUser) return;
    const storageKey = `pokellects_welcome_pikachu_${currentUser.id || currentUser.username}`;
    const alreadyShown = localStorage.getItem(storageKey);
    if (!alreadyShown) {
      localStorage.setItem(storageKey, 'true');
      const timer = setTimeout(async () => {
        const pikachu = getPokemonById(25) || (await getPokemonByIdAsync(25));
        if (pikachu) {
          openDetailModal(pikachu, true);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentUser, openDetailModal]);

  const [filters, setFilters] = useState<ToolboxFilters>({
    searchQuery: '',
    selectedType: 'all',
    selectedGeneration: 'all',
    sortCriteria: 'id',
    sortOrder: 'asc',
  });

  // Fast O(1) unlocked set for instant lookups
  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds]);

  // Deferred search string for non-blocking concurrent UI updates
  const deferredSearchQuery = React.useDeferredValue(filters.searchQuery);

  const handleResetFilters = () => {
    setSelectedRegion('national');
    setFilters({
      searchQuery: '',
      selectedType: 'all',
      selectedGeneration: 'all',
      sortCriteria: 'id',
      sortOrder: 'asc',
    });
  };

  // Regional unlocked counts calculation (Memoized)
  const unlockedCountByRegion = useMemo(() => {
    const counts: Record<RegionId, number> = {
      national: unlockedIds.length,
      kanto: 0,
      johto: 0,
      hoenn: 0,
      sinnoh: 0,
      unova: 0,
      kalos: 0,
      alola: 0,
      galar: 0,
      hisui: 0,
      paldea: 0,
      lumiose: 0,
    };

    for (const id of unlockedIds) {
      for (const [rId, [min, max]] of Object.entries(REGION_ID_RANGES)) {
        if (rId !== 'national' && id >= min && id <= max) {
          counts[rId as RegionId] = (counts[rId as RegionId] || 0) + 1;
        }
      }
    }
    return counts;
  }, [unlockedIds]);

  // Information about current active regional league
  const currentRegionInfo = useMemo(() => {
    const region = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];
    const [minId, maxId] = REGION_ID_RANGES[selectedRegion];
    const totalInRegion =
      selectedRegion === 'national'
        ? allPokemon.length
        : allPokemon.filter((p) => p.id >= minId && p.id <= maxId).length;
    const unlockedInRegion = unlockedCountByRegion[selectedRegion] || 0;
    const pct = totalInRegion > 0 ? Math.round((unlockedInRegion / totalInRegion) * 100) : 0;
    return { ...region, totalInRegion, unlockedInRegion, pct };
  }, [selectedRegion, allPokemon, unlockedCountByRegion]);

  // Gradient extraction for liquid tide hover effect
  const liquidGradient = useMemo(() => {
    const match = currentRegionInfo.activeStyle.match(/from-[^\s]+(?: via-[^\s]+)? to-[^\s]+/);
    return match ? match[0] : 'from-red-600 to-rose-700';
  }, [currentRegionInfo.activeStyle]);

  // Filter and sort the complete 1,025 Pokémon list
  const filteredPokemon = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const hasActiveToolbarFilter = query.length > 0 || filters.selectedType !== 'all';

    return allPokemon
      .filter((p) => {
        // Region filter
        if (selectedRegion !== 'national') {
          const [minId, maxId] = REGION_ID_RANGES[selectedRegion];
          if (p.id < minId || p.id > maxId) return false;
        }

        // When toolbar filters are active, only registered species are shown
        if (hasActiveToolbarFilter && !unlockedSet.has(p.id)) {
          return false;
        }

        // Search query
        if (query) {
          const matchesName = p.displayName.toLowerCase().includes(query) || p.name.toLowerCase().includes(query);
          const matchesId = String(p.id).padStart(4, '0').includes(query) || String(p.id) === query;
          if (!matchesName && !matchesId) return false;
        }

        // Type filter
        if (filters.selectedType !== 'all') {
          if (!p.types.includes(filters.selectedType)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filters.sortCriteria === 'id') {
          comp = a.id - b.id;
        } else if (filters.sortCriteria === 'name') {
          comp = a.displayName.localeCompare(b.displayName);
        } else if (filters.sortCriteria === 'stat') {
          const totalA = a.stats.reduce((acc, s) => acc + s.baseStat, 0);
          const totalB = b.stats.reduce((acc, s) => acc + s.baseStat, 0);
          comp = totalA - totalB;
        }

        return filters.sortOrder === 'asc' ? comp : -comp;
      });
  }, [allPokemon, deferredSearchQuery, filters.selectedType, filters.sortCriteria, filters.sortOrder, unlockedSet, selectedRegion]);

  // List of registered Pokémon within active region scope sorted by Pokédex # for modal navigation
  const registeredPokemonList = useMemo(() => {
    return allPokemon
      .filter((p) => {
        if (!unlockedSet.has(p.id)) return false;
        if (selectedRegion !== 'national') {
          const [minId, maxId] = REGION_ID_RANGES[selectedRegion];
          if (p.id < minId || p.id > maxId) return false;
        }
        return true;
      })
      .sort((a, b) => a.id - b.id);
  }, [allPokemon, unlockedSet, selectedRegion]);

  // Progressive batch loading constants
  const INITIAL_BATCH_SIZE = 48;
  const BATCH_INCREMENT = 36;

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination whenever filters or region change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [filters, selectedRegion]);

  // Infinite scroll intersection observer for seamless lazy batch loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && visibleCount < filteredPokemon.length) {
          setVisibleCount((prev) => Math.min(filteredPokemon.length, prev + BATCH_INCREMENT));
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, filteredPokemon.length]);

  const visiblePokemon = useMemo(
    () => filteredPokemon.slice(0, visibleCount),
    [filteredPokemon, visibleCount]
  );

  // Circular progress math (radius 19, circumference ~119.38)
  const ringRadius = 19;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, stats.completionRatePercent)) / 100) * circumference;

  return (
    <div className="space-y-7 sm:space-y-8 pb-36 relative">
      {/* Page Header (Consistent positioning, non-sticky Dex completion widget) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-1">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Pokédex</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Browse, inspect, and identify species to complete your permanent trainer ledger.
          </p>
        </div>

        {/* Dex Completion Status Badge (Overhauled Precision Optical Gauge) */}
        <div className="relative flex w-full sm:w-auto items-center gap-3.5 sm:gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-red-200/80 dark:hover:border-red-800/80 transition-all duration-300 group shrink-0 self-stretch sm:self-auto overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-bl from-red-500/10 via-rose-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-red-500/15 transition-all duration-500" />

          {/* Precision Optical Gauge Meter */}
          <div className="relative w-12 h-12 sm:w-13 sm:h-13 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 sm:w-13 sm:h-13 -rotate-90 transform" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="completionRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="60%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>

              {/* Faint Outer Tech Guide Ring */}
              <circle
                cx="24"
                cy="24"
                r={22}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.75"
                strokeDasharray="2 3"
                opacity="0.3"
              />

              {/* Background Track */}
              <circle
                cx="24"
                cy="24"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
              />

              {/* Animated Glowing Progress Stroke */}
              <circle
                cx="24"
                cy="24"
                r={ringRadius}
                fill="none"
                stroke="url(#completionRingGradient)"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Frosted Lens Core */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-50/90 via-white to-slate-100/70 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border border-slate-100/90 dark:border-slate-700/60 shadow-inner dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div className="flex items-baseline leading-none">
                <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {stats.completionRatePercent}
                </span>
                <span className="text-[8px] font-bold text-red-500 font-mono ml-0.5">%</span>
              </div>
            </div>
          </div>

          {/* Counts & Status */}
          <div className="space-y-0.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Dex Completion
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {stats.totalUnlocked}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
                / 1,025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Blown Atmospheric Regional Spotlight Card with Integrated Region Switcher Dropdown & Liquid Tide Hover Effect */}
      <div
        className={`relative z-30 p-5 sm:p-6 pl-6 sm:pl-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border transition-all duration-500 cursor-default select-none group isolate ${
          isBannerHovered
            ? 'border-transparent'
            : 'border-slate-200/90 dark:border-slate-800'
        }`}
      >
        {/* Inner container strictly confining left-side ambient glow and the rising liquid tide */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0"
          style={{
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            transform: 'translateZ(0)',
          }}
        >
          {/* Subtle Ambient Regional Glow strictly confined to left side (in idle state) */}
          <div
            className={`absolute inset-y-0 left-0 w-16 sm:w-24 pointer-events-none transition-all duration-500 ${
              isBannerHovered ? 'opacity-0' : 'opacity-10'
            }`}
            style={{
              background: `linear-gradient(to right, ${currentRegionInfo.accentHex}, transparent)`,
            }}
          />
          <div
            className={`absolute -top-4 -left-4 w-16 h-16 rounded-full blur-md pointer-events-none transition-all duration-500 ${
              isBannerHovered ? 'opacity-0' : 'opacity-10'
            }`}
            style={{ backgroundColor: currentRegionInfo.accentHex }}
          />

          {/* ========================================================================= */}
          {/* HORIZONTAL LIQUID TIDE CONTAINER (Dynamic subtle wave in idle, full flood on hover) */}
          {/* ========================================================================= */}
          <motion.div
            initial={false}
            animate={{ x: isBannerHovered ? '0%' : '-100%' }}
            transition={{
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Dual Seamless Oscillating Wave Crest at the leading (right) edge of the advancing fluid */}
            <div className="absolute -right-[24px] top-0 w-[30px] h-[200%] pointer-events-none overflow-visible">
              {/* Secondary Back Wave (translucent for liquid depth) */}
              <svg
                className="absolute top-0 left-0 w-full h-full fill-current animate-liquid-wave-v2 transition-colors duration-700"
                style={{
                  color: isBannerHovered
                    ? 'rgba(255, 255, 255, 0.35)'
                    : `${currentRegionInfo.accentHex}40`,
                }}
                viewBox="0 0 120 1200"
                preserveAspectRatio="none"
              >
                <path d="M 0,0 L 50,0 Q 95,150 50,300 T 50,600 Q 95,750 50,900 T 50,1200 L 0,1200 Z" />
              </svg>

              {/* Primary Foreground Wave (matches liquid crest color) */}
              <svg
                className="absolute top-0 left-0.5 w-full h-full fill-current animate-liquid-wave-v1 transition-colors duration-700"
                style={{ color: currentRegionInfo.accentHex }}
                viewBox="0 0 120 1200"
                preserveAspectRatio="none"
              >
                <path d="M 0,0 L 40,0 Q 85,150 40,300 T 40,600 Q 85,750 40,900 T 40,1200 L 0,1200 Z" />
              </svg>
            </div>

            {/* Main Fluid Body with active region gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${liquidGradient}`} />

            {/* Subtle Ambient Liquid Bubbles */}
            <div className="absolute inset-0 overflow-hidden opacity-35 pointer-events-none">
              <span className="absolute bottom-3 left-12 w-2.5 h-2.5 rounded-full bg-white/60 animate-ping" />
              <span className="absolute bottom-6 right-24 w-3 h-3 rounded-full bg-white/40" />
              <span className="absolute top-4 left-1/4 w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="absolute top-8 right-1/3 w-2 h-2 rounded-full bg-white/40" />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Regional Emblem, Interactive Dropdown Trigger Title, Badges, & Atmospheric Blurb */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              {/* Regional Emblem / Card Hover Surge Trigger */}
              <div
                onMouseEnter={() => setIsBannerHovered(true)}
                onMouseLeave={() => setIsBannerHovered(false)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-500 select-none"
                style={{
                  backgroundColor: isBannerHovered
                    ? 'rgba(255, 255, 255, 0.22)'
                    : `${currentRegionInfo.accentHex}18`,
                  color: isBannerHovered ? '#ffffff' : currentRegionInfo.accentHex,
                  backdropFilter: isBannerHovered ? 'blur(8px)' : undefined,
                }}
              >
                {currentRegionInfo.renderIcon(isBannerHovered)}
              </div>

              {/* Interactive Region Selector Dropdown Trigger */}
              <div ref={regionDropdownRef} className="relative flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                    className={`group inline-flex items-center gap-2 px-2.5 py-1 -ml-2 rounded-xl text-lg sm:text-xl font-black font-display tracking-tight active:scale-[0.98] transition-all duration-500 cursor-pointer select-none ${
                      isBannerHovered
                        ? 'text-white hover:bg-white/20'
                        : 'text-slate-900 dark:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800'
                    }`}
                    title="Switch Regional Pokédex Archive"
                  >
                    <span>
                      {currentRegionInfo.name === 'National'
                        ? 'National Pokédex'
                        : `${currentRegionInfo.name} Region`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isRegionDropdownOpen ? 'rotate-180' : ''
                      } ${
                        isBannerHovered
                          ? 'text-white/80 group-hover:text-white'
                          : isRegionDropdownOpen
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                  </button>

                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg transition-all duration-700 ${
                      isBannerHovered
                        ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    {currentRegionInfo.badgeRange}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg transition-all duration-700"
                    style={{
                      backgroundColor: isBannerHovered ? '#ffffff' : `${currentRegionInfo.accentHex}15`,
                      color: isBannerHovered ? '#0f172a' : currentRegionInfo.accentHex,
                    }}
                  >
                    {currentRegionInfo.era}
                  </span>
                </div>

                {/* Regional Leagues Popover Dropdown Menu (Comfortable 3-column, static high z-index) */}
                {isRegionDropdownOpen && (
                  <div className="absolute top-full mt-2.5 left-0 z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 w-[calc(100vw-3rem)] sm:w-[580px] md:w-[660px] max-h-[320px] sm:max-h-[340px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white shadow-2xl">
                    <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">
                          Select Regional League
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                        12 Archives
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {REGIONS.map((region) => {
                        const isSelected = region.id === selectedRegion;
                        const count = unlockedCountByRegion[region.id] || 0;
                        const [minId, maxId] = REGION_ID_RANGES[region.id];
                        const total =
                          region.id === 'national'
                            ? allPokemon.length
                            : allPokemon.filter((p) => p.id >= minId && p.id <= maxId).length;

                        return (
                          <button
                            key={region.id}
                            type="button"
                            onClick={() => {
                              setSelectedRegion(region.id);
                              setIsRegionDropdownOpen(false);
                            }}
                            className={`relative overflow-hidden flex items-center justify-between p-2 sm:p-2.5 pl-3.5 sm:pl-4 rounded-xl text-left transition-all cursor-pointer group isolate ${
                              isSelected
                                ? 'bg-red-50/90 dark:bg-red-950/60 border border-red-200/80 dark:border-red-800/80'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent'
                            }`}
                          >
                            {/* Left Line Wave Accent */}
                            <div className="absolute inset-y-0 left-0 w-6 pointer-events-none overflow-hidden select-none z-0">
                              <svg
                                className="absolute inset-y-0 left-0 h-full w-5 opacity-30 pointer-events-none transition-transform duration-300 group-hover:scale-x-120 origin-left"
                                viewBox="0 0 30 100"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d="M 0,0 C 16,20 22,45 14,70 C 8,85 15,95 0,100 Z"
                                  fill={region.accentHex}
                                />
                              </svg>
                              <svg
                                className="absolute inset-y-0 left-0 h-full w-2.5 opacity-80 pointer-events-none transition-transform duration-300 group-hover:scale-x-120 origin-left"
                                viewBox="0 0 20 100"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d="M 0,0 C 12,18 15,45 7,72 C 4,86 10,96 0,100 Z"
                                  fill={region.accentHex}
                                />
                              </svg>
                            </div>

                            <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected ? 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300' : region.iconBg
                                }`}
                              >
                                {region.renderIcon(false)}
                              </div>
                              <div className="min-w-0 leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs sm:text-sm font-black font-display text-slate-900 dark:text-white truncate">
                                    {region.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                                    {region.era}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                                    {count}/{total}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 ml-1.5 relative z-10" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Atmospheric Subtitle & Blurb capturing the feels & mood of the region */}
            <p
              className={`text-xs sm:text-sm leading-relaxed pl-0 sm:pl-13 font-normal transition-colors duration-700 ${
                isBannerHovered ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {currentRegionInfo.blurb}
            </p>
          </div>

          {/* Right: Regional Mastery Meter & Percentage */}
          <div
            className={`w-full md:w-auto flex flex-col shrink-0 pt-3 md:pt-0 border-t md:border-t-0 transition-colors duration-700 ${
              isBannerHovered ? 'border-white/20' : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <div className="w-full space-y-1.5 md:text-right">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider block transition-colors duration-700 ${
                  isBannerHovered ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                Regional Mastery
              </span>
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`w-full md:w-44 h-2.5 rounded-full overflow-hidden flex-1 md:flex-initial border transition-all duration-700 ${
                    isBannerHovered
                      ? 'bg-black/25 border-white/20'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(currentRegionInfo.pct > 0 ? 6 : 0, currentRegionInfo.pct)}%`,
                      backgroundColor: isBannerHovered ? '#ffffff' : currentRegionInfo.accentHex,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-black font-mono px-2 py-0.5 rounded-lg shrink-0 transition-all duration-700"
                  style={{
                    backgroundColor: isBannerHovered ? '#ffffff' : currentRegionInfo.accentHex,
                    color: isBannerHovered ? '#0f172a' : '#ffffff',
                  }}
                >
                  {currentRegionInfo.pct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Search & Sort Toolbox (Directly above the Cards/Rows view) */}
      <Toolbox
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        totalResults={filteredPokemon.length}
        totalCount={allPokemon.length}
        placeholder="Search Pokémon..."
        displayMode={displayMode}
        onDisplayModeChange={handleDisplayModeChange}
      />

      {/* Pokédex Card Grid or Row List with Smooth Animated Filter/View Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${displayMode}-${selectedRegion}-${filters.selectedType}-${filters.sortCriteria}-${filters.sortOrder}-${filters.searchQuery}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={
            displayMode === 'card'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'
              : 'flex flex-col gap-2 w-full'
          }
        >
          {visiblePokemon.map((poke) => {
            const isUnlocked = unlockedSet.has(poke.id);
            const primaryType = poke.types[0];
            const theme = POKEMON_TYPE_THEMES[primaryType];

            // Unfound Pokémon
            if (!isUnlocked) {
              return displayMode === 'card' ? (
                <UndiscoveredPokemonCard key={poke.id} poke={poke} />
              ) : (
                <UndiscoveredPokemonRow key={poke.id} poke={poke} />
              );
            }

            // Registered Pokémon
            return displayMode === 'card' ? (
              <RegisteredPokemonCard
                key={poke.id}
                poke={poke}
                theme={theme}
                onOpenModal={openDetailModal}
              />
            ) : (
              <RegisteredPokemonRow
                key={poke.id}
                poke={poke}
                theme={theme}
                onOpenModal={openDetailModal}
              />
            );
          })}

          {/* Seamless skeleton placeholders rendered in the view while more batches are fetching/loading on scroll */}
          {visibleCount < filteredPokemon.length &&
            Array.from({ length: Math.min(12, filteredPokemon.length - visibleCount) }).map((_, idx) =>
              displayMode === 'card' ? (
                <PokemonCardSkeleton key={`skeleton-load-batch-${idx}`} />
              ) : (
                <PokemonRowSkeleton key={`skeleton-load-batch-${idx}`} />
              )
            )}
        </motion.div>
      </AnimatePresence>

      {/* Progressive Batch Loading Intersection Sentinel */}
      {visibleCount < filteredPokemon.length && (
        <div ref={sentinelRef} className="h-6 w-full pointer-events-none -mt-3" />
      )}

      {/* Empty State */}
      {filteredPokemon.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <Search className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Pokémon found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, type filters, or regional category.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Bottom Registration Omnibar */}
      <FloatingRegistrationBar isModalOpen={isModalOpen} />

      {/* Multi-Tab Pokémon Detail Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        isNewlyRegistered={isNewlyRegistered}
        isRegistered={selectedPokemon ? unlockedSet.has(selectedPokemon.id) : false}
        onClose={closeDetailModal}
        registeredPokemonList={registeredPokemonList}
        unlockedIds={unlockedIds}
        onNavigatePokemon={(p) => openDetailModal(p, false)}
      />
    </div>
  );
};


export default PokedexPage;
