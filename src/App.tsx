import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PokedexProvider } from './context/PokedexContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import { SmoothScrollProvider, globalScrollToTop } from './context/SmoothScrollContext';
import PokeballChalkMark from './components/common/PokeballChalkMark';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppShell, { WorkspaceTab } from './components/common/AppShell';
import DashboardPage from './pages/DashboardPage';
import PokedexPage from './pages/PokedexPage';
import MinigamesPage from './pages/MinigamesPage';
import ReportsPage from './pages/ReportsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';
import AdminConfigPage from './pages/Admin/AdminConfigPage';

const tabPaths: Record<WorkspaceTab, string> = {
  dashboard: '/vault/dashboard', pokedex: '/vault/pokedex', arena: '/vault/minigames', reports: '/vault/analytics', achievements: '/vault/achievements', settings: '/vault/settings', profile: '/vault/profile',
  'admin-dashboard': '/admin/dashboard', 'admin-users': '/admin/users', 'admin-analytics': '/admin/analytics', 'admin-config': '/admin/settings',
};
const pathTabs = Object.fromEntries(Object.entries(tabPaths).map(([tab, path]) => [path, tab as WorkspaceTab]));
const defaultPath = (isAdmin: boolean) => isAdmin ? tabPaths['admin-dashboard'] : tabPaths.dashboard;
const isVaultPath = (path: string) => path.startsWith('/vault/') || path.startsWith('/admin/');

function LoadingHandoff() {
  const { isDark } = useTheme();
  return <div className="min-h-screen flex flex-col items-center justify-center gap-4 transition-colors duration-200" style={{ backgroundColor: isDark ? '#020617' : '#f8fafc', color: isDark ? '#f8fafc' : '#1e293b' }}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}><PokeballChalkMark status="newly-registered" size="md" animateStamp={false} className="[&>div:first-child]:hidden" /></motion.div><div className="text-center"><p className="font-bold">Opening your Trainer Vault</p><p className="mt-1 text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Restoring your Pokédex progress…</p></div></div>;
}

function AuthenticatedWorkspace({ activeTab, onTabChange, onReturnToLanding }: { activeTab: WorkspaceTab; onTabChange: (tab: WorkspaceTab) => void; onReturnToLanding: () => void }) {
  return <AppShell activeTab={activeTab} onTabChange={onTabChange} onReturnToLanding={onReturnToLanding}>
    {activeTab === 'dashboard' && <DashboardPage onNavigate={onTabChange} />}
    {activeTab === 'pokedex' && <PokedexPage />}{activeTab === 'arena' && <MinigamesPage />}{activeTab === 'reports' && <ReportsPage />}{activeTab === 'achievements' && <AchievementsPage />}{activeTab === 'settings' && <SettingsPage />}{activeTab === 'profile' && <ProfilePage />}
    {activeTab === 'admin-dashboard' && <AdminDashboardPage onNavigate={onTabChange} />}{activeTab === 'admin-users' && <AdminUsersPage />}{activeTab === 'admin-analytics' && <AdminAnalyticsPage />}{activeTab === 'admin-config' && <AdminConfigPage />}
  </AppShell>;
}

function MainApp() {
  const { currentUser, isAdmin, isLoading } = useAuth();
  const [path, setPath] = useState(() => window.location.pathname);
  const activeTab = pathTabs[path];
  const navigate = (nextPath: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath);
    setPath(nextPath); globalScrollToTop(true);
  };

  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState); }, []);
  useEffect(() => {
    if (isLoading) return;
    // The public landing page remains available after sign-in; only the dedicated
    // login route is skipped for an authenticated trainer or administrator.
    if (currentUser && path === '/login') navigate(defaultPath(isAdmin), true);
    if (!currentUser && isVaultPath(path)) navigate('/login', true);
    if (currentUser && activeTab && (isAdmin !== activeTab.startsWith('admin-'))) navigate(defaultPath(isAdmin), true);
  }, [currentUser, isAdmin, isLoading, path]);

  // The public home page should always be immediately browsable. The handoff
  // loader is reserved for authenticated vault and admin destinations.
  if (isLoading && path !== '/') return <LoadingHandoff />;
  if (currentUser && activeTab) return <AuthenticatedWorkspace activeTab={activeTab} onTabChange={(tab) => navigate(tabPaths[tab])} onReturnToLanding={() => navigate('/')} />;
  if (currentUser && path !== '/') return <LoadingHandoff />;

  return <div className="min-h-screen w-full bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100"><AnimatePresence mode="wait">
    {path === '/login' ? <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoginPage onBackToLanding={() => navigate('/')} onLoginSuccess={() => {}} /></motion.div>
      : <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LandingPage
            onNavigateToLogin={() => navigate(currentUser ? defaultPath(isAdmin) : '/login')}
            onNavigateToMinigames={() => navigate(currentUser ? tabPaths.arena : '/login')}
          />
        </motion.div>}
  </AnimatePresence></div>;
}

function App() { return <AuthProvider><ThemeProvider><SmoothScrollProvider><PokedexProvider><MainApp /></PokedexProvider></SmoothScrollProvider></ThemeProvider></AuthProvider>; }
export default App;
