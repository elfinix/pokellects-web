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
  | 'admin-config'
  | 'admin-users';

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
    { id: 'reports' as WorkspaceTab, label: 'Reports', icon: BarChart3 },
    { id: 'achievements' as WorkspaceTab, label: 'Achievements', icon: Trophy },
    { id: 'settings' as WorkspaceTab, label: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'admin-config' as WorkspaceTab, label: 'Configurations', icon: Sliders },
    { id: 'admin-users' as WorkspaceTab, label: 'User Directory', icon: Users },
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
      className="min-h-screen bg-slate-50/60 text-slate-900 flex font-sans selection:bg-red-600 selection:text-white"
      style={{ '--sidebar-width': isSidebarCollapsed ? '5rem' : '16rem' } as React.CSSProperties}
    >
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR: Standard Side Bar | Main Page Architecture               */}
      {/* ========================================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col justify-between bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0 z-30 shadow-2xs relative select-none"
      >
        {/* Floating Sidebar Toggle Button positioned on the right border */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 z-40 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-300 hover:scale-110 transition-transform cursor-pointer"
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
          <div className="p-4 border-b border-slate-100 flex items-center h-18 overflow-hidden">
            <div
              className={`flex items-center min-w-0 ${
                isSidebarCollapsed ? 'justify-center w-full cursor-pointer' : 'gap-3 w-full'
              }`}
              onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
              title={isSidebarCollapsed ? 'Click to expand sidebar' : undefined}
            >
              <PokellectsLogo size={36} className="shadow-xs shadow-red-200" />
              <AnimatePresence initial={false}>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="min-w-0 flex flex-col justify-center overflow-hidden whitespace-nowrap"
                  >
                    <span className="font-extrabold text-base tracking-tight text-slate-900 font-display leading-tight">
                      Pokellects
                    </span>
                    <span
                      className={`inline-flex items-center self-start px-1.5 py-0.5 mt-0.5 text-[9px] font-bold rounded-md border uppercase tracking-wider leading-none ${
                        isAdmin
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-red-50 text-red-700 border-red-200'
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
            {/* Player Menu Items */}
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
                        ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                              : 'bg-slate-100 text-slate-500'
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

            {/* Admin Nav Section (Only shown if current logged-in user is Admin) */}
            {isAdmin && (
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                {isSidebarCollapsed ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-300 mx-auto my-2" />
                ) : (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-2 flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                    <Shield className="w-3 h-3 shrink-0" />
                    <span>Admin System</span>
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
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                          : 'text-slate-600 hover:bg-purple-50/60 hover:text-purple-900'
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
        <div className="border-t border-slate-200/80 p-3 space-y-2 bg-slate-50/50 overflow-hidden">
          {/* Active Single User Card with Initials */}
          {isSidebarCollapsed ? (
            <div className="flex justify-center py-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black bg-red-50 border border-red-200 text-red-600 shadow-2xs tracking-wider font-mono cursor-default select-none shrink-0"
                title={`${currentUser?.firstName} ${currentUser?.lastName || ''} (@${currentUser?.username})`}
              >
                {userInitials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-red-50 border border-red-200 text-red-600 shrink-0 tracking-wider font-mono select-none"
                title={currentUser?.username}
              >
                {userInitials}
              </div>
              <div className="min-w-0 flex-1 text-left leading-tight overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate whitespace-nowrap">
                  {currentUser?.firstName} {currentUser?.lastName || ''}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate whitespace-nowrap">
                  @{currentUser?.username}
                </div>
              </div>
            </div>
          )}

          {/* Logout button situated at the bottom of the sidebar */}
          <button
            type="button"
            onClick={logout}
            className={`flex items-center h-10 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer group ${
              isSidebarCollapsed
                ? 'w-10 mx-auto justify-center px-0'
                : 'w-full gap-2.5 px-3'
            }`}
            title="Log out from Pokellects"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600 shrink-0 transition-colors" />
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
        <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <PokellectsLogo size={28} className="shadow-xs shadow-red-200" />
              <span className="font-extrabold text-sm tracking-tight text-slate-900 font-display">
                Pokellects
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-red-50 border border-red-200 text-red-600 shadow-2xs font-mono select-none"
              title={currentUser?.username}
            >
              {userInitials}
            </div>
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
                className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ opacity: 0, x: -260 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -260 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-5 flex flex-col justify-between border-r border-slate-200"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <PokellectsLogo size={32} className="shadow-xs shadow-red-200" />
                      <span className="font-extrabold text-base tracking-tight text-slate-900 font-display">
                        Pokellects
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-4 space-y-1">
                    {playerNavItems.map((item) => {
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
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] opacity-80">{item.badge}</span>
                          )}
                        </button>
                      );
                    })}

                    {isAdmin && (
                      <div className="pt-4 border-t border-slate-100 mt-3">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block px-3 mb-2">
                          Admin System
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
                                  : 'text-slate-700 hover:bg-purple-50'
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
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-red-50 border border-red-200 text-red-600 font-mono select-none">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.firstName} {currentUser?.lastName || ''}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        @{currentUser?.username}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
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
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
