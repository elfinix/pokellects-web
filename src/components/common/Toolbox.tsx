import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  RotateCcw,
  ChevronDown,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PokemonType } from '../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';

export type SortCriteria = 'id' | 'name' | 'stat';
export type SortOrder = 'asc' | 'desc';
export type DisplayMode = 'card' | 'row';

export interface ToolboxFilters {
  searchQuery: string;
  selectedType: PokemonType | 'all';
  selectedGeneration: number | 'all';
  sortCriteria: SortCriteria;
  sortOrder: SortOrder;
  showOnlyUnlocked?: boolean;
}

interface ToolboxProps {
  filters: ToolboxFilters;
  onFilterChange: (filters: ToolboxFilters) => void;
  onReset?: () => void;
  totalResults?: number;
  totalCount?: number;
  placeholder?: string;
  showUnlockedFilter?: boolean;
  displayMode?: DisplayMode;
  onDisplayModeChange?: (mode: DisplayMode) => void;
}

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'fairy', 'dark',
];

export const Toolbox: React.FC<ToolboxProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  totalCount,
  placeholder = 'Search Pokémon...',
  showUnlockedFilter = true,
  displayMode = 'card',
  onDisplayModeChange,
}) => {
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTypeOpen(false);
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, searchQuery: val });
  };

  const handleTypeChange = (type: PokemonType | 'all') => {
    onFilterChange({ ...filters, selectedType: type });
  };

  const handleSortChange = (crit: SortCriteria) => {
    onFilterChange({ ...filters, sortCriteria: crit });
  };

  const toggleSortOrder = () => {
    onFilterChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedType !== 'all' ||
    filters.sortCriteria !== 'id' ||
    filters.sortOrder !== 'asc';

  const selectedTypeTheme =
    filters.selectedType !== 'all' ? POKEMON_TYPE_THEMES[filters.selectedType] : null;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 space-y-2.5 sm:space-y-3 transition-all relative z-10">
      {/* Top row: Search Bar, Display Mode Toggle, and Quick Reset */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-0 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-hidden focus:border-red-500/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-red-500/10 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Display Mode Toggle (Card / Row) */}
        {onDisplayModeChange && (
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => onDisplayModeChange('card')}
              className={`h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                displayMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card View (Default Grid)"
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs">Card</span>
            </button>
            <button
              type="button"
              onClick={() => onDisplayModeChange('row')}
              className={`h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                displayMode === 'row'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Row View (Resource Efficient Compact List)"
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs">Row</span>
            </button>
          </div>
        )}

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200/80 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer group active:scale-95 shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-90 duration-300" />
          </button>
        )}
      </div>

      {/* Bottom row: Custom Type Dropdown, Custom Sort Dropdown, Order Toggle, and Count */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-slate-100/90 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial min-w-0">
          {/* Custom Type Filter Dropdown */}
          <div ref={typeDropdownRef} className="relative flex-1 sm:flex-initial min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsTypeOpen(!isTypeOpen);
                setIsSortOpen(false);
              }}
              className={`h-8 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-bold min-w-0 ${
                isTypeOpen || filters.selectedType !== 'all'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                  : 'bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden md:inline text-slate-400 dark:text-slate-500 font-medium">Type:</span>
                {selectedTypeTheme ? (
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: selectedTypeTheme.accentHex }}
                    />
                    <span className="text-slate-900 dark:text-white font-bold truncate">{selectedTypeTheme.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 font-bold truncate">All Types</span>
                )}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isTypeOpen ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isTypeOpen && (
              <div className="absolute top-full mt-1.5 left-0 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 w-52 max-h-72 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    handleTypeChange('all');
                    setIsTypeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.selectedType === 'all'
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>All Types</span>
                  </div>
                  {filters.selectedType === 'all' && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                {ALL_TYPES.map((type) => {
                  const theme = POKEMON_TYPE_THEMES[type];
                  const isSelected = filters.selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        handleTypeChange(type);
                        setIsTypeOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5" style={{ color: theme.accentHex }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Sort By Dropdown */}
          <div ref={sortDropdownRef} className="relative flex-1 sm:flex-initial min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsTypeOpen(false);
              }}
              className={`h-8 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-bold min-w-0 ${
                isSortOpen || filters.sortCriteria !== 'id'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                  : 'bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden md:inline text-slate-400 dark:text-slate-500 font-medium">Sort:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
                  {filters.sortCriteria === 'id' && 'Pokédex #'}
                  {filters.sortCriteria === 'name' && 'Name (A-Z)'}
                  {filters.sortCriteria === 'stat' && 'Base Stat Total'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isSortOpen ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
                }`}
              />
            </button>

            {/* Custom Sort Dropdown Menu */}
            {isSortOpen && (
              <div className="absolute top-full mt-1.5 left-0 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-150 shadow-xl">
                {[
                  { id: 'id' as SortCriteria, label: 'Pokédex #' },
                  { id: 'name' as SortCriteria, label: 'Name (A-Z)' },
                  { id: 'stat' as SortCriteria, label: 'Base Stat Total' },
                ].map((item) => {
                  const isSelected = filters.sortCriteria === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSortChange(item.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Order Toggle (Exact matching h-8 w-8) */}
          <button
            type="button"
            onClick={toggleSortOrder}
            className="h-8 w-8 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/60 transition-all cursor-pointer flex items-center justify-center active:scale-95 group shrink-0"
            title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending (lowest to highest)' : 'Descending (highest to lowest)'} - click to toggle`}
          >
            {filters.sortOrder === 'asc' ? (
              <ArrowUpNarrowWide className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            ) : (
              <ArrowDownWideNarrow className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Right side: Results Counter (Desktop / sm+ screen) */}
        {totalResults !== undefined && (
          <div className="hidden sm:flex text-[11px] text-slate-400 dark:text-slate-500 font-medium items-center gap-1 shrink-0 ml-auto">
            <span>Showing</span>
            <span className="font-black text-slate-800 dark:text-slate-200 font-mono">{totalResults}</span>
            {totalCount !== undefined && (
              <>
                <span>of</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400 font-mono">{totalCount}</span>
              </>
            )}
            <span>Pokémon</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbox;
