import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, ShieldAlert, Layers, ShieldCheck, Activity, Info } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalyticsSummary } from '../types/sentinel.js';

export const ThreatAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getAnalytics();
        setAnalytics(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const total = analytics?.totalAnalyses || 0;
  const dist = analytics?.riskDistribution || { lower: 0, moderate: 0, high: 0, very_high: 0 };
  const modCounts = analytics?.modalityCounts || { text: 0, url: 0, qr: 0, audio: 0, image: 0, video: 0, multimodal: 0 };

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Threat Intelligence & Analytics</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Operational statistics aggregating risk scores, distribution across input modalities, and high-frequency scam indicator patterns.
        </p>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Scanned</span>
          <div className="text-2xl font-black font-mono text-white mt-1">{total}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400">Average Risk Score</span>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
            {analytics?.averageRiskScore ? `${analytics.averageRiskScore}/100` : 'N/A'}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400">High Risk Ratio</span>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {getPercentage(dist.high + dist.very_high)}%
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400">Lower Risk Ratio</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {getPercentage(dist.lower)}%
          </div>
        </div>
      </div>

      {/* Visual Risk Distribution Bars */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>Risk Band Classification Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Sample Size: {total}</span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="h-5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${getPercentage(dist.lower)}%` }}
            className="bg-emerald-500 hover:bg-emerald-400 transition"
            title={`Lower Risk: ${dist.lower}`}
          />
          <div
            style={{ width: `${getPercentage(dist.moderate)}%` }}
            className="bg-amber-500 hover:bg-amber-400 transition"
            title={`Moderate Risk: ${dist.moderate}`}
          />
          <div
            style={{ width: `${getPercentage(dist.high)}%` }}
            className="bg-orange-500 hover:bg-orange-400 transition"
            title={`High Risk: ${dist.high}`}
          />
          <div
            style={{ width: `${getPercentage(dist.very_high)}%` }}
            className="bg-rose-500 hover:bg-rose-400 transition"
            title={`Very High Risk: ${dist.very_high}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Lower Risk (0-29)</span>
            </div>
            <div className="mt-1 font-mono text-base text-slate-100">
              {dist.lower} <span className="text-xs text-slate-400">({getPercentage(dist.lower)}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Moderate (30-59)</span>
            </div>
            <div className="mt-1 font-mono text-base text-slate-100">
              {dist.moderate} <span className="text-xs text-slate-400">({getPercentage(dist.moderate)}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span>High (60-79)</span>
            </div>
            <div className="mt-1 font-mono text-base text-slate-100">
              {dist.high} <span className="text-xs text-slate-400">({getPercentage(dist.high)}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Very High (80-100)</span>
            </div>
            <div className="mt-1 font-mono text-base text-slate-100">
              {dist.very_high} <span className="text-xs text-slate-400">({getPercentage(dist.very_high)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modality Usage & Top Reason Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modality Usage Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Analyses by Modality Vector</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {Object.entries(modCounts).map(([mod, count]) => (
              <div key={mod} className="space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="uppercase text-slate-300">{mod}</span>
                  <span className="text-slate-400">{count} scans</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Triggered Scam Indicators */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Frequent Detection Reason Codes</span>
          </h3>

          {analytics?.frequentReasonCodes && analytics.frequentReasonCodes.length > 0 ? (
            <div className="space-y-2 text-xs">
              {analytics.frequentReasonCodes.map((rc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">{rc.label}</div>
                    <div className="font-mono text-[10px] text-cyan-400">{rc.code}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-900 text-slate-300 border border-slate-800">
                    {rc.count} hits
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              No frequent reason codes collected yet.
            </div>
          )}
        </div>
      </div>

      {/* Academic Separation Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="font-bold text-slate-200 font-mono uppercase text-[11px]">
            Academic & Operational Distinction:
          </span>
          <p>
            The above charts depict operational traffic metrics within this active deployment. Formal scientific model benchmark metrics (Precision, Recall, F1, ROC-AUC on public evaluation test splits) are documented separately in the Project Architecture section.
          </p>
        </div>
      </div>
    </div>
  );
};
