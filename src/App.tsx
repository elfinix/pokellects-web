import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PokedexProvider } from './context/PokedexContext';
import { SmoothScrollProvider, globalScrollToTop } from './context/SmoothScrollContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppShell, { WorkspaceTab } from './components/common/AppShell';
import DashboardPage from './pages/DashboardPage';
import PokedexPage from './pages/PokedexPage';
import ArenaPage from './pages/ArenaPage';
import ReportsPage from './pages/ReportsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminConfigPage from './pages/Admin/AdminConfigPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';

type ViewMode = 'landing' | 'login' | 'app';

function AuthenticatedWorkspace({ onReturnToLanding }: { onReturnToLanding: () => void }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');

  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    globalScrollToTop(true);
  };

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
      {activeTab === 'arena' && <ArenaPage />}
      {activeTab === 'reports' && <ReportsPage />}
      {activeTab === 'achievements' && <AchievementsPage />}
      {activeTab === 'settings' && <SettingsPage />}
      {activeTab === 'profile' && <ProfilePage />}
      {activeTab === 'admin-config' && <AdminConfigPage />}
      {activeTab === 'admin-users' && <AdminUsersPage />}
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
    <AnimatePresence mode="wait">
      {currentView === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <LandingPage onNavigateToLogin={handleNavigateToLogin} />
        </motion.div>
      )}

      {currentView === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <AuthenticatedWorkspace onReturnToLanding={handleBackToLanding} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <SmoothScrollProvider>
      <AuthProvider>
        <PokedexProvider>
          <MainApp />
        </PokedexProvider>
      </AuthProvider>
    </SmoothScrollProvider>
  );
}

export default App;
