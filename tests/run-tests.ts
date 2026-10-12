import { analyzeTextMessage } from '../server/detectors/textDetector.js';
import { analyzeUrlSafety } from '../server/detectors/urlDetector.js';
import { analyzeQrPayload } from '../server/detectors/qrDetector.js';
import { analyzeAudioAuthenticity } from '../server/detectors/audioDetector.js';
import { analyzeMediaAuthenticity } from '../server/detectors/imageVideoDetector.js';
import { executeTrustFusion } from '../server/fusion/trustFusionEngine.js';
import { historyStore } from '../server/services/historyStore.js';
import { DetectorResult } from '../src/types/sentinel.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
    passedCount++;
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}${detail ? ` - ${detail}` : ''}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log(' SentinelX Automated Verification & Unit Test Suite ');
  console.log('====================================================\n');

  // Test 1: Legitimate text
  const cleanText = 'Hi team, the conference room has been booked for our 3 PM engineering design review.';
  const cleanTextResult = analyzeTextMessage(cleanText);
  assert(
    cleanTextResult.status === 'success' && (cleanTextResult.riskScore || 0) < 30,
    'Test 1: Legitimate text yields Lower Risk band (<30)'
  );

  // Test 2: Suspicious text (Urgency + Lawsuit + Gift Cards)
  const scamText = 'FINAL NOTICE: IRS arrest warrant issued within 2 hours. Pay clearance fee immediately via Apple gift cards!';
  const scamTextResult = analyzeTextMessage(scamText);
  assert(
    scamTextResult.status === 'success' && (scamTextResult.riskScore || 0) >= 60,
    'Test 2: Coercive extortion text flagged as High/Very High Risk'
  );

  // Test 3: Syntactically valid benign URL
  const benignUrl = 'https://docs.github.com/en/get-started';
  const benignUrlResult = analyzeUrlSafety(benignUrl);
  assert(
    benignUrlResult.status === 'success' && (benignUrlResult.riskScore || 0) < 30,
    'Test 3: Benign standard URL parsed safely with low risk score'
  );

  // Test 4: Suspicious URL (Lookalike + Abused TLD + Login keyword)
  const phishUrl = 'http://paypa1-security-verification.xyz/login?session=active';
  const phishUrlResult = analyzeUrlSafety(phishUrl);
  assert(
    phishUrlResult.status === 'success' &&
    (phishUrlResult.riskScore || 0) >= 60 &&
    phishUrlResult.reasonCodes.some(c => c.includes('BRAND_IMPERSONATION') || c.includes('TYPOSQUATTING') || c === 'HIGH_RISK_TLD'),
    'Test 4: Typosquatting lookalike URL correctly flagged with reason codes'
  );

  // Test 5: Valid QR payload with URL
  const qrResult = analyzeQrPayload('https://wellsfargo-update.click/auth', 300, 300);
  assert(
    qrResult.status === 'success' && (qrResult.riskScore || 0) >= 40,
    'Test 5: QR payload successfully evaluated and piped through URL engine'
  );

  // Test 6: Invalid / empty QR payload
  const emptyQrResult = analyzeQrPayload('');
  assert(
    emptyQrResult.status === 'failed' && emptyQrResult.riskScore === null,
    'Test 6: Empty QR payload gracefully returns failure status without throwing'
  );

  // Test 7: Audio acoustic analysis baseline
  const audioResult = await analyzeAudioAuthenticity({
    fileName: 'sample_voicemail.wav',
    durationSec: 3.5,
    sampleRateHz: 16000,
    fileSizeBytes: 120000,
    pcmBuffer: [0.1, -0.2, 0.4, -0.3, 0.2, -0.1],
  });
  assert(
    audioResult.status === 'success' && audioResult.confidence !== null,
    'Test 7: Audio acoustic baseline extracts features (ZCR, duration) with calibrated confidence'
  );

  // Test 8: Deepfake media analysis
  const mediaResult = await analyzeMediaAuthenticity({
    mediaType: 'image',
    fileName: 'ai_headshot.png',
    fileSizeBytes: 2048000,
    width: 1024,
    height: 1024,
    hasExifData: false,
  });
  assert(
    mediaResult.status === 'success' &&
    mediaResult.reasonCodes.includes('COMMON_GENERATIVE_DIFFUSION_DIMENSIONS'),
    'Test 8: 1024x1024 square image without EXIF correctly triggers latent diffusion heuristic'
  );

  // Test 9: Fusion Arithmetic - Weighted Formula Verification
  // Combined Risk = SUM(w_i * r_i) / SUM(w_i)
  // Text (w=1.0, r=0.8), URL (w=1.25, r=0.4)
  // Expected: (1.0*0.8 + 1.25*0.4) / (1.0 + 1.25) = (0.8 + 0.5) / 2.25 = 1.3 / 2.25 = 0.5778 -> round(57.78) = 58
  const mockDetectors: Record<string, DetectorResult> = {
    text_nlp_detector: {
      moduleId: 'text_nlp_detector',
      name: 'Text',
      version: '1.0',
      status: 'success',
      riskScore: 80,
      normalizedRisk: 0.8,
      confidence: 0.9,
      reasonCodes: ['TEST_R1'],
      evidence: [],
      processingTimeMs: 10,
      limitations: [],
    },
    url_phishing_detector: {
      moduleId: 'url_phishing_detector',
      name: 'URL',
      version: '1.0',
      status: 'success',
      riskScore: 40,
      normalizedRisk: 0.4,
      confidence: 0.9,
      reasonCodes: ['TEST_R2'],
      evidence: [],
      processingTimeMs: 10,
      limitations: [],
    },
  };
  const fusionResult = executeTrustFusion(mockDetectors);
  assert(
    fusionResult.trustRiskScore === 58 && fusionResult.riskBand === 'moderate',
    `Test 9: Trust Fusion Engine calculates exact reproducible weighted score (Got ${fusionResult.trustRiskScore}, expected 58)`
  );

  // Test 10: Graceful degradation when one detector fails
  const partialDetectors: Record<string, DetectorResult> = {
    text_nlp_detector: {
      moduleId: 'text_nlp_detector',
      name: 'Text',
      version: '1.0',
      status: 'success',
      riskScore: 75,
      normalizedRisk: 0.75,
      confidence: 0.8,
      reasonCodes: ['TEXT_FLAG'],
      evidence: [],
      processingTimeMs: 10,
      limitations: [],
    },
    qr_analyzer: {
      moduleId: 'qr_analyzer',
      name: 'QR',
      version: '1.0',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['QR_FAIL'],
      evidence: [],
      processingTimeMs: 5,
      limitations: [],
    },
  };
  const partialFusion = executeTrustFusion(partialDetectors);
  assert(
    partialFusion.modulesEvaluated === 1 &&
    partialFusion.modulesUnconfiguredOrFailed === 1 &&
    partialFusion.trustRiskScore === 75,
    'Test 10: Failed detector does not crash fusion; active weights renormalize cleanly'
  );

  // Test 11: All detectors fail or return unconfigured
  const failedDetectors: Record<string, DetectorResult> = {
    text_nlp_detector: {
      moduleId: 'text_nlp_detector',
      name: 'Text',
      version: '1.0',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['EMPTY'],
      evidence: [],
      processingTimeMs: 2,
      limitations: [],
    },
  };
  const allFailedFusion = executeTrustFusion(failedDetectors);
  assert(
    allFailedFusion.isAssessable === false && allFailedFusion.modulesEvaluated === 0,
    'Test 11: When all detectors fail, system honestly reports "Unable to assess"'
  );

  // Test 12: Privacy Mode - Ephemeral Unpersisted Ledger Check
  const ephemeralReportId = 'sx-privacy-test-999';
  historyStore.saveReport({
    id: ephemeralReportId,
    timestamp: new Date().toISOString(),
    inputSummary: { textSnippet: 'Confidential message' },
    modalities: ['text'],
    detectors: {},
    fusion: {
      trustRiskScore: 10,
      riskBand: 'lower',
      combinedRisk: 0.1,
      fusionFormula: 'test',
      activeWeights: {},
      modulesEvaluated: 1,
      modulesUnconfiguredOrFailed: 0,
      isAssessable: true,
      summaryExplanation: 'Privacy test',
      recommendedActions: [],
      primaryRiskDrivers: [],
    },
    privacyMode: true,
    systemVersion: '3.0.0',
  });
  const lookup = historyStore.getReport(ephemeralReportId);
  assert(
    lookup === undefined,
    'Test 12: Privacy Mode strictly guarantees zero persistence in audit history'
  );

  console.log('\n----------------------------------------------------');
  console.log(`Tests Completed: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('----------------------------------------------------');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
