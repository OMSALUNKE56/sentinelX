import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Download,
  Filter,
  ExternalLink,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalysisReport, ModalityType, RiskBand } from '../types/sentinel.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { exportReportAsJson } from '../utils/exportReport.js';

interface HistoryPageProps {
  onSelectReport: (report: AnalysisReport) => void;
  onNavigate: (view: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectReport,
  onNavigate,
}) => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedRiskBand, setSelectedRiskBand] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getHistory({
        search: search.trim() || undefined,
        modality: selectedModality !== 'all' ? selectedModality : undefined,
        riskBand: selectedRiskBand !== 'all' ? selectedRiskBand : undefined,
      });
      setReports(data.items);
      setTotal(data.total);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedModality, selectedRiskBand]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete report ${id} from history?`)) return;
    try {
      await apiClient.deleteHistoryItem(id);
      fetchHistory();
    } catch {
      // error
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to permanently clear all analysis history records?')) return;
    try {
      await apiClient.clearHistory();
      fetchHistory();
    } catch {
      // error
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Analysis Audit History</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Searchable ledger of evaluated messages, links, barcodes, and multimedia forensic records.
          </p>
        </div>

        {reports.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium transition self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History Ledger</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, URLs, filenames, or report ID..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </form>

        {/* Modality Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full md:w-auto rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Modalities</option>
            <option value="text">Text Messages</option>
            <option value="url">Web URLs</option>
            <option value="qr">QR Barcodes</option>
            <option value="audio">Voice Audio</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          {/* Risk Band Filter */}
          <select
            value={selectedRiskBand}
            onChange={(e) => setSelectedRiskBand(e.target.value)}
            className="w-full md:w-auto rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Risk Bands</option>
            <option value="lower">Lower Risk (0-29)</option>
            <option value="moderate">Moderate Risk (30-59)</option>
            <option value="high">High Risk (60-79)</option>
            <option value="very_high">Very High Risk (80-100)</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reports Table or Cards */}
      {reports.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-slate-200">No Records Found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || selectedModality !== 'all' || selectedRiskBand !== 'all'
              ? 'No prior evaluations match your filter criteria. Try resetting search filters.'
              : 'Analysis history is currently empty. Run an inspection from the Unified Scanner.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              onClick={() => {
                onSelectReport(rep);
                onNavigate('results');
              }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-cyan-400">{rep.id}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {rep.modalities.join(', ')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(rep.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-200 truncate">
                  {rep.inputSummary.textSnippet ||
                    rep.inputSummary.submittedUrl ||
                    rep.inputSummary.qrPayload ||
                    rep.inputSummary.fileName ||
                    'Multimodal input analysis'}
                </p>

                <div className="text-[11px] text-slate-400">
                  Formula: <code className="text-cyan-400/80">{rep.fusion.fusionFormula}</code>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                <RiskBadge band={rep.fusion.riskBand} score={rep.fusion.trustRiskScore} />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportReportAsJson(rep);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                  title="Export JSON"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleDelete(rep.id, e)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
