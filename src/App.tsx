import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PokedexProvider, usePokedex } from './context/PokedexContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  ArrowRight,
  Trophy,
  LogOut,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { POKEMON_TYPE_THEMES } from './styles/theme';
import { GENDER_ICON_COLORS } from './types/user';
import { useHotkeys } from './hooks/useHotkeys';

type ViewMode = 'landing' | 'login' | 'app';

function AuthenticatedWorkspace({ onLogOut, onReturnToLanding }: { onLogOut: () => void; onReturnToLanding: () => void }) {
  const { currentUser, switchUser, availableUsers, isPlayer, isAdmin } = useAuth();
  const {
    unlockedIds,
    registerByQuery,
    selectedPokemon,
    isModalOpen,
    openDetailModal,
    closeDetailModal,
    stats,
    allPokemon,
  } = usePokedex();

  const [inputQuery, setInputQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  useHotkeys('Escape', () => {
    if (isModalOpen) {
      closeDetailModal();
    }
  });

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const res = registerByQuery(inputQuery);
    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setInputQuery('');
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  };

  const currentTheme = selectedPokemon
    ? POKEMON_TYPE_THEMES[selectedPokemon.types[0]]
    : POKEMON_TYPE_THEMES.fire;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToLanding}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Return to Public Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center font-black text-lg shadow-md shadow-rose-200">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
                  Pokellects
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {isAdmin ? 'Admin Session' : 'Trainer Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Account Switcher & Log Out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {availableUsers.map((user) => {
                const isActive = currentUser?.id === user.id;
                const genderMeta = GENDER_ICON_COLORS[user.gender];
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => switchUser(user.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${genderMeta.bg} ${genderMeta.text}`}
                    >
                      {user.gender === 'male' ? '♂' : user.gender === 'female' ? '♀' : '✦'}
                    </span>
                    <span>{user.firstName}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onLogOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Profile Card & Stats */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Trainer
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                @{currentUser?.username}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {currentUser?.firstName} {currentUser?.lastName || ''}
            </h2>
            <p className="text-xs text-slate-500">
              {isAdmin
                ? `Administrator • Department: ${(currentUser as any)?.department}`
                : "Personal Pokédex registrations are persistently saved in your trainer vault."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-[11px] font-medium text-slate-500 block">Registered</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.totalUnlocked}
              </span>
              <span className="text-[10px] text-slate-400">/ 1,025</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-[11px] font-medium text-slate-500 block">Completion</span>
              <span className="text-2xl font-extrabold text-rose-600">
                {stats.completionRatePercent}%
              </span>
              <span className="text-[10px] text-slate-400">National Dex</span>
            </div>
          </div>
        </section>

        {/* Continuous Floating Registration Input */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-slate-900">
                Register a Pokémon to your Pokédex
              </h3>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Autofocused • Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border text-[11px]">Enter</kbd> to submit
            </span>
          </div>

          <form onSubmit={handleRegister} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder='Enter Pokémon name (e.g. "Nidoran", "Tauros", "Porygon Z", "Mr. Mime", "Charizard")...'
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm cursor-pointer shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
            >
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                feedback.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* Current Pokédex Grid */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Registered Pokémon ({unlockedIds.length} Unlocked)
            </h3>
            <span className="text-xs text-slate-500">
              Click any card to inspect full details
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allPokemon.map((poke) => {
              const isUnlocked = unlockedIds.includes(poke.id);
              const theme = POKEMON_TYPE_THEMES[poke.types[0]];

              if (!isUnlocked) {
                return (
                  <div
                    key={poke.id}
                    className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center text-center opacity-60"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{String(poke.id).padStart(4, '0')}
                    </span>
                    <div className="w-16 h-16 flex items-center justify-center my-1 filter brightness-0 opacity-15">
                      <img
                        src={poke.spriteUrl}
                        alt="Undiscovered"
                        className="w-14 h-14 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-400">???</span>
                  </div>
                );
              }

              return (
                <button
                  key={poke.id}
                  type="button"
                  onClick={() => openDetailModal(poke)}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center justify-between text-center cursor-pointer group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: theme.accentHex }}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    #{String(poke.id).padStart(4, '0')}
                  </span>
                  <div className="w-16 h-16 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                    <img
                      src={poke.spriteUrl}
                      alt={poke.displayName}
                      className="w-16 h-16 object-contain drop-shadow-xs"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-full">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {poke.displayName}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {poke.types.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider text-white"
                          style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Pokémon Detail Modal */}
      {isModalOpen && selectedPokemon && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: currentTheme.accentHex }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 block">
                  #{String(selectedPokemon.id).padStart(4, '0')}
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {selectedPokemon.displayName}
                </h3>
                <span className="text-xs font-medium text-slate-500">
                  {selectedPokemon.genus}
                </span>
              </div>
              <button
                type="button"
                onClick={closeDetailModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Press Escape to close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-2 relative z-10">
              <img
                src={selectedPokemon.spriteUrl}
                alt={selectedPokemon.displayName}
                className="w-40 h-40 object-contain drop-shadow-md hover:scale-105 transition-transform"
              />

              <div className="flex items-center gap-2 mt-3">
                {selectedPokemon.types.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: POKEMON_TYPE_THEMES[t].accentHex }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {selectedPokemon.cryUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const audio = new Audio(selectedPokemon.cryUrl);
                    audio.volume = 0.6;
                    audio.play().catch(() => {});
                  }}
                  className="mt-3 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Play Cry</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic relative z-10">
              "{selectedPokemon.flavorText}"
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">Esc</kbd> to return to search</span>
              <button
                type="button"
                onClick={closeDetailModal}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer transition-all"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-center text-xs text-slate-500">
        <p>Pokellects • Personal Pokédex & Collection System</p>
      </footer>
    </div>
  );
}

function MainApp() {
  const { currentUser, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');

  // Reset scroll whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleLoginSuccess = () => {
    setCurrentView('app');
  };

  const handleLogOut = () => {
    logout();
    setCurrentView('landing');
  };

  return (
    <AnimatePresence mode="wait">
      {currentView === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.995 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <LandingPage onNavigateToLogin={handleNavigateToLogin} />
        </motion.div>
      )}

      {currentView === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.995 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <LoginPage
            onBackToLanding={handleBackToLanding}
            onLoginSuccess={handleLoginSuccess}
          />
        </motion.div>
      )}

      {currentView === 'app' && (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.995 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <AuthenticatedWorkspace
            onLogOut={handleLogOut}
            onReturnToLanding={handleBackToLanding}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <PokedexProvider>
        <MainApp />
      </PokedexProvider>
    </AuthProvider>
  );
}

export default App;
