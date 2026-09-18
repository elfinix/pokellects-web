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
} from 'lucide-react';
import { PokemonType } from '../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';

export type SortCriteria = 'id' | 'name' | 'stat';
export type SortOrder = 'asc' | 'desc';

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
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 space-y-3 transition-all relative z-10">
      {/* Top row: Search Bar and Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-red-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-hidden focus:border-red-500/80 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all cursor-pointer group active:scale-95 shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-90 duration-300" />
          </button>
        )}
      </div>

      {/* Bottom row: Custom Type Dropdown, Custom Sort Dropdown, Order Toggle, and Count */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100/90 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Type Filter Dropdown */}
          <div ref={typeDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsTypeOpen(!isTypeOpen);
                setIsSortOpen(false);
              }}
              className={`h-8 flex items-center gap-2 px-3 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-bold ${
                isTypeOpen || filters.selectedType !== 'all'
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Type:</span>
              {selectedTypeTheme ? (
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: selectedTypeTheme.accentHex }}
                  />
                  <span className="text-slate-900 font-bold">{selectedTypeTheme.name}</span>
                </div>
              ) : (
                <span className="text-slate-800 font-bold">All Types</span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isTypeOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isTypeOpen && (
              <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl border border-slate-200 p-1.5 w-52 max-h-72 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    handleTypeChange('all');
                    setIsTypeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.selectedType === 'all'
                      ? 'bg-red-50 text-red-700'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>All Types</span>
                  </div>
                  {filters.selectedType === 'all' && <Check className="w-3.5 h-3.5 text-red-600" />}
                </button>

                <div className="h-px bg-slate-100 my-1" />

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
                          ? 'bg-slate-100 text-slate-900 font-black'
                          : 'text-slate-700 hover:bg-slate-50'
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
          <div ref={sortDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsTypeOpen(false);
              }}
              className={`h-8 flex items-center gap-2 px-3 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-bold ${
                isSortOpen || filters.sortCriteria !== 'id'
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Sort:</span>
              <span className="text-slate-800 font-bold">
                {filters.sortCriteria === 'id' && 'Pokédex #'}
                {filters.sortCriteria === 'name' && 'Name (A-Z)'}
                {filters.sortCriteria === 'stat' && 'Base Stat Total'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isSortOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </button>

            {/* Custom Sort Dropdown Menu */}
            {isSortOpen && (
              <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl border border-slate-200 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-150">
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
                          ? 'bg-red-50 text-red-700 font-black'
                          : 'text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
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
            className="h-8 w-8 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-red-600 hover:border-red-200/80 transition-all cursor-pointer flex items-center justify-center active:scale-95 group shrink-0"
            title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending (lowest to highest)' : 'Descending (highest to lowest)'} - click to toggle`}
          >
            {filters.sortOrder === 'asc' ? (
              <ArrowUpNarrowWide className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition-transform" />
            ) : (
              <ArrowDownWideNarrow className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Results Counter */}
        {totalResults !== undefined && (
          <div className="text-[11px] text-slate-400 font-medium ml-auto flex items-center gap-1">
            <span>Showing</span>
            <span className="font-black text-slate-800 font-mono">{totalResults}</span>
            {totalCount !== undefined && (
              <>
                <span>of</span>
                <span className="font-semibold text-slate-600 font-mono">{totalCount}</span>
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
