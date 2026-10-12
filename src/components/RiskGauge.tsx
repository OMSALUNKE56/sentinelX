import React from 'react';
import { RiskBand } from '../types/sentinel.js';

interface RiskGaugeProps {
  score: number;
  band: RiskBand;
  size?: number;
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  band,
  size = 200,
  showDetails = true,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semicircle arc (180 degrees)
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  const bandColors = {
    lower: {
      stroke: '#10b981', // emerald-500
      glow: 'rgba(16, 185, 129, 0.25)',
      text: 'text-emerald-700 dark:text-emerald-400',
      label: 'LOWER RISK',
    },
    moderate: {
      stroke: '#f59e0b', // amber-500
      glow: 'rgba(245, 158, 11, 0.25)',
      text: 'text-amber-700 dark:text-amber-400',
      label: 'MODERATE RISK',
    },
    high: {
      stroke: '#f97316', // orange-500
      glow: 'rgba(249, 115, 22, 0.25)',
      text: 'text-orange-700 dark:text-orange-400',
      label: 'HIGH RISK',
    },
    very_high: {
      stroke: '#f43f5e', // rose-500
      glow: 'rgba(244, 63, 94, 0.25)',
      text: 'text-rose-700 dark:text-rose-400',
      label: 'VERY HIGH RISK',
    },
  };

  const activeColor = bandColors[band] || bandColors.lower;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            <filter id={`gauge-glow-${band}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={activeColor.stroke} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(180 ${size / 2} ${size / 2})`}
          />

          {/* Active Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(180 ${size / 2} ${size / 2})`}
            filter={`url(#gauge-glow-${band})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center top-4">
          <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {score}
          </span>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="text-center mt-1">
          <div className={`text-sm font-bold tracking-wider ${activeColor.text}`}>
            {activeColor.label}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trust Risk Score
          </div>
        </div>
      )}
    </div>
  );
};
