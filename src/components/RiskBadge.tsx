import React from 'react';
import { RiskBand } from '../types/sentinel.js';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  band: RiskBand;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  band,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    lower: {
      label: 'Lower Risk',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      icon: ShieldCheck,
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    moderate: {
      label: 'Moderate Risk',
      bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      icon: AlertTriangle,
      dot: 'bg-amber-500 dark:bg-amber-400',
    },
    high: {
      label: 'High Risk',
      bg: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
      icon: ShieldAlert,
      dot: 'bg-orange-500 dark:bg-orange-400',
    },
    very_high: {
      label: 'Very High Risk',
      bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
      icon: AlertOctagon,
      dot: 'bg-rose-500 dark:bg-rose-400',
    },
  };

  const config = configs[band] || configs.lower;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 space-x-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono text-[0.9em]">({score}/100)</span>
      )}
    </span>
  );
};
