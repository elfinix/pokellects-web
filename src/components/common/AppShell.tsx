import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  BarChart3,
  Trophy,
  Settings,
  Sliders,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePokedex } from '../../context/PokedexContext';
import { globalScrollToTop } from '../../context/SmoothScrollContext';
import { PokellectsLogo } from './PokellectsLogo';

export type WorkspaceTab =
  | 'dashboard'
  | 'pokedex'
  | 'arena'
  | 'reports'
  | 'achievements'
  | 'settings'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-analytics'
  | 'admin-config';

interface AppShellProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onReturnToLanding?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  onReturnToLanding,
  children,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { stats } = usePokedex();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const playerNavItems = [
    { id: 'dashboard' as WorkspaceTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'pokedex' as WorkspaceTab,
      label: 'Pokédex',
      icon: BookOpen,
      badge: `${stats.totalUnlocked}/${stats.totalDexCount}`,
    },
    { id: 'arena' as WorkspaceTab, label: 'Minigames', icon: Gamepad2 },
    { id: 'reports' as WorkspaceTab, label: 'Analytics', icon: BarChart3 },
    { id: 'achievements' as WorkspaceTab, label: 'Achievements', icon: Trophy },
    { id: 'settings' as WorkspaceTab, label: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard' as WorkspaceTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users' as WorkspaceTab, label: 'Users', icon: Users },
    { id: 'admin-analytics' as WorkspaceTab, label: 'Analytics', icon: BarChart3 },
    { id: 'admin-config' as WorkspaceTab, label: 'Settings', icon: Sliders },
  ];

  const handleNavClick = (tab: WorkspaceTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
    globalScrollToTop(true);
  };

  const userInitials = React.useMemo(() => {
    if (!currentUser) return 'TR';
    const first = currentUser.firstName?.trim().charAt(0).toUpperCase() || '';
    const last = currentUser.lastName?.trim().charAt(0).toUpperCase() || '';
    if (first && last) return `${first}${last}`;
    if (first) return first;
    return currentUser.username?.trim().slice(0, 2).toUpperCase() || 'TR';
  }, [currentUser]);

  return (
    <div
      className="min-h-screen bg-slate-50/60 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex font-sans selection:bg-red-600 selection:text-white transition-colors duration-200"
      style={{ '--sidebar-width': isSidebarCollapsed ? '5rem' : '16rem' } as React.CSSProperties}
    >
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR: Standard Side Bar | Main Page Architecture               */}
      {/* ========================================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/80 h-screen sticky top-0 shrink-0 z-30 shadow-2xs relative select-none"
      >
        {/* Floating Sidebar Toggle Button positioned on the right border */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 z-40 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-500 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/50 hover:scale-110 transition-transform cursor-pointer"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.div>
        </button>

        {/* Top Header & Brand */}
        <div>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center h-18 overflow-hidden">
            <div
              className={`flex items-center min-w-0 ${
                isSidebarCollapsed ? 'justify-center w-full cursor-pointer' : 'gap-3 w-full'
              }`}
              onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
              title={isSidebarCollapsed ? 'Click to expand sidebar' : undefined}
            >
              <PokellectsLogo size={36} className="shadow-xs shadow-red-200 dark:shadow-none" />
              <AnimatePresence initial={false}>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="min-w-0 flex flex-col justify-center overflow-hidden whitespace-nowrap"
                  >
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display leading-tight">
                      Pokellects
                    </span>
                    <span
                      className={`inline-flex items-center self-start px-1.5 py-0.5 mt-0.5 text-[9px] font-bold rounded-md border uppercase tracking-wider leading-none ${
                        isAdmin
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
                          : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'
                      }`}
                    >
                      {isAdmin ? 'Admin Console' : 'Trainer Vault'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-190px)] overflow-x-hidden">
            {!isAdmin ? (
              /* Player Menu Items (Trainer Vault) */
              <div className="space-y-1.5">
                {playerNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center h-10 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-none'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      } ${
                        isSidebarCollapsed
                          ? 'w-10 mx-auto justify-center px-0'
                          : 'w-full px-3 justify-between'
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <AnimatePresence initial={false}>
                          {!isSidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="ml-3 overflow-hidden whitespace-nowrap text-left"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <AnimatePresence initial={false}>
                        {!isSidebarCollapsed && item.badge && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ml-1.5 ${
                              isActive
                                ? 'bg-red-700 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Admin Nav Section (Only shown if current logged-in user is Admin) */
              <div className="space-y-1.5">
                {isSidebarCollapsed ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-300 dark:bg-purple-600 mx-auto my-2" />
                ) : (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                    <Shield className="w-3 h-3 shrink-0" />
                    <span>Admin Vault</span>
                  </div>
                )}
                {adminNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center h-10 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 dark:shadow-none'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 hover:text-purple-900 dark:hover:text-purple-300'
                      } ${
                        isSidebarCollapsed
                          ? 'w-10 mx-auto justify-center px-0'
                          : 'w-full px-3 justify-start'
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <AnimatePresence initial={false}>
                        {!isSidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="ml-3 overflow-hidden whitespace-nowrap text-left"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM OF SIDEBAR: Single Logged-in User Profile & Logout Button           */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3 space-y-2 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden">
          {/* Active Single User Card with Initials (Clickable -> Profile Page) */}
          {isSidebarCollapsed ? (
            <div className="flex justify-center py-1">
              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer select-none shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-2 dark:ring-offset-slate-900 shadow-sm'
                    : 'bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 shadow-2xs hover:scale-105'
                }`}
                title={`Trainer Profile: ${currentUser?.firstName} ${currentUser?.lastName || ''} (@${currentUser?.username})`}
              >
                {userInitials}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left cursor-pointer group shadow-2xs overflow-hidden ${
                activeTab === 'profile'
                  ? 'bg-red-50/80 dark:bg-red-950/50 border-red-300 dark:border-red-700/80 ring-1 ring-red-400'
                  : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              title="View & Edit Trainer Profile"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 tracking-wider font-mono transition-transform group-hover:scale-105 select-none ${
                  activeTab === 'profile'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400'
                }`}
              >
                {userInitials}
              </div>
              <div className="min-w-0 flex-1 text-left leading-tight overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors truncate whitespace-nowrap">
                  {currentUser?.firstName} {currentUser?.lastName || ''}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate whitespace-nowrap">
                  @{currentUser?.username} • <span className="text-red-500 font-medium">Profile</span>
                </div>
              </div>
            </button>
          )}

          {/* Logout button situated at the bottom of the sidebar */}
          <button
            type="button"
            onClick={logout}
            className={`flex items-center h-10 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition-colors cursor-pointer group ${
              isSidebarCollapsed
                ? 'w-10 mx-auto justify-center px-0'
                : 'w-full gap-2.5 px-3'
            }`}
            title="Log out from Pokellects"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 shrink-0 transition-colors" />
            <AnimatePresence initial={false}>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: Main Page & Responsive Mobile Drawer                       */}
      {/* ========================================================================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <PokellectsLogo size={28} className="shadow-xs shadow-red-200 dark:shadow-none" />
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-display">
                Pokellects
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer font-mono select-none ${
                activeTab === 'profile'
                  ? 'bg-red-600 text-white ring-2 ring-red-400'
                  : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 shadow-2xs'
              }`}
              title={currentUser?.username}
            >
              {userInitials}
            </button>
          </div>
        </header>

        {/* Mobile Slide-Over Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ opacity: 0, x: -260 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -260 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="md:hidden fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-2.5rem))] bg-white dark:bg-slate-900 shadow-2xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col justify-between border-r border-slate-200 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <PokellectsLogo size={32} className="shadow-xs shadow-red-200 dark:shadow-none" />
                      <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
                        Pokellects
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-4 space-y-1">
                    {!isAdmin ? (
                      playerNavItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                              isActive
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[10px] opacity-80 font-mono">{item.badge}</span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block px-3 mb-2">
                          Admin Vault
                        </span>
                        {adminNavItems.map((item) => {
                          const isActive = activeTab === item.id;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                                isActive
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Drawer Bottom: Single User & Logout */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleNavClick('profile')}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-700 ring-1 ring-red-300'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 font-mono select-none">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser?.firstName} {currentUser?.lastName || ''}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        @{currentUser?.username} • <span className="text-red-500 font-medium">Profile</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full px-4 pt-6 pb-8 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
