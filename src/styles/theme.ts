import { PokemonType } from '../types/pokemon';

export interface TypeColorMeta {
  name: string;
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  accentHex: string;
}

export const POKEMON_TYPE_THEMES: Record<PokemonType, TypeColorMeta> = {
  normal: {
    name: 'Normal',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-200 text-slate-800',
    accentHex: '#94a3b8',
  },
  fire: {
    name: 'Fire',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-500 text-white',
    accentHex: '#f97316',
  },
  water: {
    name: 'Water',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-500 text-white',
    accentHex: '#3b82f6',
  },
  grass: {
    name: 'Grass',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-500 text-white',
    accentHex: '#10b981',
  },
  electric: {
    name: 'Electric',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-400 text-amber-950 font-semibold',
    accentHex: '#f59e0b',
  },
  ice: {
    name: 'Ice',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    badgeBg: 'bg-cyan-400 text-cyan-950',
    accentHex: '#06b6d4',
  },
  fighting: {
    name: 'Fighting',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    badgeBg: 'bg-red-700 text-white',
    accentHex: '#b91c1c',
  },
  poison: {
    name: 'Poison',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-600 text-white',
    accentHex: '#9333ea',
  },
  ground: {
    name: 'Ground',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-300',
    badgeBg: 'bg-amber-600 text-white',
    accentHex: '#d97706',
  },
  flying: {
    name: 'Flying',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    badgeBg: 'bg-indigo-400 text-white',
    accentHex: '#6366f1',
  },
  psychic: {
    name: 'Psychic',
    bg: 'bg-pink-50',
    text: 'text-pink-800',
    border: 'border-pink-200',
    badgeBg: 'bg-pink-500 text-white',
    accentHex: '#ec4899',
  },
  bug: {
    name: 'Bug',
    bg: 'bg-lime-50',
    text: 'text-lime-800',
    border: 'border-lime-200',
    badgeBg: 'bg-lime-600 text-white',
    accentHex: '#65a30d',
  },
  rock: {
    name: 'Rock',
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    border: 'border-stone-300',
    badgeBg: 'bg-stone-500 text-white',
    accentHex: '#78716c',
  },
  ghost: {
    name: 'Ghost',
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    border: 'border-violet-200',
    badgeBg: 'bg-violet-700 text-white',
    accentHex: '#6d28d9',
  },
  dragon: {
    name: 'Dragon',
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
    badgeBg: 'bg-indigo-700 text-white',
    accentHex: '#4338ca',
  },
  steel: {
    name: 'Steel',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-500 text-white',
    accentHex: '#64748b',
  },
  fairy: {
    name: 'Fairy',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-400 text-white',
    accentHex: '#fb7185',
  },
  dark: {
    name: 'Dark',
    bg: 'bg-slate-200',
    text: 'text-slate-900',
    border: 'border-slate-400',
    badgeBg: 'bg-slate-800 text-white',
    accentHex: '#1e293b',
  },
};

export default POKEMON_TYPE_THEMES;
