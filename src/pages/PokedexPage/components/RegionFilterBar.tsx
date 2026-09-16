import React from 'react';
import { Globe, MapPin } from 'lucide-react';

export type RegionId =
  | 'national'
  | 'kanto'
  | 'johto'
  | 'hoenn'
  | 'sinnoh'
  | 'unova'
  | 'kalos'
  | 'alola'
  | 'galar'
  | 'hisui'
  | 'paldea'
  | 'lumiose';

export interface RegionIdentity {
  id: RegionId;
  name: string;
  subtitle: string;
  blurb: string;
  era: string;
  badgeRange: string;
  // Unique signature styling
  idleStyle: string;
  activeStyle: string;
  iconBg: string;
  accentHex: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
}

export const REGIONS: RegionIdentity[] = [
  {
    id: 'national',
    name: 'National',
    subtitle: 'Universal Discovery Ledger',
    blurb: 'The master archive chronicling every recorded species across all habitats, leagues, and eras of Pokémon discovery.',
    era: 'Global',
    badgeRange: '1–1,025',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-red-300 hover:bg-red-50/40',
    activeStyle: 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-transparent shadow-md shadow-red-600/25 ring-2 ring-red-500/20',
    iconBg: 'bg-red-50 text-red-500',
    accentHex: '#ef4444',
    renderIcon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-red-500'}`} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M 2 12 H 22" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" fill={active ? '#dc2626' : 'white'} stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'kanto',
    name: 'Kanto',
    subtitle: 'The Genesis of Champions',
    blurb: 'Where journeys first ignited. Verdant forests, sleepy coastal breeze, and the nostalgic dawn of Pokémon mastery from Pallet Town to Indigo Plateau.',
    era: 'Gen 1',
    badgeRange: '#001–#151',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40',
    activeStyle: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-transparent shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20',
    iconBg: 'bg-emerald-50 text-emerald-600',
    accentHex: '#10b981',
    renderIcon: (active) => (
      /* Oak Leaf / Pallet Genesis emblem */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-emerald-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L4 10C4 14.5 8 18 12 22C16 18 20 14.5 20 10L12 2Z" />
        <path d="M12 2V22" />
      </svg>
    ),
  },
  {
    id: 'johto',
    name: 'Johto',
    subtitle: 'Ancient Traditions & Sacred Spires',
    blurb: 'Steeped in sacred folklore, historic pagodas, and whispering golden maples under the legendary wings of the Rainbow and Silver guardians.',
    era: 'Gen 2',
    badgeRange: '#152–#251',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-amber-300 hover:bg-amber-50/40',
    activeStyle: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white border-transparent shadow-md shadow-amber-500/25 ring-2 ring-amber-500/20',
    iconBg: 'bg-amber-50 text-amber-600',
    accentHex: '#f59e0b',
    renderIcon: (active) => (
      /* Bell Tower / Ho-Oh feather sacred bell */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-amber-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    id: 'hoenn',
    name: 'Hoenn',
    subtitle: 'Archipelago of Land & Ocean',
    blurb: 'A lush tropical paradise shaped by active volcanic fissures, boundless azure sea routes, and the timeless clashes of primal titans.',
    era: 'Gen 3',
    badgeRange: '#252–#386',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-300 hover:bg-blue-50/40',
    activeStyle: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white border-transparent shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20',
    iconBg: 'bg-blue-50 text-blue-600',
    accentHex: '#3b82f6',
    renderIcon: (active) => (
      /* Land & Ocean wave crest */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-blue-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12C4 8 8 8 10 12C12 16 16 16 18 12C19 10 21 10 22 12" />
        <path d="M2 17C4 13 8 13 10 17C12 21 16 21 18 17C19 15 21 15 22 17" />
      </svg>
    ),
  },
  {
    id: 'sinnoh',
    name: 'Sinnoh',
    subtitle: 'Realm of Creation & Timeless Peaks',
    blurb: 'Crowned by the eternal snows of Mount Coronet, where primordial legends of time, space, and origin linger across quiet northern plains.',
    era: 'Gen 4',
    badgeRange: '#387–#493',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-cyan-300 hover:bg-cyan-50/40',
    activeStyle: 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-sky-700 text-white border-transparent shadow-md shadow-cyan-600/25 ring-2 ring-cyan-500/20',
    iconBg: 'bg-cyan-50 text-cyan-600',
    accentHex: '#06b6d4',
    renderIcon: (active) => (
      /* Diamond / Spear Pillar star */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    subtitle: 'Metropolis of Ideals & Truth',
    blurb: 'A soaring metropolitan fusion of glittering skyscrapers, sprawling suspension bridges, and diverse biomes woven together by ideals and truth.',
    era: 'Gen 5',
    badgeRange: '#494–#649',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-400 hover:bg-slate-50',
    activeStyle: 'bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-700 text-white border-transparent shadow-md shadow-slate-900/30 ring-2 ring-slate-700/20',
    iconBg: 'bg-slate-100 text-slate-600',
    accentHex: '#64748b',
    renderIcon: (active) => (
      /* Yin Yang / Castelia Bridge architecture */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10" />
        <circle cx="12" cy="7" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'kalos',
    name: 'Kalos',
    subtitle: 'Elegance, Beauty & Radiant Wonder',
    blurb: 'A realm of haute couture, romantic châteaux, and artistic splendor radiating outward from the glowing spire of the City of Light.',
    era: 'Gen 6',
    badgeRange: '#650–#721',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40',
    activeStyle: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white border-transparent shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20',
    iconBg: 'bg-indigo-50 text-indigo-600',
    accentHex: '#6366f1',
    renderIcon: (active) => (
      /* Stained Glass Fleur / Mega stone helix */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-indigo-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18" />
        <path d="M12 7c3-3 8-1 8 4 0 5-8 10-8 10S4 16 4 11c0-5 5-7 8-4z" />
      </svg>
    ),
  },
  {
    id: 'alola',
    name: 'Alola',
    subtitle: 'Sun-Drenched Island Trials',
    blurb: 'A warm tropical archipelago ringed by crystal reefs, island guardians, and the welcoming spirit of the trials under celestial sun and moon.',
    era: 'Gen 7',
    badgeRange: '#722–#809',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-orange-300 hover:bg-orange-50/40',
    activeStyle: 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 text-white border-transparent shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20',
    iconBg: 'bg-orange-50 text-orange-600',
    accentHex: '#f97316',
    renderIcon: (active) => (
      /* Solgaleo Sunburst & Lunala Crescent */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-orange-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    subtitle: 'Stadium Spectacles & Industrial Might',
    blurb: 'Roaring crowds, rolling pastoral highlands, and steam-driven industrial majesty fueling elite league battles with colossal Dynamax energy.',
    era: 'Gen 8',
    badgeRange: '#810–#898',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-sky-300 hover:bg-sky-50/40',
    activeStyle: 'bg-gradient-to-r from-sky-600 via-blue-700 to-fuchsia-600 text-white border-transparent shadow-md shadow-sky-600/25 ring-2 ring-sky-500/20',
    iconBg: 'bg-sky-50 text-sky-600',
    accentHex: '#0ea5e9',
    renderIcon: (active) => (
      /* Sword & Shield / Stadium Crown */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-sky-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
        <path d="M12 6v12" />
      </svg>
    ),
  },
  {
    id: 'hisui',
    name: 'Hisui',
    subtitle: 'The Feudal Frontier of Exploration',
    blurb: 'An untamed ancient wilderness, where early surveyors crafted wooden Spheres beneath the mysterious space-time rift above Mount Coronet.',
    era: 'Legends',
    badgeRange: '#899–#905',
    idleStyle: 'bg-white border-amber-800/20 text-stone-800 hover:border-amber-600/40 hover:bg-amber-50/40',
    activeStyle: 'bg-gradient-to-r from-amber-900 via-stone-800 to-teal-900 text-white border-transparent shadow-md shadow-stone-800/30 ring-2 ring-amber-700/20',
    iconBg: 'bg-amber-50 text-amber-700',
    accentHex: '#d97706',
    renderIcon: (active) => (
      /* Ancient Wooden Poké Ball / Survey Corps seal */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-amber-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    ),
  },
  {
    id: 'paldea',
    name: 'Paldea',
    subtitle: 'Crystalline Valleys & Terastal Radiance',
    blurb: 'Sunlit Iberian plateaus, prestigious academy rivalries, and the mystical depths of the Great Crater glistening with Terastal gems.',
    era: 'Gen 9',
    badgeRange: '#906–#1025',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-purple-300 hover:bg-purple-50/40',
    activeStyle: 'bg-gradient-to-r from-red-600 via-purple-600 to-violet-700 text-white border-transparent shadow-md shadow-purple-600/25 ring-2 ring-purple-500/20',
    iconBg: 'bg-purple-50 text-purple-600',
    accentHex: '#a855f7',
    renderIcon: (active) => (
      /* Terastal Crystal Gem */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-purple-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        <path d="M2 9h20" />
        <path d="M10 21l-4-12 6-6 6 6-4 12" />
      </svg>
    ),
  },
  {
    id: 'lumiose',
    name: 'Lumiose',
    subtitle: 'Urban Renaissance & Mega Evolution',
    blurb: 'The electric pulse of Kalos where café culture, avant-garde urban design, and cutting-edge Mega Evolution converge at the Prism Tower.',
    era: 'Z-A',
    badgeRange: 'Kalos City',
    idleStyle: 'bg-white border-slate-200/90 text-slate-800 hover:border-teal-300 hover:bg-teal-50/40',
    activeStyle: 'bg-gradient-to-r from-teal-500 via-cyan-600 to-indigo-700 text-white border-transparent shadow-md shadow-teal-600/25 ring-2 ring-teal-500/20',
    iconBg: 'bg-teal-50 text-teal-600',
    accentHex: '#14b8a6',
    renderIcon: (active) => (
      /* Prism Tower Spire */
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-teal-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l4 10h-8l4-10z" />
        <path d="M7 12l-3 10h16l-3-10" />
        <line x1="12" y1="12" x2="12" y2="22" />
      </svg>
    ),
  },
];

interface RegionFilterBarProps {
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  countsByRegion?: Record<RegionId, number>;
}

export const RegionFilterBar: React.FC<RegionFilterBarProps> = ({
  selectedRegion,
  onSelectRegion,
  countsByRegion,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Header Label */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="font-display tracking-tight text-slate-900 font-bold">Regional Leagues</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 font-semibold">
          12 Regions
        </div>
      </div>

      {/* 2-Row Responsive Grid: 2 rows of 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {REGIONS.map((region) => {
          const isActive = selectedRegion === region.id;
          const count = countsByRegion ? countsByRegion[region.id] : undefined;

          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region.id)}
              className={`p-2.5 rounded-xl border transition-all duration-150 ease-out cursor-pointer flex items-center gap-2.5 select-none text-left relative overflow-hidden group active:scale-[0.98] ${
                isActive
                  ? region.activeStyle
                  : `${region.idleStyle} shadow-2xs`
              }`}
            >
              {/* Regional Identity Emblem */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-white/20 text-white' : region.iconBg
                }`}
              >
                {region.renderIcon(isActive)}
              </div>

              {/* Region Details */}
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display font-black text-xs truncate">
                    {region.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[10px] font-mono font-semibold truncate ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {region.badgeRange}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RegionFilterBar;
