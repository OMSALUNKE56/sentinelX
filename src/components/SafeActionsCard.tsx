import React from 'react';
import { RiskBand } from '../types/sentinel.js';
import { ShieldCheck, ArrowRight, LifeBuoy } from 'lucide-react';

interface SafeActionsCardProps {
  actions: string[];
  riskBand: RiskBand;
}

export const SafeActionsCard: React.FC<SafeActionsCardProps> = ({ actions, riskBand }) => {
  const getHeaderStyle = () => {
    switch (riskBand) {
      case 'very_high':
        return 'border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300';
      case 'high':
        return 'border-orange-200 dark:border-orange-500/30 bg-orange-50/80 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300';
      case 'moderate':
        return 'border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300';
      default:
        return 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300';
    }
  };

  return (
    <div className={`rounded-xl border p-5 ${getHeaderStyle()} shadow-xs`}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <h3 className="font-semibold text-sm tracking-wide uppercase font-mono">
          Recommended Safety Directives
        </h3>
      </div>

      <ul className="space-y-2.5">
        {actions.map((act, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
            <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{act}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <LifeBuoy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>If defrauded, immediately report to official banking & cyber authorities.</span>
        </span>
      </div>
    </div>
  );
};
