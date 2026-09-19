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
} from 'lucide-react';
import storageService from '../../services/storageService';
import { GameConfiguration, FeatureFlags } from '../../types/game';
import { REGION_METADATA } from '../../services/pokemonIndex';

export const AdminConfigPage: React.FC = () => {
  const [config, setConfig] = useState<GameConfiguration>(() => storageService.getGameConfig());
  const [flags, setFlags] = useState<FeatureFlags>(() => storageService.getFeatureFlags());
  const [savedNotice, setSavedNotice] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const handleSave = () => {
    storageService.updateGameConfig(config);
    storageService.updateFeatureFlags(flags);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all minigame rules and feature flags to factory defaults?')) {
      await storageService.resetToDefaults();
      setConfig(storageService.getGameConfig());
      setFlags(storageService.getFeatureFlags());
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
            Game Configurations & Feature Flags
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Tune minigame parameters, strike limits, timers, generation filters, and runtime system feature toggles.
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
            <h2 className="text-base font-bold">Minigame Rules & Constraints</h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed text-right max-w-xs">
            Rules below reflect current implemented game mechanics.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Who's That Pokémon */}
          <div className="p-4 rounded-2xl border border-purple-200/70 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Who's That Pokémon?</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Mode', value: 'Free-text guess input' },
                { label: 'Attempts', value: 'Unlimited — skip anytime' },
                { label: 'Timer', value: 'None — self-paced' },
                { label: 'Hints', value: 'None' },
                { label: 'Win', value: 'Type exact Pokémon name' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{row.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hangmon */}
          <div className="p-4 rounded-2xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Hangmon</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Mode', value: 'Letter-by-letter keyboard' },
                { label: 'Max Strikes', value: '6 chances' },
                { label: 'Timer', value: 'None — self-paced' },
                { label: 'Hints', value: 'Gen badge · Unique letter count' },
                { label: 'Loss', value: 'Identity stays concealed' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{row.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Identicry */}
          <div className="p-4 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                <HardDrive className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Identicry</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Mode', value: 'Free-text guess input' },
                { label: 'Audio', value: 'Auto-plays on load' },
                { label: 'Replay', value: 'Unlimited (press R)' },
                { label: 'Timer', value: 'None — self-paced' },
                { label: 'Win', value: 'Type exact Pokémon name' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{row.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biolo-gist */}
          <div className="p-4 rounded-2xl border border-teal-200/70 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Biolo-gist</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Mode', value: 'Free-text guess input' },
                { label: 'Clue', value: 'Redacted biology excerpt' },
                { label: 'Source', value: 'Bulbapedia live fetch' },
                { label: 'Timer', value: 'None — self-paced' },
                { label: 'Attempts', value: 'Unlimited — skip anytime' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{row.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminConfigPage;
