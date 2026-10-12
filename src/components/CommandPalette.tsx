import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  Globe,
  QrCode,
  Mic,
  Video,
  Layers,
  LayoutDashboard,
  History,
  BarChart3,
  GraduationCap,
  Settings,
  Server,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { AnalysisReport } from '../types/sentinel.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onSelectReport: (report: AnalysisReport) => void;
  recentReports: AnalysisReport[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectReport,
  recentReports,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'analyze', label: 'Unified Threat Workbench', icon: Layers, category: 'Scanners' },
    { id: 'scanner_text', label: 'Text & Message Scanner', icon: FileText, category: 'Scanners' },
    { id: 'scanner_url', label: 'URL & Phishing Scanner', icon: Globe, category: 'Scanners' },
    { id: 'scanner_qr', label: 'QR Code & Quishing Scanner', icon: QrCode, category: 'Scanners' },
    { id: 'scanner_voice', label: 'Voice Spoof & Speech Analyzer', icon: Mic, category: 'Scanners' },
    { id: 'scanner_deepfake', label: 'Deepfake Forensics Analyzer', icon: Video, category: 'Scanners' },
    { id: 'history', label: 'Analysis Audit History', icon: History, category: 'Intelligence' },
    { id: 'analytics', label: 'Threat Intelligence Analytics', icon: BarChart3, category: 'Intelligence' },
    { id: 'education', label: 'Security Education & Cyber Safety', icon: GraduationCap, category: 'Intelligence' },
    { id: 'settings', label: 'Settings & Privacy Controls', icon: Settings, category: 'System' },
    { id: 'status', label: 'System Telemetry & Status', icon: Server, category: 'System' },
  ];

  const filteredNav = quickNavItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredReports = recentReports.filter(
    (rep) =>
      rep.id.toLowerCase().includes(query.toLowerCase()) ||
      (rep.inputSummary.textSnippet && rep.inputSummary.textSnippet.toLowerCase().includes(query.toLowerCase())) ||
      (rep.inputSummary.submittedUrl && rep.inputSummary.submittedUrl.toLowerCase().includes(query.toLowerCase())) ||
      (rep.inputSummary.fileName && rep.inputSummary.fileName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scanners, recent analyses, or commands..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-4">
          {/* Quick Actions / Navigation */}
          {filteredNav.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Commands & Workspaces
              </div>
              {filteredNav.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent Scans */}
          {filteredReports.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Recent Analysis Reports
              </div>
              {filteredReports.slice(0, 4).map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => {
                    onSelectReport(rep);
                    onNavigate('results');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group text-left"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">{rep.id}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {rep.modalities.join(', ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {rep.inputSummary.textSnippet ||
                        rep.inputSummary.submittedUrl ||
                        rep.inputSummary.fileName ||
                        'Multimodal inspection'}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300 shrink-0 font-medium">
                    {rep.fusion.trustRiskScore}/100
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && filteredReports.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or analysis reports found.
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
