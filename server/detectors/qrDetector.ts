import jsQR from 'jsqr';
import { DetectorResult, EvidenceItem } from '../../src/types/sentinel.js';
import { analyzeUrlSafety } from './urlDetector.js';

export interface QrDecodeInput {
  rgbaBuffer?: Uint8ClampedArray | Uint8Array;
  width?: number;
  height?: number;
  rawPayload?: string; // If decoded on client-side canvas
}

export function analyzeQrPayload(payload: string, width?: number, height?: number): DetectorResult {
  const startTime = Date.now();
  const trimmed = (payload || '').trim();

  if (!trimmed) {
    return {
      moduleId: 'qr_analyzer',
      name: 'QR Code Security Analyzer',
      version: '1.2.0-jsqr-engine',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['QR_EMPTY_PAYLOAD'],
      evidence: [],
      processingTimeMs: Date.now() - startTime,
      limitations: ['QR payload is empty or corrupted.'],
      errorDetails: 'No readable data extracted from QR image.',
    };
  }

  const evidence: EvidenceItem[] = [];
  const reasonCodes: string[] = [];
  let accumulatedRisk = 0;

  evidence.push({
    id: 'ev-qr-data',
    label: 'Decoded QR Content',
    value: trimmed.length > 80 ? trimmed.substring(0, 80) + '...' : trimmed,
    severity: 'info',
    explanation: 'Unpacked raw symbol payload from matrix barcode.',
  });

  if (width && height) {
    evidence.push({
      id: 'ev-qr-dimensions',
      label: 'Matrix Resolution',
      value: `${width} × ${height} px`,
      severity: 'info',
      explanation: 'Sufficient raster fidelity for error-correction decoding.',
    });
  }

  // Scheme analysis
  const lower = trimmed.toLowerCase();
  const isHttpUrl = lower.startsWith('http://') || lower.startsWith('https://');
  const isJavascriptScheme = lower.startsWith('javascript:') || lower.startsWith('data:');
  const isIntentScheme = lower.startsWith('intent:') || lower.startsWith('market:');
  const isPaymentScheme = lower.startsWith('upi://') || lower.startsWith('bitcoin:') || lower.startsWith('ethereum:');

  if (isJavascriptScheme) {
    accumulatedRisk += 80;
    reasonCodes.push('QR_EXECUTABLE_SCRIPT_SCHEME');
    evidence.push({
      id: 'ev-qr-script',
      label: 'Executable / Data URI Scheme',
      value: trimmed.split(':')[0],
      severity: 'danger',
      category: 'urgency',
      explanation: 'Dangerous client-side execution scheme designed for XSS or browser exploit payloads.',
    });
  } else if (isIntentScheme) {
    accumulatedRisk += 45;
    reasonCodes.push('QR_APPLICATION_INTENT_HIJACK');
    evidence.push({
      id: 'ev-qr-intent',
      label: 'App Intent / Market Deep Link',
      value: trimmed.split(':')[0],
      severity: 'warning',
      category: 'urgency',
      explanation: 'Forces launch of third-party package or application store without user prompt.',
    });
  } else if (isPaymentScheme) {
    accumulatedRisk += 25;
    reasonCodes.push('QR_DIRECT_CRYPTO_OR_UPI_PAYMENT');
    evidence.push({
      id: 'ev-qr-pay',
      label: 'Immediate Payment / Transfer URI',
      value: trimmed.split(':')[0],
      severity: 'warning',
      category: 'credential',
      explanation: 'Direct payment request. Quishing attacks replace physical merchant QR tags with malicious payment destinations.',
    });
  } else if (isHttpUrl) {
    // Re-use URL Analyzer
    const urlResult = analyzeUrlSafety(trimmed);
    const urlRisk = urlResult.riskScore || 0;
    accumulatedRisk = Math.max(accumulatedRisk, urlRisk);

    // Merge URL evidence items with QR prefix
    for (const ev of urlResult.evidence) {
      evidence.push({
        ...ev,
        id: `qr-${ev.id}`,
        label: `[QR Destination] ${ev.label}`,
      });
    }
    for (const code of urlResult.reasonCodes) {
      reasonCodes.push(`QR_${code}`);
    }
  } else {
    // Plain text payload
    evidence.push({
      id: 'ev-qr-text',
      label: 'Plain Text Payload',
      value: 'Static String (Non-URL)',
      severity: 'safe',
      explanation: 'Contains static non-executable text with no automatic web redirect.',
    });
  }

  const finalRiskScore = Math.min(100, Math.max(0, Math.round(accumulatedRisk)));
  const normalizedRisk = Number((finalRiskScore / 100).toFixed(2));
  const confidence = 0.90;

  return {
    moduleId: 'qr_analyzer',
    name: 'QR Code Security Analyzer',
    version: '1.2.0-jsqr-engine',
    status: 'success',
    riskScore: finalRiskScore,
    normalizedRisk,
    confidence,
    reasonCodes: reasonCodes.length > 0 ? reasonCodes : ['CLEAN_QR_PAYLOAD'],
    evidence,
    processingTimeMs: Date.now() - startTime,
    limitations: [
      'Visual QR decoding relies on optical clarity and undamaged timing pattern markers.',
      'Physical QR replacement attacks (quishing stickers) must be visually confirmed on-site.',
      'Destination website content is not actively crawled to avoid triggering attacker tokens.',
    ],
    modelDetails: {
      architecture: 'Reed-Solomon Error Correction Decoder (jsQR) + Secondary URL Phishing Filter',
      datasetGrounding: 'ISO/IEC 18004 QR Code standard specifications & Quishing threat intelligence',
      inferenceType: 'rule_heuristic',
      statusNote: 'Operational (Embedded decoder + URL pipeline)',
    },
  };
}

export function decodeAndAnalyzeQrBuffer(rgba: Uint8ClampedArray, width: number, height: number): DetectorResult {
  const startTime = Date.now();
  try {
    const code = jsQR(rgba, width, height, { inversionAttempts: 'attemptBoth' });
    if (!code) {
      return {
        moduleId: 'qr_analyzer',
        name: 'QR Code Security Analyzer',
        version: '1.2.0-jsqr-engine',
        status: 'failed',
        riskScore: null,
        normalizedRisk: null,
        confidence: null,
        reasonCodes: ['QR_NOT_FOUND_OR_UNREADABLE'],
        evidence: [
          {
            id: 'ev-qr-err',
            label: 'Symbol Scanning Result',
            value: 'No valid QR pattern found in raster',
            severity: 'warning',
            explanation: 'The provided image did not contain recognized QR alignment markers or was excessively blurry.',
          }
        ],
        processingTimeMs: Date.now() - startTime,
        limitations: ['Image resolution, contrast, or rotation may prevent symbol acquisition.'],
        errorDetails: 'No valid QR code discovered in the image raster.',
      };
    }

    return analyzeQrPayload(code.data, width, height);
  } catch (err: any) {
    return {
      moduleId: 'qr_analyzer',
      name: 'QR Code Security Analyzer',
      version: '1.2.0-jsqr-engine',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['QR_DECODE_EXCEPTION'],
      evidence: [],
      processingTimeMs: Date.now() - startTime,
      limitations: ['Raster decode failed'],
      errorDetails: err?.message || 'Unexpected QR decode exception',
    };
  }
}
