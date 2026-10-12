export type RiskBand = 'lower' | 'moderate' | 'high' | 'very_high';

export type ModalityType = 'text' | 'url' | 'qr' | 'audio' | 'image' | 'video' | 'multimodal';

export type DetectorStatus = 'success' | 'failed' | 'unconfigured' | 'skipped';

export interface EvidenceItem {
  id: string;
  label: string;
  value: string | number | boolean;
  severity: 'info' | 'warning' | 'danger' | 'safe';
  explanation: string;
  category?: 'urgency' | 'credential' | 'impersonation' | 'domain' | 'entropy' | 'spectral' | 'artifact' | 'other';
}

export interface DetectorResult {
  moduleId: string;
  name: string;
  version: string;
  status: DetectorStatus;
  riskScore: number | null; // 0 - 100
  normalizedRisk: number | null; // 0.0 - 1.0
  confidence: number | null; // 0.0 - 1.0
  reasonCodes: string[];
  evidence: EvidenceItem[];
  processingTimeMs: number;
  limitations: string[];
  errorDetails?: string;
  modelDetails?: {
    architecture: string;
    datasetGrounding?: string;
    inferenceType: 'rule_heuristic' | 'local_classifier' | 'external_model_service';
    statusNote: string;
  };
}

export interface FusionResult {
  trustRiskScore: number; // 0 - 100
  riskBand: RiskBand;
  combinedRisk: number; // 0.0 - 1.0
  fusionFormula: string;
  activeWeights: Record<string, number>;
  modulesEvaluated: number;
  modulesUnconfiguredOrFailed: number;
  isAssessable: boolean;
  summaryExplanation: string;
  recommendedActions: string[];
  primaryRiskDrivers: string[];
}

export interface AnalysisInputSummary {
  textSnippet?: string;
  textLength?: number;
  submittedUrl?: string;
  normalizedUrl?: string;
  qrPayload?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  mediaDurationSec?: number;
}

export interface GeminiExplanation {
  explanationText: string;
  threatBreakdown: string[];
  preventiveAdvice: string[];
  generatedAt: string;
  modelUsed: string;
  isFallback: boolean;
}

export interface AnalysisReport {
  id: string;
  timestamp: string;
  inputSummary: AnalysisInputSummary;
  modalities: ModalityType[];
  detectors: Record<string, DetectorResult>;
  fusion: FusionResult;
  geminiExplanation?: GeminiExplanation;
  privacyMode: boolean;
  systemVersion: string;
}

export interface SystemStatusResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  detectors: {
    text_nlp_detector: { status: 'operational'; version: string; description: string };
    url_phishing_detector: { status: 'operational'; version: string; description: string };
    qr_analyzer: { status: 'operational'; version: string; description: string };
    audio_voice_spoof_detector: { status: 'operational' | 'unconfigured'; version: string; description: string };
    image_deepfake_detector: { status: 'operational' | 'unconfigured'; version: string; description: string };
  };
  environment: {
    geminiConfigured: boolean;
    persistenceMode: 'local_storage' | 'cloud_firestore';
    externalModelServiceUrl: string | null;
  };
}

export interface AnalyticsSummary {
  totalAnalyses: number;
  riskDistribution: {
    lower: number;
    moderate: number;
    high: number;
    very_high: number;
  };
  modalityCounts: Record<ModalityType, number>;
  averageRiskScore: number;
  frequentReasonCodes: { code: string; label: string; count: number }[];
  detectorSuccessRate: Record<string, { total: number; success: number }>;
  recentTrend: { date: string; count: number; avgRisk: number }[];
}
