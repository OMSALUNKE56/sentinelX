import React, { useRef, useEffect } from 'react';
import {
  Bell,
  ShieldAlert,
  CheckCircle,
  EyeOff,
  Activity,
  X,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { AnalysisReport } from '../types/sentinel.js';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  recentReports: AnalysisReport[];
  privacyMode: boolean;
  onSelectReport: (report: AnalysisReport) => void;
  onNavigate: (view: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  recentReports,
  privacyMode,
  onSelectReport,
  onNavigate,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter high threats from recent reports
  const highThreats = recentReports.filter(
    (r) => r.fusion.riskBand === 'high' || r.fusion.riskBand === 'very_high'
  );

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Security Notifications
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto p-2 space-y-2">
        {/* System Core status notification */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-200">Analytical Pipelines Operational</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Text NLP, URL Phishing, QR Reed-Solomon, Audio, and Forensics adapters active.
            </p>
          </div>
        </div>

        {/* Privacy mode status notification */}
        {privacyMode && (
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5 flex-1 text-xs">
              <div className="font-semibold text-purple-900 dark:text-purple-200">Incognito Mode Active</div>
              <p className="text-[11px] text-purple-700 dark:text-purple-300/80">
                Analysis records are ephemeral in RAM; zero persistence written to history.
              </p>
            </div>
          </div>
        )}

        {/* High threats detected */}
        {highThreats.length > 0 ? (
          highThreats.slice(0, 3).map((threat) => (
            <div
              key={threat.id}
              onClick={() => {
                onSelectReport(threat);
                onNavigate('results');
                onClose();
              }}
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5 flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-800 dark:text-rose-300">
                    High Risk Detected ({threat.fusion.trustRiskScore}/100)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{threat.id}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                  {threat.inputSummary.textSnippet ||
                    threat.inputSummary.submittedUrl ||
                    'Multimodal threat detected'}
                </p>
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 pt-1 font-medium">
                  <span>View Full Forensic Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>No urgent threat alerts in recent session.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-center">
        <button
          onClick={() => {
            onNavigate('history');
            onClose();
          }}
          className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium"
        >
          View Full Audit History Ledger &rarr;
        </button>
      </div>
    </div>
  );
};
