import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  User,
  Shield,
  Award,
  UserCog,
  Gamepad2,
  BookOpen,
  Calendar,
  Flame,
  Check,
  Save,
  Trophy,
  Heart,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePokedex } from '../../context/PokedexContext';
import { POKEMON_TYPE_THEMES } from '../../styles/theme';
import { PokemonType } from '../../types/pokemon';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { stats, allPokemon, unlockedIds } = usePokedex();

  const unlockedPokemonList = useMemo(() => {
    return allPokemon.filter((p) => unlockedIds.includes(p.id));
  }, [allPokemon, unlockedIds]);

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [bio, setBio] = useState(
    (currentUser as any)?.bio || 'Dedicated Pokémon scholar striving to catalog all 1,025 species across every region.'
  );
  const [favoriteType, setFavoriteType] = useState<PokemonType>(
    (currentUser as any)?.favoriteType || 'fire'
  );
  const [favoriteRegion, setFavoriteRegion] = useState(
    (currentUser as any)?.favoriteRegion || 'Kanto'
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState<number>(() => {
    const savedId = (currentUser as any)?.leadPartnerId;
    if (savedId && allPokemon.some((p) => p.id === savedId)) return savedId;
    const firstUnlocked = allPokemon.find((p) => unlockedIds.includes(p.id));
    return firstUnlocked ? firstUnlocked.id : 25;
  });
  const [isSaved, setIsSaved] = useState(false);

  // Partner Pokemon & Type Styling
  const partnerPokemon = useMemo(() => {
    return (
      allPokemon.find((p) => p.id === selectedPartnerId) ||
      allPokemon.find((p) => unlockedIds.includes(p.id)) ||
      allPokemon[24] ||
      allPokemon[0]
    );
  }, [allPokemon, selectedPartnerId, unlockedIds]);

  const [partnerSearchInput, setPartnerSearchInput] = useState(() => partnerPokemon?.displayName || '');
  const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
  const partnerInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (partnerPokemon) {
      setPartnerSearchInput(partnerPokemon.displayName);
    }
  }, [partnerPokemon?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (partnerInputRef.current && !partnerInputRef.current.contains(e.target as Node)) {
        setIsPartnerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const partnerOptions = useMemo(() => {
    const list = unlockedPokemonList.length > 0 ? unlockedPokemonList : allPokemon;
    const q = partnerSearchInput.trim().toLowerCase();
    if (!q) return list.slice(0, 40);
    return list
      .filter((p) => {
        return (
          p.displayName.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          String(p.id).includes(q)
        );
      })
      .slice(0, 40);
  }, [unlockedPokemonList, allPokemon, partnerSearchInput]);

  const partnerPrimaryType = partnerPokemon?.types[0] || 'normal';
  const partnerTypeTheme = POKEMON_TYPE_THEMES[partnerPrimaryType] || POKEMON_TYPE_THEMES.normal;
  const partnerBloomHex = partnerTypeTheme.accentHex;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateCurrentUserProfile) {
      updateCurrentUserProfile({
        firstName,
        lastName,
        ...({ bio, favoriteType, favoriteRegion, leadPartnerId: selectedPartnerId } as any),
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const userInitials = React.useMemo(() => {
    if (!currentUser) return 'TR';
    const first = firstName?.trim().charAt(0).toUpperCase() || '';
    const last = lastName?.trim().charAt(0).toUpperCase() || '';
    if (first && last) return `${first}${last}`;
    if (first) return first;
    return currentUser.username?.trim().slice(0, 2).toUpperCase() || 'TR';
  }, [currentUser, firstName, lastName]);

  const REGIONS = [
    { name: 'Kanto', gen: 1, count: stats.byGeneration[1]?.unlocked || 0, total: stats.byGeneration[1]?.total || 151 },
    { name: 'Johto', gen: 2, count: stats.byGeneration[2]?.unlocked || 0, total: stats.byGeneration[2]?.total || 100 },
    { name: 'Hoenn', gen: 3, count: stats.byGeneration[3]?.unlocked || 0, total: stats.byGeneration[3]?.total || 135 },
    { name: 'Sinnoh', gen: 4, count: stats.byGeneration[4]?.unlocked || 0, total: stats.byGeneration[4]?.total || 107 },
    { name: 'Unova', gen: 5, count: stats.byGeneration[5]?.unlocked || 0, total: stats.byGeneration[5]?.total || 156 },
    { name: 'Kalos', gen: 6, count: stats.byGeneration[6]?.unlocked || 0, total: stats.byGeneration[6]?.total || 72 },
    { name: 'Alola', gen: 7, count: stats.byGeneration[7]?.unlocked || 0, total: stats.byGeneration[7]?.total || 88 },
    { name: 'Galar', gen: 8, count: stats.byGeneration[8]?.unlocked || 0, total: stats.byGeneration[8]?.total || 96 },
    { name: 'Paldea', gen: 9, count: stats.byGeneration[9]?.unlocked || 0, total: stats.byGeneration[9]?.total || 120 },
  ];

  const minigameWins = (currentUser as any)?.stats?.arenaWins || 8;

  const PROFILE_REGIONS = [
    {
      id: 'kanto',
      name: 'Kanto',
      gen: 1,
      badgeRange: '#001–#151',
      accentHex: '#10b981',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L4 10C4 14.5 8 18 12 22C16 18 20 14.5 20 10L12 2Z" />
          <path d="M12 2V22" />
        </svg>
      ),
    },
    {
      id: 'johto',
      name: 'Johto',
      gen: 2,
      badgeRange: '#152–#251',
      accentHex: '#f59e0b',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      ),
    },
    {
      id: 'hoenn',
      name: 'Hoenn',
      gen: 3,
      badgeRange: '#252–#386',
      accentHex: '#3b82f6',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12C4 8 8 8 10 12C12 16 16 16 18 12C19 10 21 10 22 12" />
          <path d="M2 17C4 13 8 13 10 17C12 21 16 21 18 17C19 15 21 15 22 17" />
        </svg>
      ),
    },
    {
      id: 'sinnoh',
      name: 'Sinnoh',
      gen: 4,
      badgeRange: '#387–#493',
      accentHex: '#06b6d4',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" />
          <line x1="22" y1="8.5" x2="12" y2="15.5" />
          <line x1="2" y1="8.5" x2="12" y2="15.5" />
        </svg>
      ),
    },
    {
      id: 'unova',
      name: 'Unova',
      gen: 5,
      badgeRange: '#494–#649',
      accentHex: '#64748b',
      iconBg: 'bg-slate-100 text-slate-600 border-slate-300',
      renderIcon: () => (
        <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'kalos',
      name: 'Kalos',
      gen: 6,
      badgeRange: '#650–#721',
      accentHex: '#6366f1',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v18" />
          <path d="M12 7c3-3 8-1 8 4 0 5-8 10-8 10S4 16 4 11c0-5 5-7 8-4z" />
        </svg>
      ),
    },
    {
      id: 'alola',
      name: 'Alola',
      gen: 7,
      badgeRange: '#722–#809',
      accentHex: '#f97316',
      iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      id: 'galar',
      name: 'Galar',
      gen: 8,
      badgeRange: '#810–#898',
      accentHex: '#0ea5e9',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
          <path d="M12 6v12" />
        </svg>
      ),
    },
    {
      id: 'paldea',
      name: 'Paldea',
      gen: 9,
      badgeRange: '#906–#1025',
      accentHex: '#a855f7',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      renderIcon: () => (
        <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          <path d="M2 9h20" />
          <path d="M10 21l-4-12 6-6 6 6-4 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-7 sm:space-y-8 pb-6 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <User className="w-5 h-5" />
          </div>
          <span>Trainer Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Official Pokémon League Trainer Card, regional certifications, and personal custom preferences.
        </p>
      </div>

      {/* Holographic Trainer ID Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-8 text-white shadow-xl border border-slate-700/80">
        {/* Glow backdrop effects with dynamic partner type bloom */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-all duration-700 opacity-30"
          style={{ backgroundColor: partnerBloomHex }}
        />
        <div
          className="absolute top-8 right-8 w-60 h-60 rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-20"
          style={{ backgroundColor: partnerBloomHex }}
        />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-slate-700/80">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar Pill */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg shadow-red-600/30 border-2 border-white/30 shrink-0 font-mono select-none">
              {userInitials}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-white truncate">
                  {firstName} {lastName || ''}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                ID: #{String(currentUser?.id || '1042').padStart(6, '0')} • @{currentUser?.username}
              </p>
              <p className="text-xs text-slate-300 max-w-md pt-0.5 line-clamp-2 leading-relaxed">
                "{bio}"
              </p>
            </div>
          </div>

          {/* Partner Pokémon Showcase */}
          {partnerPokemon && (
            <div
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner shrink-0 self-stretch sm:self-auto justify-between sm:justify-start transition-all"
              style={{ borderColor: `${partnerBloomHex}40` }}
            >
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Lead Partner
                  </span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-bold capitalize text-white shadow-2xs"
                    style={{ backgroundColor: partnerBloomHex }}
                  >
                    {partnerPrimaryType.charAt(0).toUpperCase() + partnerPrimaryType.slice(1)}
                  </span>
                </div>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {partnerPokemon.displayName}
                </span>
                <span className="text-[10px] font-mono font-semibold block" style={{ color: partnerBloomHex }}>
                  #{String(partnerPokemon.id).padStart(4, '0')}
                </span>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full blur-xs opacity-40"
                  style={{ backgroundColor: partnerBloomHex }}
                />
                <img
                  src={partnerPokemon.spriteUrl}
                  alt={partnerPokemon.displayName}
                  className="w-12 h-12 object-contain drop-shadow-md relative z-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Trainer Card Stats Bar */}
        <div className="relative z-10 pt-5 sm:pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pokédex Discovery
            </span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {stats.totalUnlocked} <span className="text-xs text-slate-400 font-normal">/ 1,025</span>
            </span>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRatePercent}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Minigame Trophies
            </span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              {minigameWins} <span className="text-xs text-slate-400 font-normal">Wins</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Top Streak: 5 in a row
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Home Region
            </span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {favoriteRegion}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Primary Specialty
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Type Mastery
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold text-white capitalize shadow-2xs"
                style={{ backgroundColor: POKEMON_TYPE_THEMES[favoriteType]?.accentHex || '#e11d48' }}
              >
                {favoriteType.charAt(0).toUpperCase() + favoriteType.slice(1)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Affinity Specialty
            </span>
          </div>
        </div>
      </div>

      {/* Regional Exploration Badges Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CompassIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Regional Discovery Progress</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live species unlocked across all 9 canonical Pokémon regions
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            {stats.totalUnlocked} / 1,025 Total
          </span>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PROFILE_REGIONS.map((r) => {
            const count = stats.byGeneration[r.gen]?.unlocked || 0;
            const total = stats.byGeneration[r.gen]?.total || 100;
            const pct = Math.round((count / total) * 100);

            return (
              <div
                key={r.id}
                className="relative overflow-hidden p-4 pl-4.5 sm:pl-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all space-y-3 group isolate"
              >
                {/* Left Line Wave Accent (Signature Regional Contour) */}
                <div className="absolute inset-y-0 left-0 w-8 pointer-events-none overflow-hidden select-none z-0">
                  {/* Secondary Translucent Wave Accent */}
                  <svg
                    className="absolute inset-y-0 left-0 h-full w-6.5 opacity-35 pointer-events-none transition-transform duration-500 group-hover:scale-x-115 origin-left"
                    viewBox="0 0 30 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,0 C 16,20 22,45 14,70 C 8,85 15,95 0,100 Z"
                      fill={r.accentHex}
                    />
                  </svg>

                  {/* Primary Foreground Line Accent */}
                  <svg
                    className="absolute inset-y-0 left-0 h-full w-3.5 opacity-90 pointer-events-none transition-transform duration-500 group-hover:scale-x-115 origin-left"
                    viewBox="0 0 20 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,0 C 12,18 15,45 7,72 C 4,86 10,96 0,100 Z"
                      fill={r.accentHex}
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${r.iconBg}`}>
                      {r.renderIcon()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>{r.name}</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">Gen {r.gen}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">{r.badgeRange}</span>
                    </div>
                  </div>

                  <span
                    className="text-xs font-mono font-black shrink-0"
                    style={{ color: pct > 0 ? r.accentHex : '#94a3b8' }}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">{count}</strong> registered
                    </span>
                    <span>{total} total</span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: r.accentHex,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trainer Profile Information Edit Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Edit Trainer Information</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your public trainer card details, featured partner, and preference affinities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
            />
          </div>

          {/* Lead Partner Pokémon Autocomplete Search Input */}
          <div className="space-y-1.5 sm:col-span-2 relative" ref={partnerInputRef}>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Lead Partner Pokémon</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                {unlockedPokemonList.length > 0
                  ? `${unlockedPokemonList.length} registered in Pokédex`
                  : 'Type to search species'}
              </span>
            </label>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={partnerSearchInput}
                onFocus={() => setIsPartnerDropdownOpen(true)}
                onChange={(e) => {
                  setPartnerSearchInput(e.target.value);
                  setIsPartnerDropdownOpen(true);
                }}
                placeholder="Type a Pokémon name or #ID..."
                className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
              />
              {partnerPokemon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white capitalize shadow-2xs"
                    style={{ backgroundColor: partnerBloomHex }}
                  >
                    {partnerPrimaryType.charAt(0).toUpperCase() + partnerPrimaryType.slice(1)}
                  </span>
                  <img
                    src={partnerPokemon.spriteUrl}
                    alt={partnerPokemon.displayName}
                    className="w-6 h-6 object-contain drop-shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* Autocomplete Dropdown Popup */}
            {isPartnerDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl divide-y divide-slate-100 dark:divide-slate-800 p-1">
                {partnerOptions.length > 0 ? (
                  partnerOptions.map((p) => {
                    const isSelected = p.id === selectedPartnerId;
                    const pPrimaryType = p.types[0] || 'normal';

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPartnerId(p.id);
                          setPartnerSearchInput(p.displayName);
                          setIsPartnerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.spriteUrl}
                            alt={p.displayName}
                            className="w-8 h-8 object-contain drop-shadow-2xs"
                          />
                          <div>
                            <div className="text-xs font-bold">{p.displayName}</div>
                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              #{String(p.id).padStart(4, '0')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {p.types.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white capitalize shadow-2xs"
                              style={{ backgroundColor: POKEMON_TYPE_THEMES[t]?.accentHex || '#94a3b8' }}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    No species match "{partnerSearchInput}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Favorite Region</label>
            <div className="relative">
              <select
                value={favoriteRegion}
                onChange={(e) => setFavoriteRegion(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium cursor-pointer appearance-none"
              >
                {REGIONS.map((r) => (
                  <option key={r.name} value={r.name} className="dark:bg-slate-800">
                    {r.name} (Gen {r.gen})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Favorite Type Specialty</label>
            <div className="relative">
              <select
                value={favoriteType}
                onChange={(e) => setFavoriteType(e.target.value as PokemonType)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium cursor-pointer appearance-none capitalize"
              >
                {Object.keys(POKEMON_TYPE_THEMES).map((type) => (
                  <option key={type} value={type} className="capitalize dark:bg-slate-800">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Trainer Bio / Motto</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium resize-none leading-relaxed"
              placeholder="Write a brief motto about your Pokémon journey..."
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className={`text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-opacity ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
            <Check className="w-4 h-4" />
            <span>Trainer Card details updated successfully!</span>
          </span>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-red-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Compass helper icon
function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export default ProfilePage;
