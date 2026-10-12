import React, { useEffect, useState } from 'react';
import {
  Settings,
  Shield,
  Lock,
  EyeOff,
  Trash2,
  Key,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { storageService, UserPreferences } from '../services/storageService.js';
import { apiClient } from '../services/apiClient.js';
import { SystemStatusResponse } from '../types/sentinel.js';
import { useTheme } from '../context/ThemeContext.js';

export const SettingsPrivacyPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences>(storageService.getPreferences());
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    apiClient.getSystemStatus().then(setSystemStatus).catch(() => null);
  }, []);

  const handleTogglePrivacy = () => {
    const updated = { ...prefs, privacyMode: !prefs.privacyMode };
    setPrefs(updated);
    storageService.savePreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleClearData = async () => {
    if (!confirm('Permanently purge all stored local analysis records? This action cannot be undone.')) return;
    await apiClient.clearHistory();
    alert('Analysis records have been cleared from server and local storage.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span>Platform Settings & Appearance</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage interface theme, zero-retention privacy policies, storage models, and local data persistence.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* Interface Theme / Appearance Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Interface Appearance</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose between modern high-contrast Dark Mode or crisp, clean Light Mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
              theme === 'dark'
                ? 'bg-slate-900 text-white border-cyan-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</div>
              <div className="text-[11px] text-slate-500">Refined slate palette</div>
            </div>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
              theme === 'light'
                ? 'bg-white text-slate-900 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</div>
              <div className="text-[11px] text-slate-500">Clean high-contrast canvas</div>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy Mode Policy */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Incognito Analysis Mode (Zero Persistence)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              When enabled, incoming message content, URLs, and forensic reports are processed ephemerally in RAM and NEVER written to the persistent history ledger.
            </p>
          </div>

          <button
            onClick={handleTogglePrivacy}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 ${
              prefs.privacyMode
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{prefs.privacyMode ? 'Privacy Mode ON' : 'Privacy Mode OFF'}</span>
          </button>
        </div>
      </div>

      {/* Cloud & Persistence Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Persistence Layer Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-200">Active Storage Backend</div>
            <div className="text-cyan-700 dark:text-cyan-400 font-mono">In-Memory Store + Browser LocalStorage</div>
            <p className="text-[11px] text-slate-500 pt-1">
              Analysis reports are preserved in memory cache and local browser storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-200">Cloud Firestore Integration</div>
            <div className="text-amber-700 dark:text-amber-400 font-mono">Development Mode (Local)</div>
            <p className="text-[11px] text-slate-500 pt-1">
              Cloud persistence can be provisioned via Firebase Authentication and Firestore when deployed into production.
            </p>
          </div>
        </div>
      </div>

      {/* AI Services Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Gemini AI API Configuration</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-900 dark:text-slate-200">GEMINI_API_KEY Environment Variable</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Server-side injection from Google AI Studio Secrets. Client has zero direct exposure to credentials.
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
            systemStatus?.environment.geminiConfigured
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
          }`}>
            {systemStatus?.environment.geminiConfigured ? 'CONNECTED' : 'LOCAL FALLBACK'}
          </span>
        </div>
      </div>

      {/* Dangerous Operations */}
      <div className="p-6 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Purge Local History Records</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Permanently wipes all cached risk evaluation records and audit traces from this device.
            </p>
          </div>

          <button
            onClick={handleClearData}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
          >
            Purge All Data
          </button>
        </div>
      </div>
    </div>
  );
};
