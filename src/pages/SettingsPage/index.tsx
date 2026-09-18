import React, { useState } from 'react';
import {
  Settings,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Save,
  Check,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();

  // 1. Minigames View Mode (Grid vs Row) Draft
  const [minigamesView, setMinigamesView] = useState<'grid' | 'row'>(() => {
    return (localStorage.getItem('pokellects_minigames_view') as 'grid' | 'row') || 'grid';
  });

  // 2. Appearance Theme (Light vs Dark) Draft
  const [appearance, setAppearance] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('pokellects_theme') as 'light' | 'dark') || 'light';
  });

  // 3. Audio Cries & SFX Draft
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pokellects_sound_enabled') !== 'false';
  });

  // 4. Reduced Motion Draft
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('pokellects_reduced_motion') === 'true';
  });

  const [savedToast, setSavedToast] = useState(false);

  // Save and Apply All Preferences
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Minigames View Mode
    localStorage.setItem('pokellects_minigames_view', minigamesView);

    // 2. Theme
    localStorage.setItem('pokellects_theme', appearance);
    if (appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 3. Sound
    localStorage.setItem('pokellects_sound_enabled', String(soundEnabled));

    // 4. Reduced Motion
    localStorage.setItem('pokellects_reduced_motion', String(reducedMotion));

    // Show save indicator
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-7 sm:space-y-8 pb-6 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-xs shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <span>Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Configure display preferences, appearance mode, and game behaviors.
        </p>
      </div>

      {/* Save Notification Toast */}
      {savedToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 transition-all">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Display configurations saved and applied to your environment!</span>
        </div>
      )}

      {/* 1. DISPLAY CONFIGURATIONS */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Display Configurations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize how minigames, cards, and UI themes appear across the app.
          </p>
        </div>

        {/* Setting 1: Minigames Default Layout (Grid vs Row) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Default View in Minigames
            </span>
            <span className="text-[11px] text-slate-500 block">
              Choose whether Minigames launcher cards render as a 2x2 Grid or stacked Rows.
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setMinigamesView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                minigamesView === 'grid'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid (2x2)</span>
            </button>
            <button
              type="button"
              onClick={() => setMinigamesView('row')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                minigamesView === 'row'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Row / List</span>
            </button>
          </div>
        </div>

        {/* Setting 2: Appearance (Light vs Dark) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Appearance Theme
            </span>
            <span className="text-[11px] text-slate-500 block">
              Select your preferred visual aesthetic theme for day or night sessions.
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setAppearance('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appearance === 'light'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setAppearance('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appearance === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Setting 3: Audio & Sound Effects */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Audio Cries & Sound Effects
            </span>
            <span className="text-[11px] text-slate-500 block">
              Play genuine Pokémon audio cries on card inspection and minigame sound trials.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              soundEnabled ? 'bg-red-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                soundEnabled ? 'translate-x-6 left-0.5' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Setting 4: Reduced Motion */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Reduced Motion & Dynamic Transitions
            </span>
            <span className="text-[11px] text-slate-500 block">
              Minimize sliding card animations and smooth scroll transitions for high efficiency.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              reducedMotion ? 'bg-red-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                reducedMotion ? 'translate-x-6 left-0.5' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Save Preferences Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-xs font-semibold text-emerald-600 flex items-center gap-1.5 transition-opacity ${savedToast ? 'opacity-100' : 'opacity-0'}`}>
            <Check className="w-4 h-4" />
            <span>Preferences saved successfully!</span>
          </span>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
