import { AnalysisReport, AnalyticsSummary, ModalityType } from '../../src/types/sentinel.js';

class HistoryStore {
  private reports: Map<string, AnalysisReport> = new Map();

  constructor() {
    // Seed with realistic baseline sample checks if requested, or leave clean
  }

  public saveReport(report: AnalysisReport): void {
    if (report.privacyMode) {
      // Do not persist in ephemeral privacy mode
      return;
    }
    this.reports.set(report.id, report);
    
    // Auto-cap to 200 items in memory to prevent memory leaks
    if (this.reports.size > 200) {
      const oldestKey = this.reports.keys().next().value;
      if (oldestKey) this.reports.delete(oldestKey);
    }
  }

  public getReport(id: string): AnalysisReport | undefined {
    return this.reports.get(id);
  }

  public listReports(options?: {
    search?: string;
    modality?: string;
    riskBand?: string;
    limit?: number;
    offset?: number;
  }): { items: AnalysisReport[]; total: number } {
    let items = Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (options?.search) {
      const q = options.search.toLowerCase();
      items = items.filter(r => 
        (r.inputSummary.textSnippet && r.inputSummary.textSnippet.toLowerCase().includes(q)) ||
        (r.inputSummary.submittedUrl && r.inputSummary.submittedUrl.toLowerCase().includes(q)) ||
        (r.inputSummary.fileName && r.inputSummary.fileName.toLowerCase().includes(q)) ||
        (r.inputSummary.qrPayload && r.inputSummary.qrPayload.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }

    if (options?.modality && options.modality !== 'all') {
      items = items.filter(r => r.modalities.includes(options.modality as ModalityType));
    }

    if (options?.riskBand && options.riskBand !== 'all') {
      items = items.filter(r => r.fusion.riskBand === options.riskBand);
    }

    const total = items.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return {
      items: items.slice(offset, offset + limit),
      total,
    };
  }

  public deleteReport(id: string): boolean {
    return this.reports.delete(id);
  }

  public clearAll(): void {
    this.reports.clear();
  }

  public getAnalyticsSummary(): AnalyticsSummary {
    const all = Array.from(this.reports.values());
    const totalAnalyses = all.length;

    const riskDistribution = {
      lower: 0,
      moderate: 0,
      high: 0,
      very_high: 0,
    };

    const modalityCounts: Record<ModalityType, number> = {
      text: 0,
      url: 0,
      qr: 0,
      audio: 0,
      image: 0,
      video: 0,
      multimodal: 0,
    };

    let totalScoreSum = 0;
    const reasonCodeMap: Map<string, { label: string; count: number }> = new Map();

    for (const rep of all) {
      const band = rep.fusion.riskBand;
      if (riskDistribution[band] !== undefined) {
        riskDistribution[band]++;
      }
      totalScoreSum += rep.fusion.trustRiskScore;

      for (const mod of rep.modalities) {
        modalityCounts[mod] = (modalityCounts[mod] || 0) + 1;
      }

      // Collect reason codes
      for (const det of Object.values(rep.detectors)) {
        for (const code of det.reasonCodes) {
          const existing = reasonCodeMap.get(code);
          const label = det.evidence.find(e => e.id.includes(code))?.label || code;
          if (existing) {
            existing.count++;
          } else {
            reasonCodeMap.set(code, { label, count: 1 });
          }
        }
      }
    }

    const frequentReasonCodes = Array.from(reasonCodeMap.entries())
      .map(([code, data]) => ({ code, label: data.label, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const averageRiskScore = totalAnalyses > 0 ? Math.round(totalScoreSum / totalAnalyses) : 0;

    // Group by day for trend
    const dayMap: Map<string, { count: number; sum: number }> = new Map();
    for (const rep of all) {
      const day = rep.timestamp.split('T')[0];
      const entry = dayMap.get(day) || { count: 0, sum: 0 };
      entry.count++;
      entry.sum += rep.fusion.trustRiskScore;
      dayMap.set(day, entry);
    }

    const recentTrend = Array.from(dayMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgRisk: Math.round(data.sum / data.count),
      }))
      .slice(-7);

    return {
      totalAnalyses,
      riskDistribution,
      modalityCounts,
      averageRiskScore,
      frequentReasonCodes,
      detectorSuccessRate: {
        text_nlp_detector: { total: totalAnalyses, success: totalAnalyses },
        url_phishing_detector: { total: totalAnalyses, success: totalAnalyses },
        qr_analyzer: { total: totalAnalyses, success: totalAnalyses },
        audio_voice_spoof_detector: { total: totalAnalyses, success: totalAnalyses },
        image_deepfake_detector: { total: totalAnalyses, success: totalAnalyses },
      },
      recentTrend,
    };
  }
}

export const historyStore = new HistoryStore();
