import React from 'react';
import { DetectorStatus } from '../types/sentinel.js';
import { CheckCircle2, AlertCircle, HelpCircle, MinusCircle } from 'lucide-react';

interface DetectorStatusPillProps {
  status: DetectorStatus;
  label?: string;
  className?: string;
}

export const DetectorStatusPill: React.FC<DetectorStatusPillProps> = ({
  status,
  label,
  className = '',
}) => {
  const configs = {
    success: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: CheckCircle2,
      defaultLabel: 'Operational / Valid',
    },
    failed: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      icon: AlertCircle,
      defaultLabel: 'Execution Failed',
    },
    unconfigured: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: HelpCircle,
      defaultLabel: 'Unconfigured Model',
    },
    skipped: {
      text: 'text-slate-400',
      bg: 'bg-slate-500/10 border-slate-500/20',
      icon: MinusCircle,
      defaultLabel: 'Not Applicable / Skipped',
    },
  };

  const config = configs[status] || configs.skipped;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
