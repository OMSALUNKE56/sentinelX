import React, { useEffect, useState } from 'react';
import {
  Shield,
  Search,
  Bell,
  EyeOff,
  Lock,
  Activity,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { storageService } from '../services/storageService.js';
import { AnalysisReport } from '../types/sentinel.js';
import { useTheme } from '../context/ThemeContext.js';
import { CommandPalette } from './CommandPalette.js';
import { NotificationsPopover } from './NotificationsPopover.js';
import { UserProfileMenu } from './UserProfileMenu.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onSelectReport?: (report: AnalysisReport) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  onSelectReport,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [recentReports, setRecentReports] = useState<AnalysisReport[]>([]);

  useEffect(() => {
    const prefs = storageService.getPreferences();
    setPrivacyMode(prefs.privacyMode);

    const checkHealth = async () => {
      try {
        await apiClient.getHealth();
        setIsHealthy(true);
      } catch {
        setIsHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    // Fetch reports for notifications and search palette
    apiClient.getHistory({ limit: 6 }).then((res) => {
      if (res && res.items) setRecentReports(res.items);
    }).catch(() => null);

    return () => clearInterval(interval);
  }, [currentView]);

  const togglePrivacyMode = () => {
    const updated = !privacyMode;
    setPrivacyMode(updated);
    const prefs = storageService.getPreferences();
    storageService.savePreferences({ ...prefs, privacyMode: updated });
  };

  const getViewBreadcrumbLabel = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'analyze': return 'Unified Threat Workbench';
      case 'scanner_text': return 'Text & Message Scanner';
      case 'scanner_url': return 'URL Phishing Scanner';
      case 'scanner_qr': return 'QR Code Scanner';
      case 'scanner_voice': return 'Voice Spoof Analyzer';
      case 'scanner_deepfake': return 'Deepfake Forensics';
      case 'results': return 'Forensic Report';
      case 'history': return 'Audit History Ledger';
      case 'analytics': return 'Threat Analytics';
      case 'education': return 'Security Education';
      case 'settings': return 'Settings & Privacy';
      case 'status': return 'System Telemetry';
      case 'about': return 'Project Architecture';
      case 'help': return 'Help & Documentation';
      default: return 'Overview';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 transition-colors">
        {/* Left: Mobile Toggle, Desktop Collapse, Brand & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Brand Icon & Wordmark */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/10 group-hover:scale-105 transition">
              <Shield className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline">
              SentinelX
            </span>
          </div>

          {/* Breadcrumb Trail */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 pl-2 border-l border-slate-200 dark:border-slate-800 min-w-0">
            <span className="hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              Ops
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span className="text-slate-900 dark:text-slate-300 font-medium truncate">
              {getViewBreadcrumbLabel(currentView)}
            </span>
          </div>
        </div>

        {/* Center: Quick Search Bar (Command Palette Trigger) */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200/70 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
              <span>Search scanners, recent analyses, commands...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Theme Toggle, Privacy, Notifications, User Menu, Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Engine Status */}
          <button
            onClick={() => onNavigate('status')}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500'}`} />
            <span className="font-mono">{isHealthy ? 'Active' : 'Degraded'}</span>
          </button>

          {/* Incognito Privacy Toggle */}
          <button
            onClick={togglePrivacyMode}
            title={privacyMode ? 'Incognito Mode Active: Zero persistence in ledger.' : 'Standard Mode: Scans recorded in audit ledger.'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              privacyMode
                ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {privacyMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden lg:inline text-[11px]">Incognito ON</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Audit Mode</span>
              </>
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {recentReports.some(r => r.fusion.riskBand === 'high' || r.fusion.riskBand === 'very_high') && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
              )}
            </button>

            <NotificationsPopover
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              recentReports={recentReports}
              privacyMode={privacyMode}
              onSelectReport={onSelectReport || (() => {})}
              onNavigate={onNavigate}
            />
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
              title="User Account"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-300 dark:ring-slate-700">
                SX
              </div>
            </button>

            <UserProfileMenu
              isOpen={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
              onNavigate={onNavigate}
              privacyMode={privacyMode}
              onTogglePrivacy={togglePrivacyMode}
            />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/10 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onNavigate}
        onSelectReport={onSelectReport || (() => {})}
        recentReports={recentReports}
      />
    </>
  );
};
