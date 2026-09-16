import React, { useState } from 'react';
import { Sliders, Shield, Flag, Check, RotateCcw, Sparkles } from 'lucide-react';
import storageService from '../../services/storageService';
import { GameConfiguration, FeatureFlags } from '../../types/game';

export const AdminConfigPage: React.FC = () => {
  const [config, setConfig] = useState<GameConfiguration>(() => storageService.getGameConfig());
  const [flags, setFlags] = useState<FeatureFlags>(() => storageService.getFeatureFlags());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    storageService.updateGameConfig(config);
    storageService.updateFeatureFlags(flags);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    storageService.resetToDefaults();
    setConfig(storageService.getGameConfig());
    setFlags(storageService.getFeatureFlags());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
            Game Configurations & Feature Flags
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Tune minigame parameters, strike limits, timers, and system feature toggles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Save Toast Feedback */}
      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>System configurations successfully updated and stored in SQLite repository.</span>
        </div>
      )}

      {/* Feature Flags Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Flag className="w-4 h-4 text-purple-600" />
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
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                  <span className="text-[11px] text-slate-400 block">{item.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFlags({ ...flags, [item.key]: !isEnabled })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isEnabled ? 'bg-purple-600' : 'bg-slate-300'
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

      {/* Minigame Configurations */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Sliders className="w-4 h-4 text-purple-600" />
          <h2 className="text-base font-bold">Minigame Rules & Latency</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Who's That Pokémon */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Who's That Pokémon</span>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium block">Timer (Seconds)</label>
              <input
                type="number"
                value={config.whosThatPokemon.timerSeconds}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    whosThatPokemon: { ...config.whosThatPokemon, timerSeconds: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium block">Max Attempts</label>
              <input
                type="number"
                value={config.whosThatPokemon.maxAttempts}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    whosThatPokemon: { ...config.whosThatPokemon, maxAttempts: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Hangmon */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Hangmon Rules</span>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium block">Max Strike Count</label>
              <input
                type="number"
                value={config.hangmon.maxStrikes}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hangmon: { ...config.hangmon, maxStrikes: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium block">Timer (Seconds)</label>
              <input
                type="number"
                value={config.hangmon.timerSeconds}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hangmon: { ...config.hangmon, timerSeconds: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Identicry */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Identicry Audio</span>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium block">Replay Audio Limit</label>
              <input
                type="number"
                value={config.identicry.replayCryLimit}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    identicry: { ...config.identicry, replayCryLimit: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium block">Options Count</label>
              <input
                type="number"
                value={config.identicry.multipleChoiceOptions}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    identicry: { ...config.identicry, multipleChoiceOptions: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigPage;
