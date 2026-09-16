import React from 'react';
import { Search, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
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
  placeholder = 'Search by Pokémon name or #ID...',
  showUnlockedFilter = true,
}) => {
  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, searchQuery: val });
  };

  const handleTypeChange = (type: PokemonType | 'all') => {
    onFilterChange({ ...filters, selectedType: type });
  };

  const handleGenChange = (gen: number | 'all') => {
    onFilterChange({ ...filters, selectedGeneration: gen });
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

  const toggleUnlockedOnly = () => {
    onFilterChange({
      ...filters,
      showOnlyUnlocked: !filters.showOnlyUnlocked,
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedType !== 'all' ||
    filters.selectedGeneration !== 'all' ||
    filters.showOnlyUnlocked ||
    filters.sortCriteria !== 'id' ||
    filters.sortOrder !== 'asc';

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
      {/* Top row: Search Bar and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm focus:outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Unlocked Toggle & Reset Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
          {showUnlockedFilter && (
            <button
              type="button"
              onClick={toggleUnlockedOnly}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                filters.showOnlyUnlocked
                  ? 'bg-red-50 border-red-200 text-red-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  filters.showOnlyUnlocked ? 'bg-red-600' : 'bg-slate-300'
                }`}
              />
              <span>Registered Only</span>
            </button>
          )}

          {hasActiveFilters && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Type Dropdown, Generation Dropdown, Sort Selector & Order Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={filters.selectedType}
              onChange={(e) => handleTypeChange(e.target.value as PokemonType | 'all')}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Types</option>
              {ALL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {POKEMON_TYPE_THEMES[type].name}
                </option>
              ))}
            </select>
          </div>

          {/* Generation Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-medium">Gen:</span>
            <select
              value={filters.selectedGeneration}
              onChange={(e) =>
                handleGenChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Gens (1–9)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                <option key={gen} value={gen}>
                  Gen {gen}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={filters.sortCriteria}
              onChange={(e) => handleSortChange(e.target.value as SortCriteria)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="id">Dex #</option>
              <option value="name">Name (A-Z)</option>
              <option value="stat">Base Stat Total</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={toggleSortOrder}
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
            title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {filters.sortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span className="text-[11px] font-semibold uppercase">{filters.sortOrder}</span>
          </button>
        </div>

        {/* Results Counter */}
        {totalResults !== undefined && (
          <div className="text-[11px] text-slate-400 font-medium ml-auto">
            Showing <span className="font-bold text-slate-700">{totalResults}</span>
            {totalCount !== undefined && ` of ${totalCount}`} Pokémon
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbox;
