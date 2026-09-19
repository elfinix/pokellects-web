import React, { useState } from 'react';
import {
  Sliders,
  Flag,
  Check,
  RotateCcw,
  Layers,
  Sparkles,
  Database,
  HardDrive,
  Moon,
  Sun,
} from 'lucide-react';
import storageService from '../../services/storageService';
import { GameConfiguration, FeatureFlags } from '../../types/game';
import { AdminDisplayConfiguration } from '../../services/storageService';
import { REGION_METADATA } from '../../services/pokemonIndex';

const ToggleRow = ({ label, description, enabled, onToggle }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-t border-slate-200/70 dark:border-slate-800 first:border-t-0 first:pt-0">
    <div>
      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
    <button type="button" onClick={onToggle} aria-pressed={enabled} className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

export const AdminConfigPage: React.FC = () => {
  const [config, setConfig] = useState<GameConfiguration>(() => storageService.getGameConfig());
  const [flags, setFlags] = useState<FeatureFlags>(() => storageService.getFeatureFlags());
  const [displayConfig, setDisplayConfig] = useState<AdminDisplayConfiguration>(() => storageService.getAdminDisplayConfig());
  const [savedNotice, setSavedNotice] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const handleSave = () => {
    storageService.updateGameConfig(config);
    storageService.updateFeatureFlags(flags);
    storageService.updateAdminDisplayConfig(displayConfig);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all minigame rules and feature flags to factory defaults?')) {
      await storageService.resetToDefaults();
      setConfig(storageService.getGameConfig());
      setFlags(storageService.getFeatureFlags());
      setDisplayConfig(storageService.getAdminDisplayConfig());
      setResetNotice(true);
      setTimeout(() => setResetNotice(false), 2500);
    }
  };

  const toggleGeneration = (gen: number) => {
    const currentGens = config.general?.enabledGenerations || [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const exists = currentGens.includes(gen);
    const updated = exists ? currentGens.filter((g) => g !== gen) : [...currentGens, gen].sort();

    // Prevent disabling all generations
    if (updated.length === 0) return;

    setConfig({
      ...config,
      general: {
        ...config.general,
        allowAnyGeneration: updated.length === 9,
        enabledGenerations: updated,
      },
    });
  };

  return (
    <div className="space-y-8 pb-16 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
            Minigames Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Configure each game’s difficulty cues, visual presentation, and Pokémon selection pool.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Save / Reset Toast Feedback */}
      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>System configurations successfully updated and saved to SQLite repository.</span>
        </div>
      )}

      {resetNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Restored factory default configurations and reset feature flags.</span>
        </div>
      )}

      {/* Admin Console Display */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-bold">Display Configuration</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Set the appearance used throughout the Admin Console. This does not change players’ personal display preferences.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {([
            ['light', 'Light mode', 'Bright, standard console appearance', Sun],
            ['dark', 'Night mode', 'Low-light appearance for the Admin Console', Moon],
          ] as const).map(([theme, label, description, Icon]) => {
            const selected = displayConfig.theme === theme;
            return (
              <button
                key={theme}
                type="button"
                onClick={() => setDisplayConfig({ theme })}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${selected ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-xs' : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${selected ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700'}`}><Icon className="w-4 h-4" /></span>
                <span><span className="block text-xs font-bold text-slate-900 dark:text-slate-100">{label}</span><span className="block mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{description}</span></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Flags Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Flag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-bold">Runtime Feature Flags</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {[
            { key: 'enableWhosThatPokemon', label: "Who's That Pokémon Challenge", desc: 'Silhouette reveal minigame' },
            { key: 'enableHangmon', label: 'Hangmon Letter Deduction', desc: 'Letter-by-letter spelling challenge' },
            { key: 'enableIdenticry', label: 'Identicry Audio Quiz', desc: 'Authentic 8-bit & synthesized sound cries' },
            { key: 'enablePokedlePreview', label: 'Pokédle Game Preview', desc: 'Wordle-style multi-criteria matrix' },
            { key: 'enableAudioCries', label: 'Audio Cries Playback', desc: 'Enable speaker button in detail dialogs' },
            { key: 'enableConfetti', label: 'Celebration Confetti', desc: 'Particle burst upon successful registration' },
          ].map((item) => {
            const isEnabled = flags[item.key as keyof FeatureFlags];
            return (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.label}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{item.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFlags({ ...flags, [item.key]: !isEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    isEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generation Scope Toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold">Enabled Pokémon Generations (Minigame Pool)</h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {(config.general?.enabledGenerations || [1, 2, 3, 4, 5, 6, 7, 8, 9]).length} of 9 Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {REGION_METADATA.map((reg) => {
            const enabledGens = config.general?.enabledGenerations || [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const isSelected = enabledGens.includes(reg.generation);
            return (
              <button
                key={reg.generation}
                type="button"
                onClick={() => toggleGeneration(reg.generation)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-200 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">Gen {reg.generation}</span>
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-500' : 'bg-slate-400'}`} />
                </div>
                <div className="text-[11px] font-semibold">{reg.name}</div>
                <div className="text-[10px] opacity-75 font-mono">
                  #{String(reg.startId).padStart(4, '0')}–#{String(reg.endId).padStart(4, '0')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minigame Configurations */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold">Minigames Configuration</h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed text-right max-w-xs">
            Changes are applied to new rounds after you save.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Who's That Pokémon */}
          <div className="p-4 rounded-2xl border border-purple-200/70 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Who's That Pokémon?</span>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Image size</label>
              <div className="grid grid-cols-2 gap-2">
                {(['normal', 'smaller'] as const).map((size) => (
                  <button key={size} type="button" onClick={() => setConfig({ ...config, whosThatPokemon: { ...config.whosThatPokemon, imageSize: size } })} className={`h-11 px-3 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-colors ${((config.whosThatPokemon.imageSize ?? 'normal') === size) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white/70 dark:bg-slate-900/50 border-purple-200 dark:border-purple-800 text-slate-600 dark:text-slate-300'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <ToggleRow label="Hints" description="Show generation and type cues beside the silhouette." enabled={(config.whosThatPokemon.showTypeHint ?? true) || (config.whosThatPokemon.showGenerationHint ?? true)} onToggle={() => {
              const enabled = !((config.whosThatPokemon.showTypeHint ?? true) || (config.whosThatPokemon.showGenerationHint ?? true));
              setConfig({ ...config, whosThatPokemon: { ...config.whosThatPokemon, showTypeHint: enabled, showGenerationHint: enabled } });
            }} />
          </div>

          {/* Hangmon */}
          <div className="p-4 rounded-2xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Hangmon</span>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Max strikes</label>
              <input type="number" min="1" max="12" value={config.hangmon.maxStrikes ?? 6} onChange={(event) => setConfig({ ...config, hangmon: { ...config.hangmon, maxStrikes: Math.min(12, Math.max(1, Number(event.target.value) || 1)) } })} className="w-full h-11 px-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <ToggleRow label="Hints" description="Show generation and unique-letter cues." enabled={config.hangmon.showCategoryHint ?? true} onToggle={() => setConfig({ ...config, hangmon: { ...config.hangmon, showCategoryHint: !(config.hangmon.showCategoryHint ?? true) } })} />
          </div>

          {/* Identicry */}
          <div className="p-4 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                <HardDrive className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Identicry</span>
            </div>
            <ToggleRow label="Hints" description="Show first letter, length, generation, and types." enabled={config.identicry.showHints ?? true} onToggle={() => setConfig({ ...config, identicry: { ...config.identicry, showHints: !(config.identicry.showHints ?? true) } })} />
            </div>

          {/* Biolo-gist */}
          <div className="p-4 rounded-2xl border border-teal-200/70 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Biolo-gist</span>
            </div>
            <ToggleRow label="Hints" description="Show generation and type cues with the excerpt." enabled={config.biologist?.showHints ?? true} onToggle={() => setConfig({ ...config, biologist: { ...(config.biologist ?? { showHints: true }), showHints: !(config.biologist?.showHints ?? true) } })} />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Global Pokémon fetch</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              ['undiscovered', 'Undiscovered only', 'Prioritize species missing from each trainer’s Pokédex.'],
              ['all', 'All Pokémon', 'Allow every species in the configured generation pool.'],
            ] as const).map(([value, label, description]) => (
              <button key={value} type="button" onClick={() => setConfig({ ...config, general: { ...config.general, pokemonFetch: value } })} className={`p-3 rounded-xl text-left border transition-colors cursor-pointer ${((config.general.pokemonFetch ?? 'undiscovered') === value) ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800' : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">{label}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminConfigPage;
