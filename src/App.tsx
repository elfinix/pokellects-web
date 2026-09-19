import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PokedexProvider } from './context/PokedexContext';
import { ThemeProvider } from './context/ThemeContext';
import { SmoothScrollProvider, globalScrollToTop } from './context/SmoothScrollContext';
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

type ViewMode = 'landing' | 'login' | 'app';

function AuthenticatedWorkspace({ onReturnToLanding }: { onReturnToLanding: () => void }) {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => (currentUser?.role === 'admin' ? 'admin-dashboard' : 'dashboard'));

  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    globalScrollToTop(true);
  };

  // Switch initial tab if user changes role
  useEffect(() => {
    if (isAdmin && (activeTab === 'dashboard')) {
      setActiveTab('admin-dashboard');
    }
  }, [isAdmin]);

  // Scroll to top whenever active tab changes
  useEffect(() => {
    globalScrollToTop(true);
  }, [activeTab]);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onReturnToLanding={onReturnToLanding}
    >
      {activeTab === 'dashboard' && <DashboardPage onNavigate={handleTabChange} />}
      {activeTab === 'pokedex' && <PokedexPage />}
      {activeTab === 'arena' && <MinigamesPage />}
      {activeTab === 'reports' && <ReportsPage />}
      {activeTab === 'achievements' && <AchievementsPage />}
      {activeTab === 'settings' && <SettingsPage />}
      {activeTab === 'profile' && <ProfilePage />}
      {activeTab === 'admin-dashboard' && <AdminDashboardPage onNavigate={handleTabChange} />}
      {activeTab === 'admin-users' && <AdminUsersPage />}
      {activeTab === 'admin-analytics' && <AdminAnalyticsPage />}
      {activeTab === 'admin-config' && <AdminConfigPage />}
    </AppShell>
  );
}

function MainApp() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');

  // If user logs out while in app view, return to login page
  useEffect(() => {
    if (!currentUser && currentView === 'app') {
      setCurrentView('login');
    }
  }, [currentUser, currentView]);

  // Reset scroll whenever view changes
  useEffect(() => {
    globalScrollToTop(true);
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

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-0">
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <LandingPage onNavigateToLogin={handleNavigateToLogin} />
          </motion.div>
        )}

        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <AuthenticatedWorkspace onReturnToLanding={handleBackToLanding} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SmoothScrollProvider>
          <PokedexProvider>
            <MainApp />
          </PokedexProvider>
        </SmoothScrollProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
