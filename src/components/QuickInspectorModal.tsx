import React from 'react';
import {
  X,
  ExternalLink,
  Download,
  Shield,
  Layers,
  Cpu,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { AnalysisReport } from '../types/sentinel.js';
import { RiskBadge } from './RiskBadge.js';
import { EvidenceCard } from './EvidenceCard.js';
import { SafeActionsCard } from './SafeActionsCard.js';
import { exportReportAsJson } from '../utils/exportReport.js';

interface QuickInspectorModalProps {
  report: AnalysisReport | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullReport: (report: AnalysisReport) => void;
}

export const QuickInspectorModal: React.FC<QuickInspectorModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenFullReport,
}) => {
  if (!isOpen || !report) return null;

  const allEvidence = Object.values(report.detectors).flatMap((d) => d.evidence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">{report.id}</span>
            <RiskBadge band={report.fusion.riskBand} score={report.fusion.trustRiskScore} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReportAsJson(report)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Target Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">Evaluated Target</div>
            <div className="text-xs text-slate-900 dark:text-slate-200 font-medium break-all">
              {report.inputSummary.textSnippet ||
                report.inputSummary.submittedUrl ||
                report.inputSummary.qrPayload ||
                report.inputSummary.fileName ||
                'Multimodal Threat Package'}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 font-mono">
              <span>{new Date(report.timestamp).toLocaleString()}</span>
              <span>&bull;</span>
              <span>Modalities: {report.modalities.join(', ')}</span>
            </div>
          </div>

          {/* Fusion Explanation */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fusion Synthesis
              </span>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                Score: {report.fusion.trustRiskScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.fusion.summaryExplanation}
            </p>
            <div className="text-[10px] font-mono text-cyan-800 dark:text-cyan-400/80 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 truncate">
              {report.fusion.fusionFormula}
            </div>
          </div>

          {/* Forensic Evidence Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Forensic Evidence ({allEvidence.length})</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {Object.keys(report.detectors).length} detectors
              </span>
            </div>
            <EvidenceCard evidence={allEvidence} />
          </div>

          {/* Safe Actions */}
          <SafeActionsCard
            actions={report.fusion.recommendedActions}
            riskBand={report.fusion.riskBand}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Close
          </button>

          <button
            onClick={() => onOpenFullReport(report)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/10"
          >
            <span>Open Comprehensive Audit Report</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
