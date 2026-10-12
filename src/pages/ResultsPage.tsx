import React, { useState } from 'react';
import {
  FileSearch,
  Download,
  Printer,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AnalysisReport } from '../types/sentinel.js';
import { RiskGauge } from '../components/RiskGauge.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { EvidenceCard } from '../components/EvidenceCard.js';
import { SafeActionsCard } from '../components/SafeActionsCard.js';
import { DetectorStatusPill } from '../components/DetectorStatusPill.js';
import { exportReportAsJson, printOrSaveReport } from '../utils/exportReport.js';

interface ResultsPageProps {
  report: AnalysisReport | null;
  onNavigate: (view: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  report,
  onNavigate,
}) => {
  const [activeDetectorTab, setActiveDetectorTab] = useState<string>('all');

  if (!report) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <FileSearch className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">No Analysis Report Loaded</h2>
        <p className="text-xs text-slate-400">
          Run an inspection via the Unified Scanner or select an entry from Analysis History to view the complete forensic breakdown.
        </p>
        <button
          onClick={() => onNavigate('analyze')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs"
        >
          Open Unified Scanner
        </button>
      </div>
    );
  }

  const detectorsList = Object.values(report.detectors);
  const selectedDetector = activeDetectorTab === 'all' ? null : report.detectors[activeDetectorTab];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white">
                Forensic Risk Evaluation Report
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                {report.id}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Timestamp: {new Date(report.timestamp).toLocaleString()}</span>
              <span>&bull;</span>
              <span>Modalities: {report.modalities.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Export / Print buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportReportAsJson(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => printOrSaveReport(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Score & Fusion Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800">
        {/* Left: Score Gauge */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800/80">
          <RiskGauge
            score={report.fusion.trustRiskScore}
            band={report.fusion.riskBand}
            size={190}
          />
          <div className="mt-2 text-center text-[11px] text-slate-400">
            Weighted Score: <span className="font-mono text-slate-200">{report.fusion.trustRiskScore} / 100</span>
          </div>
        </div>

        {/* Right: Fusion & Primary Drivers */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Fusion Synthesis
              </span>
              <RiskBadge band={report.fusion.riskBand} score={report.fusion.trustRiskScore} />
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {report.fusion.summaryExplanation}
            </p>

            {/* Fusion formula code */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300/90 break-all">
              <span className="text-slate-500 mr-1.5">Weighting:</span>
              {report.fusion.fusionFormula}
            </div>
          </div>

          {/* Primary Risk Drivers */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Primary Risk Drivers:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {report.fusion.primaryRiskDrivers.map((driver, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-800/90 text-slate-200 border border-slate-700/80 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{driver}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI / Gemini Explanation Box */}
      {report.geminiExplanation && (
        <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-300">
                Explainable AI Forensic Synthesis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {report.geminiExplanation.modelUsed}
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            {report.geminiExplanation.explanationText}
          </p>

          {report.geminiExplanation.threatBreakdown.length > 0 && (
            <div className="pt-2 border-t border-cyan-900/40 space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                Threat Breakdown:
              </span>
              <ul className="space-y-1">
                {report.geminiExplanation.threatBreakdown.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Safety Actions Directives */}
      <SafeActionsCard
        actions={report.fusion.recommendedActions}
        riskBand={report.fusion.riskBand}
      />

      {/* Detector Tabs & Evidence Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Forensic Evidence & Detector Audit</span>
          </h3>
          <span className="text-xs text-slate-400">
            {detectorsList.length} Modules Evaluated
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          <button
            onClick={() => setActiveDetectorTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeDetectorTab === 'all'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Evidence ({detectorsList.flatMap(d => d.evidence).length})
          </button>
          {detectorsList.map((det) => (
            <button
              key={det.moduleId}
              onClick={() => setActiveDetectorTab(det.moduleId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeDetectorTab === det.moduleId
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{det.name}</span>
              {det.riskScore !== null && (
                <span className="text-[10px] font-mono opacity-80">({det.riskScore})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeDetectorTab === 'all' ? (
          <div className="space-y-6">
            {detectorsList.map((det) => (
              <div key={det.moduleId} className="space-y-2">
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-200">{det.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">v{det.version}</span>
                  </div>
                  <DetectorStatusPill status={det.status} />
                </div>
                <EvidenceCard evidence={det.evidence} />
              </div>
            ))}
          </div>
        ) : selectedDetector ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-200">{selectedDetector.name}</div>
                <div className="text-slate-400 text-[11px]">
                  Architecture: {selectedDetector.modelDetails?.architecture || 'Deterministic Rules'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedDetector.riskScore !== null && (
                  <span className="font-mono text-sm text-cyan-300 font-bold">
                    Risk: {selectedDetector.riskScore}/100
                  </span>
                )}
                <DetectorStatusPill status={selectedDetector.status} />
              </div>
            </div>

            <EvidenceCard evidence={selectedDetector.evidence} />

            {selectedDetector.limitations && selectedDetector.limitations.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold font-mono uppercase text-slate-500">Model Limitations:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {selectedDetector.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
