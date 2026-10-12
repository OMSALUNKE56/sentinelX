export interface UserPreferences {
  privacyMode: boolean; // If true, never persist scans
  autoExportJson: boolean;
  soundAlerts: boolean;
  theme: 'dark' | 'light';
}

const PREFS_KEY = 'sentinelx_preferences_v1';

export const storageService = {
  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      privacyMode: false,
      autoExportJson: false,
      soundAlerts: true,
      theme: 'dark',
    };
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // fallback
    }
  },
};
