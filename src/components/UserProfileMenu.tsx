import React, { useRef, useEffect } from 'react';
import {
  User,
  Settings,
  History,
  HelpCircle,
  Shield,
  EyeOff,
  LogOut,
  ExternalLink,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  privacyMode,
  onTogglePrivacy,
}) => {
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn"
    >
      {/* User Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow">
            SX
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">Security Operator</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">sentinelx-analyst@local</div>
          </div>
        </div>
      </div>

      {/* Menu links */}
      <div className="p-1.5 space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
        <button
          onClick={() => {
            onNavigate('settings');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
        >
          <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Platform Settings & Privacy</span>
        </button>

        <button
          onClick={() => {
            onNavigate('history');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
        >
          <History className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Audit History Ledger</span>
        </button>

        <button
          onClick={() => {
            onNavigate('about');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
        >
          <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Academic Project Report</span>
        </button>

        <button
          onClick={() => {
            onNavigate('help');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Help & User Manual</span>
        </button>

        <div className="my-1 border-t border-slate-200 dark:border-slate-800/80" />

        {/* Theme Switcher in menu */}
        <button
          onClick={() => {
            toggleTheme();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>Interface Appearance</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* Incognito Toggle */}
        <button
          onClick={() => {
            onTogglePrivacy();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Incognito Mode</span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            privacyMode
              ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {privacyMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[10px] font-mono text-slate-500 text-center">
        SentinelX Security v3.0 Core
      </div>
    </div>
  );
};
