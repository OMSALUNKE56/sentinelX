import React from 'react';
import { EvidenceItem } from '../types/sentinel.js';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Shield, Key, Clock, Globe } from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceItem[];
  emptyMessage?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  emptyMessage = 'No specific flags recorded for this module.',
}) => {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> HIGH THREAT
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> SAFE PATTERN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">
            <Info className="w-3 h-3" /> METADATA
          </span>
        );
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'credential':
        return <Key className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      case 'urgency':
        return <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'domain':
        return <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />;
    }
  };

  return (
    <div className="space-y-2.5">
      {evidence.map((item) => (
        <div
          key={item.id}
          className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs"
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {getCategoryIcon(item.category)}
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
              {item.explanation}
            </p>
            {item.value !== true && item.value !== false && (
              <div className="pl-6 pt-1 text-xs font-mono text-cyan-700 dark:text-cyan-300/90 break-all">
                Found Value: <span className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">{String(item.value)}</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 self-start sm:self-center">
            {getSeverityBadge(item.severity)}
          </div>
        </div>
      ))}
    </div>
  );
};
