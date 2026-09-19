import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import storageService from '../../services/storageService';
import { useDatabaseVersion } from '../../hooks/useDatabaseVersion';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const databaseVersion = useDatabaseVersion();

  // 1. Minigames View Mode (Grid vs Row) Draft
  const [minigamesView, setMinigamesView] = useState<'grid' | 'row'>('grid');

  // 2. Appearance Theme (Light vs Dark) Draft
  const [appearance, setAppearance] = useState<'light' | 'dark'>(theme);

  useEffect(() => {
    setAppearance(theme);
  }, [theme]);

  // 3. Audio Cries & SFX Draft
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 4. Reduced Motion Draft
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const settings = storageService.getUserSettings(currentUser.id);
    setMinigamesView(settings.minigamesView);
    setSoundEnabled(settings.soundEnabled);
    setReducedMotion(settings.reducedMotion);
    setAppearance(settings.theme);
  }, [currentUser?.id, databaseVersion]);

  // Save and Apply All Preferences
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    storageService.updateUserSettings(currentUser.id, {
      theme: appearance,
      minigamesView,
      soundEnabled,
      reducedMotion,
    });

    setTheme(appearance);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2500);

  };

  return (
    <div className="space-y-7 sm:space-y-8 pb-6 w-full">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white shadow-xs shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <span>Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Configure display preferences, appearance mode, and game behaviors.
        </p>
      </div>

      {/* 1. DISPLAY CONFIGURATIONS */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5 sm:space-y-6"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Display Configurations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalize how minigames, cards, and UI themes appear across the app.
          </p>
        </div>

        {/* Setting 1: Minigames Default Layout (Grid vs Row) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Default View in Minigames
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Choose whether Minigames launcher cards render as a 2x2 Grid or stacked Rows.
            </span>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setMinigamesView('grid')}
              className={`flex flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                minigamesView === 'grid'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid (2x2)</span>
            </button>
            <button
              type="button"
              onClick={() => setMinigamesView('row')}
              className={`flex flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                minigamesView === 'row'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Row / List</span>
            </button>
          </div>
        </div>

        {/* Setting 2: Appearance (Light vs Dark) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Appearance Theme
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Select your preferred visual aesthetic theme for day or night sessions.
            </span>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => {
                setAppearance('light');
              }}
              className={`flex flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appearance === 'light'
                  ? 'bg-amber-500 dark:bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAppearance('dark');
              }}
              className={`flex flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appearance === 'dark'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Setting 3: Audio & Sound Effects */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Audio Cries & Sound Effects
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Play genuine Pokémon audio cries on card inspection and minigame sound trials.
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              soundEnabled ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Setting 4: Reduced Motion */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Reduced Motion & Dynamic Transitions
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Minimize sliding card animations and smooth scroll transitions for high efficiency.
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              reducedMotion ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save Preferences Action Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <span className={`text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-opacity ${savedToast ? 'opacity-100' : 'opacity-0'}`}>
            <Check className="w-4 h-4" />
            <span>Preferences saved successfully!</span>
          </span>
          <button
            type="submit"
            className="w-full sm:w-auto justify-center px-5 py-3 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 sm:ml-auto"
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
