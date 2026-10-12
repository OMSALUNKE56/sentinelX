import { AnalysisReport } from '../types/sentinel.js';

export function exportReportAsJson(report: AnalysisReport): void {
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sentinelx-report-${report.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrSaveReport(report: AnalysisReport): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SentinelX Forensic Report - ${report.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; }
          .header { border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
          .badge-lower { background: #dcfce7; color: #166534; }
          .badge-moderate { background: #fef3c7; color: #92400e; }
          .badge-high { background: #ffedd5; color: #9a3412; }
          .badge-very_high { background: #fee2e2; color: #991b1b; }
          .section { margin-top: 24px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 13px; }
          th { background: #f1f5f9; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SentinelX Digital Trust Platform — Forensic Risk Report</div>
          <div>Report ID: <strong>${report.id}</strong> | Timestamp: ${new Date(report.timestamp).toLocaleString()}</div>
        </div>

        <div>
          <h3>Trust Risk Score: <span class="badge badge-${report.fusion.riskBand}">${report.fusion.trustRiskScore} / 100 (${report.fusion.riskBand.replace('_', ' ')})</span></h3>
          <p><strong>Weighted Formula:</strong> <code>${report.fusion.fusionFormula}</code></p>
          <p>${report.fusion.summaryExplanation}</p>
        </div>

        ${report.geminiExplanation ? `
          <div class="section">
            <div class="section-title">Explainable AI Forensic Summary</div>
            <p>${report.geminiExplanation.explanationText}</p>
            <ul>
              ${report.geminiExplanation.threatBreakdown.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Detector Module Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Module Name</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Confidence</th>
                <th>Architecture</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(report.detectors).map(d => `
                <tr>
                  <td><strong>${d.name}</strong> (${d.version})</td>
                  <td>${d.status.toUpperCase()}</td>
                  <td>${d.riskScore !== null ? `${d.riskScore} / 100` : 'N/A'}</td>
                  <td>${d.confidence ? `${Math.round(d.confidence * 100)}%` : 'N/A'}</td>
                  <td>${d.modelDetails?.architecture || 'Standard Heuristic'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Recommended Next Actions</div>
          <ul>
            ${report.fusion.recommendedActions.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          SentinelX Academic Trust Platform &bull; Risk assessment and awareness platform. Not a definitive legal authority.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
