import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Globe,
  QrCode,
  Mic,
  Video,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Copy,
  Check,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  RefreshCw,
  Download,
  SlidersHorizontal,
  X,
  Radio,
  FileCode,
  AlertOctagon,
  ArrowUpDown,
  History as HistoryIcon,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalysisReport, AnalyticsSummary, SystemStatusResponse, RiskBand, ModalityType } from '../types/sentinel.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { QuickInspectorModal } from '../components/QuickInspectorModal.js';
import { exportReportAsJson } from '../utils/exportReport.js';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
  onSelectReport: (report: AnalysisReport) => void;
}

type SortField = 'timestamp' | 'score' | 'modality';
type SortOrder = 'asc' | 'desc';

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectReport,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Timeframe
  const [timeframe, setTimeframe] = useState<'today' | '7d' | 'all'>('all');

  // Chart view mode
  const [chartMode, setChartMode] = useState<'spectrum' | 'trend'>('spectrum');

  // Filters and table controls
  const [tableSearch, setTableSearch] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskBand>('all');
  const [modalityFilter, setModalityFilter] = useState<'all' | ModalityType>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Timeline feed filter
  const [timelineAlertsOnly, setTimelineAlertsOnly] = useState<boolean>(false);

  // Quick Inspector Modal
  const [inspectorReport, setInspectorReport] = useState<AnalysisReport | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick test state for specialized launchers
  const [runningQuickTest, setRunningQuickTest] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [an, hist, sys] = await Promise.all([
        apiClient.getAnalytics().catch(() => null),
        apiClient.getHistory({ limit: 50 }).catch(() => ({ items: [], total: 0 })),
        apiClient.getSystemStatus().catch(() => null),
      ]);
      if (an) setAnalytics(an);
      if (hist) setReports(hist.items);
      if (sys) setSystemStatus(sys);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Run instant 1-click test for any launcher
  const handleQuickLauncherTest = async (type: 'text' | 'url' | 'qr' | 'voice' | 'deepfake') => {
    setRunningQuickTest(type);
    try {
      let rep: AnalysisReport;
      if (type === 'text') {
        rep = await apiClient.analyzeText(
          'URGENT FRAUD ALERT: Your bank account will be suspended within 2 hours. Enter your OTP code now to cancel the charge.'
        );
      } else if (type === 'url') {
        rep = await apiClient.analyzeUrl('http://paypa1-security-verification.xyz/login?session=active');
      } else if (type === 'qr') {
        rep = await apiClient.analyzeQr('https://secure-chase-update.click/auth', 300, 300);
      } else if (type === 'voice') {
        rep = await apiClient.analyzeAudio({
          fileName: 'synthetic_voice_sample.wav',
          durationSec: 2.8,
          sampleRateHz: 16000,
          pcmBuffer: [0.1, -0.2, 0.4, -0.3, 0.2],
        });
      } else {
        rep = await apiClient.analyzeImage({
          fileName: 'generative_face.jpg',
          width: 1024,
          height: 1024,
          hasExifData: false,
        });
      }

      await fetchDashboardData();
      setInspectorReport(rep);
      setIsInspectorOpen(true);
    } catch {
      // fallback
    } finally {
      setRunningQuickTest(null);
    }
  };

  const copyReportId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered and sorted reports for table
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        const matchesSearch =
          !tableSearch ||
          r.id.toLowerCase().includes(tableSearch.toLowerCase()) ||
          (r.inputSummary.textSnippet && r.inputSummary.textSnippet.toLowerCase().includes(tableSearch.toLowerCase())) ||
          (r.inputSummary.submittedUrl && r.inputSummary.submittedUrl.toLowerCase().includes(tableSearch.toLowerCase())) ||
          (r.inputSummary.fileName && r.inputSummary.fileName.toLowerCase().includes(tableSearch.toLowerCase())) ||
          (r.inputSummary.qrPayload && r.inputSummary.qrPayload.toLowerCase().includes(tableSearch.toLowerCase()));

        const matchesRisk =
          riskFilter === 'all' || r.fusion.riskBand === riskFilter;

        const matchesModality =
          modalityFilter === 'all' || r.modalities.includes(modalityFilter);

        return matchesSearch && matchesRisk && matchesModality;
      })
      .sort((a, b) => {
        if (sortField === 'score') {
          return sortOrder === 'asc'
            ? a.fusion.trustRiskScore - b.fusion.trustRiskScore
            : b.fusion.trustRiskScore - a.fusion.trustRiskScore;
        }
        if (sortField === 'modality') {
          const modA = a.modalities[0] || '';
          const modB = b.modalities[0] || '';
          return sortOrder === 'asc'
            ? modA.localeCompare(modB)
            : modB.localeCompare(modA);
        }
        // default timestamp
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [reports, tableSearch, riskFilter, modalityFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    return filteredReports.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredReports, currentPage, itemsPerPage]);

  // Timeline feed items
  const timelineItems = useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (timelineAlertsOnly) {
      return sorted.filter((r) => r.fusion.riskBand === 'high' || r.fusion.riskBand === 'very_high').slice(0, 8);
    }
    return sorted.slice(0, 8);
  }, [reports, timelineAlertsOnly]);

  const totalScans = analytics?.totalAnalyses || reports.length || 0;
  const highRiskCount = (analytics?.riskDistribution.high || 0) + (analytics?.riskDistribution.very_high || 0);
  const lowerRiskCount = analytics?.riskDistribution.lower || 0;
  const moderateRiskCount = analytics?.riskDistribution.moderate || 0;
  const avgScore = analytics?.averageRiskScore || 0;

  // Relative time helper
  const getRelativeTime = (timestamp: string | number) => {
    const timeMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const diffMs = Date.now() - timeMs;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(timeMs).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Modality Icon Helper
  const getModalityIcon = (mod: string) => {
    switch (mod) {
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      case 'qr':
        return <QrCode className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'audio':
        return <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'image':
      case 'video':
        return <Video className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  // 7-day mock trend data based on current scans for the chart
  const trendDays = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      // Calculate realistic distributed values
      const weight = [0.12, 0.18, 0.14, 0.22, 0.16, 0.08, 0.10][i];
      const count = Math.max(1, Math.round(totalScans * weight));
      const threatCount = Math.round(count * 0.42);
      const safeCount = Math.max(0, count - threatCount);
      return { day, count, threatCount, safeCount };
    });
  }, [totalScans]);

  const maxDayCount = Math.max(...trendDays.map((d) => d.count), 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto transition-colors">
      {/* 1. Header & Welcome Area (Linear/Vercel Aesthetic) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Security Operations Console
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>5 Active Pipelines</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              Latency: 24ms
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multimodal trust verification across text, phishing URLs, QR matrix, voice spoofing, and deepfake forensics.
          </p>
        </div>

        {/* Quick controls: Timeframe tabs + Refresh + Primary CTA */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-2.5 py-1 rounded-md transition ${
                timeframe === 'today'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded-md transition ${
                timeframe === '7d'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Past 7D
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                timeframe === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh analytics and ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-500' : ''}`} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/10 transition active:scale-95 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-950" />
            <span>Unified Threat Scan</span>
          </button>
        </div>
      </div>

      {/* 2. Prominent Quick Actions Strip (Frequently Used Tasks) */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Actions & 1-Click Analyzers</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Directly test heuristics or launch specialized workspaces
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* Action 1: Text */}
          <button
            onClick={() => handleQuickLauncherTest('text')}
            disabled={runningQuickTest === 'text'}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 transition group"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition" />
            <span className="truncate">{runningQuickTest === 'text' ? 'Scanning...' : 'Test Text Scams'}</span>
          </button>

          {/* Action 2: URL */}
          <button
            onClick={() => handleQuickLauncherTest('url')}
            disabled={runningQuickTest === 'url'}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 transition group"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition" />
            <span className="truncate">{runningQuickTest === 'url' ? 'Scanning...' : 'Test Phish URL'}</span>
          </button>

          {/* Action 3: QR */}
          <button
            onClick={() => handleQuickLauncherTest('qr')}
            disabled={runningQuickTest === 'qr'}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 transition group"
          >
            <QrCode className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition" />
            <span className="truncate">{runningQuickTest === 'qr' ? 'Scanning...' : 'Test Quishing QR'}</span>
          </button>

          {/* Action 4: Voice */}
          <button
            onClick={() => handleQuickLauncherTest('voice')}
            disabled={runningQuickTest === 'voice'}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 transition group"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
            <span className="truncate">{runningQuickTest === 'voice' ? 'Scanning...' : 'Test Voice Spoof'}</span>
          </button>

          {/* Action 5: Deepfake */}
          <button
            onClick={() => handleQuickLauncherTest('deepfake')}
            disabled={runningQuickTest === 'deepfake'}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-xs font-medium text-slate-700 dark:text-slate-300 transition group"
          >
            <Video className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition" />
            <span className="truncate">{runningQuickTest === 'deepfake' ? 'Scanning...' : 'Test Media Fake'}</span>
          </button>

          {/* Action 6: Export Ledger */}
          <button
            onClick={() => {
              if (reports.length > 0) {
                exportReportAsJson(reports[0]);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition group"
            title="Download latest report as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition" />
            <span className="truncate">Export JSON</span>
          </button>
        </div>
      </div>

      {/* 3. Summary KPI Cards (Linear / Stripe Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Evaluations */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition space-y-2 shadow-xs group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Total Evaluations</span>
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalScans}
            </span>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-medium bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
              {analytics ? `${Object.keys(analytics.modalityCounts).length} Modalities` : 'Active'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Continuous stream telemetry</span>
          </div>
        </div>

        {/* KPI 2: High / Critical Threats */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-rose-300 dark:hover:border-rose-500/30 transition space-y-2 shadow-xs group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Critical & High Threats</span>
            <div className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {highRiskCount}
            </span>
            <span className="text-[11px] font-mono text-rose-700 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
              {totalScans > 0 ? `${Math.round((highRiskCount / totalScans) * 100)}% Flagged` : '0%'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
            Urgency lures, quishing, synthetic spoof
          </div>
        </div>

        {/* KPI 3: Benign / Lower Risk */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition space-y-2 shadow-xs group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Verified Lower Risk</span>
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {lowerRiskCount}
            </span>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
              {totalScans > 0 ? `${Math.round((lowerRiskCount / totalScans) * 100)}% Safe` : '0%'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
            Clean corporate & authentic vectors
          </div>
        </div>

        {/* KPI 4: Average Trust Risk */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition space-y-2 shadow-xs group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Average Risk Index</span>
            <div className="p-1 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-300 tabular-nums">
              {avgScore}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal"> / 100</span>
            </span>
            <span
              className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                avgScore >= 60
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                  : avgScore >= 30
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
              }`}
            >
              {avgScore >= 60 ? 'High' : avgScore >= 30 ? 'Moderate' : 'Lower'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate pt-0.5 font-mono">
            SUM(w_i * r_i) / SUM(w_i)
          </div>
        </div>
      </div>

      {/* 4. Visual Analytics & Threat Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Card (2 Columns): Risk Spectrum / 7-Day Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Threat Distribution & Velocity</h2>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {totalScans} evaluated records
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Interactive risk spectrum segmentation and activity velocity.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setChartMode('spectrum')}
                className={`px-2.5 py-1 rounded-md transition ${
                  chartMode === 'spectrum'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Risk Bands
              </button>
              <button
                onClick={() => setChartMode('trend')}
                className={`px-2.5 py-1 rounded-md transition ${
                  chartMode === 'trend'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                7-Day Velocity
              </button>
            </div>
          </div>

          {chartMode === 'spectrum' ? (
            <div className="space-y-4">
              {/* Segmented Bar */}
              <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex border border-slate-200 dark:border-slate-800 shadow-inner">
                <div
                  style={{ width: `${totalScans > 0 ? (lowerRiskCount / totalScans) * 100 : 33}%` }}
                  className="bg-emerald-500 transition-all duration-500 hover:opacity-90"
                  title={`Lower Risk: ${lowerRiskCount}`}
                />
                <div
                  style={{ width: `${totalScans > 0 ? (moderateRiskCount / totalScans) * 100 : 33}%` }}
                  className="bg-amber-500 transition-all duration-500 hover:opacity-90"
                  title={`Moderate Risk: ${moderateRiskCount}`}
                />
                <div
                  style={{ width: `${totalScans > 0 ? (highRiskCount / totalScans) * 100 : 34}%` }}
                  className="bg-rose-500 transition-all duration-500 hover:opacity-90"
                  title={`High / Critical Risk: ${highRiskCount}`}
                />
              </div>

              {/* Interactive Legend Cards (Clicking one filters the data table!) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                {/* Lower */}
                <div
                  onClick={() => {
                    setRiskFilter((prev) => (prev === 'lower' ? 'all' : 'lower'));
                    setCurrentPage(1);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    riskFilter === 'lower'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      <span>Lower Risk (0-29)</span>
                    </span>
                    {riskFilter === 'lower' && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">ACTIVE</span>
                    )}
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {lowerRiskCount}{' '}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      ({totalScans > 0 ? Math.round((lowerRiskCount / totalScans) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Click to filter table</div>
                </div>

                {/* Moderate */}
                <div
                  onClick={() => {
                    setRiskFilter((prev) => (prev === 'moderate' ? 'all' : 'moderate'));
                    setCurrentPage(1);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    riskFilter === 'moderate'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                      <span>Moderate (30-59)</span>
                    </span>
                    {riskFilter === 'moderate' && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold">ACTIVE</span>
                    )}
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {moderateRiskCount}{' '}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      ({totalScans > 0 ? Math.round((moderateRiskCount / totalScans) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Click to filter table</div>
                </div>

                {/* High */}
                <div
                  onClick={() => {
                    setRiskFilter((prev) => (prev === 'high' ? 'all' : 'high'));
                    setCurrentPage(1);
                  }}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    riskFilter === 'high'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 shadow-xs ring-1 ring-rose-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-rose-300 dark:hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" />
                      <span>High (60-100)</span>
                    </span>
                    {riskFilter === 'high' && (
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 font-mono font-bold">ACTIVE</span>
                    )}
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {highRiskCount}{' '}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      ({totalScans > 0 ? Math.round((highRiskCount / totalScans) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Click to filter table</div>
                </div>
              </div>
            </div>
          ) : (
            /* 7-Day Velocity Interactive Bar Chart */
            <div className="space-y-3 pt-2">
              <div className="flex items-end justify-between gap-2 h-36 px-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                {trendDays.map((d, idx) => {
                  const barHeightPct = Math.min(100, Math.round((d.count / maxDayCount) * 100));
                  const threatHeightPct = Math.round((d.threatCount / d.count) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-slate-900 dark:bg-slate-800 text-white px-2 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-md mb-1">
                        {d.count} scans ({d.threatCount} threats)
                      </div>
                      {/* Stacked bar */}
                      <div
                        className="w-full max-w-[28px] rounded-t bg-slate-200 dark:bg-slate-800 overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-110"
                        style={{ height: `${barHeightPct}%` }}
                      >
                        <div
                          className="w-full bg-emerald-500 transition-all"
                          style={{ height: `${100 - threatHeightPct}%` }}
                        />
                        <div
                          className="w-full bg-rose-500 transition-all"
                          style={{ height: `${threatHeightPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                    <span>Threat Influx</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Verified Benign</span>
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">Past 7 Days Aggregation</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Modality Vector Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-3.5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Modality Vector Share</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                5 Channels
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluated traffic across specialized input modalities.
            </p>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { id: 'text', label: 'Text Messages', count: analytics?.modalityCounts.text || 0, color: 'bg-blue-500', icon: FileText },
              { id: 'url', label: 'Web URLs', count: analytics?.modalityCounts.url || 0, color: 'bg-cyan-500', icon: Globe },
              { id: 'qr', label: 'QR Barcodes', count: analytics?.modalityCounts.qr || 0, color: 'bg-purple-500', icon: QrCode },
              { id: 'audio', label: 'Voice Audio', count: analytics?.modalityCounts.audio || 0, color: 'bg-emerald-500', icon: Mic },
              { id: 'image', label: 'Media Forensics', count: (analytics?.modalityCounts.image || 0) + (analytics?.modalityCounts.video || 0), color: 'bg-amber-500', icon: Video },
            ].map((m) => {
              const Icon = m.icon;
              const pct = totalScans > 0 ? Math.round((m.count / totalScans) * 100) : 0;
              const isSelected = modalityFilter === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setModalityFilter((prev) => (prev === m.id ? 'all' : (m.id as ModalityType)));
                    setCurrentPage(1);
                  }}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] pb-1">
                    <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                      <Icon className="w-3 h-3 text-slate-500" />
                      <span>{m.label}</span>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {m.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>Filter by modality above</span>
            {modalityFilter !== 'all' && (
              <button
                onClick={() => setModalityFilter('all')}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-mono"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Workspace: Two Columns (Data Table 2/3 + Live Activity Feed 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1 (8 Cols): Security Evaluations Data Table */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xs">
          {/* Table Header and Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Security Evaluations Ledger</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  ({filteredReports.length} matches)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Search, sort, filter, and inspect verified records with full forensic details.
              </p>
            </div>

            {/* Sorting Dropdown & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSortToggle('score')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
                  sortField === 'score'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Sort by Trust Risk Score"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Score {sortField === 'score' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
              </button>

              <button
                onClick={() => handleSortToggle('timestamp')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
                  sortField === 'timestamp'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Sort by Timestamp"
              >
                <span>Date {sortField === 'timestamp' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
              </button>
            </div>
          </div>

          {/* Table Filters Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by ID, URL, text snippet, filename..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              {tableSearch && (
                <button
                  onClick={() => {
                    setTableSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Risk Filters Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => {
                  setRiskFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-md transition ${
                  riskFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setRiskFilter('high');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-md transition ${
                  riskFilter === 'high'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                High
              </button>
              <button
                onClick={() => {
                  setRiskFilter('moderate');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-md transition ${
                  riskFilter === 'moderate'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => {
                  setRiskFilter('lower');
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-md transition ${
                  riskFilter === 'lower'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                Lower
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(tableSearch || riskFilter !== 'all' || modalityFilter !== 'all') && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
              <span className="text-slate-400 font-mono">Active filters:</span>
              {tableSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Search: "{tableSearch}"
                  <button onClick={() => setTableSearch('')} className="hover:text-rose-500">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {riskFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Risk: {riskFilter}
                  <button onClick={() => setRiskFilter('all')} className="hover:text-rose-500">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {modalityFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Modality: {modalityFilter}
                  <button onClick={() => setModalityFilter('all')} className="hover:text-rose-500">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setTableSearch('');
                  setRiskFilter('all');
                  setModalityFilter('all');
                }}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-mono text-[10px] ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Table Container */}
          {paginatedReports.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                No matching evaluations found
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {tableSearch || riskFilter !== 'all' || modalityFilter !== 'all'
                  ? 'Try clearing the search query or active filter tags above.'
                  : 'Run your first inspection via the Unified Scanner or test a launcher above.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => handleQuickLauncherTest('text')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 text-xs font-medium hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition cursor-pointer"
                >
                  Run Sample Threat Scan
                </button>
                {(tableSearch || riskFilter !== 'all' || modalityFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setTableSearch('');
                      setRiskFilter('all');
                      setModalityFilter('all');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-4 font-semibold">Report Identifier</th>
                    <th className="py-2.5 px-4 font-semibold">Target / Content Snippet</th>
                    <th className="py-2.5 px-4 font-semibold">Modality</th>
                    <th className="py-2.5 px-4 font-semibold">Trust Risk Score</th>
                    <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60">
                  {paginatedReports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => {
                        setInspectorReport(report);
                        setIsInspectorOpen(true);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      {/* Identifier */}
                      <td className="py-3 px-4 font-mono text-cyan-700 dark:text-cyan-400 font-semibold text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{report.id}</span>
                          <button
                            onClick={(e) => copyReportId(report.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title="Copy ID"
                          >
                            {copiedId === report.id ? (
                              <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Target / Snippet */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-sm truncate text-slate-800 dark:text-slate-200 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0">{getModalityIcon(report.modalities[0])}</span>
                          <span className="truncate">
                            {report.inputSummary.textSnippet ||
                              report.inputSummary.submittedUrl ||
                              report.inputSummary.qrPayload ||
                              report.inputSummary.fileName ||
                              'Multimodal inspection'}
                          </span>
                        </div>
                      </td>

                      {/* Modality Badges */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {report.modalities.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Risk Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <RiskBadge band={report.fusion.riskBand} score={report.fusion.trustRiskScore} size="sm" />
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {getRelativeTime(report.timestamp)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setInspectorReport(report);
                              setIsInspectorOpen(true);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Quick Inspector Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectReport(report);
                              onNavigate('results');
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Open Full Forensic Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredReports.length > itemsPerPage && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length}
              </span>

              <div className="flex items-center gap-1.5 font-mono">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column 2 (4 Cols): Recent Activity Feed / Timeline */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Activity Feed</h2>
            </div>
            <button
              onClick={() => setTimelineAlertsOnly(!timelineAlertsOnly)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                timelineAlertsOnly
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {timelineAlertsOnly ? 'Critical Only' : 'All Events'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time timeline of incoming evaluations and telemetry events.
          </p>

          {/* Activity Timeline List */}
          {timelineItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              No recent events in the active filter.
            </div>
          ) : (
            <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timelineItems.map((item) => {
                const isHigh = item.fusion.riskBand === 'high' || item.fusion.riskBand === 'very_high';
                const isModerate = item.fusion.riskBand === 'moderate';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInspectorReport(item);
                      setIsInspectorOpen(true);
                    }}
                    className="relative pl-3 cursor-pointer group"
                  >
                    {/* Node Dot on timeline line */}
                    <div
                      className={`absolute -left-[14px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 transition ${
                        isHigh
                          ? 'bg-rose-500'
                          : isModerate
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />

                    {/* Timeline Card */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold truncate max-w-[120px]">
                          {item.id}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                          {getRelativeTime(item.timestamp)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                        {item.inputSummary.textSnippet ||
                          item.inputSummary.submittedUrl ||
                          item.inputSummary.qrPayload ||
                          item.inputSummary.fileName ||
                          'Multimodal package analysis'}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1">
                          {item.modalities.map((m, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono px-1 py-0.2 rounded bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 uppercase"
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold ${
                            isHigh
                              ? 'text-rose-600 dark:text-rose-400'
                              : isModerate
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.fusion.trustRiskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => onNavigate('history')}
              className="w-full py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
            >
              <span>View Complete Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Quick Inspector Modal */}
      <QuickInspectorModal
        report={inspectorReport}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onOpenFullReport={(rep) => {
          setIsInspectorOpen(false);
          onSelectReport(rep);
          onNavigate('results');
        }}
      />
    </div>
  );
};
