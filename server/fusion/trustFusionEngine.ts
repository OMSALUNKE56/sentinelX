import { DetectorResult, FusionResult, RiskBand } from '../../src/types/sentinel.js';

// Documented baseline weights per detector module
export const DETECTOR_WEIGHTS: Record<string, number> = {
  url_phishing_detector: 1.25, // Malicious destination poses direct credential/malware threat
  text_nlp_detector: 1.00,    // Social engineering linguistic indicators
  qr_analyzer: 1.10,          // Quishing obfuscates destination
  audio_voice_spoof_detector: 0.95, // Synthetic speech indicator
  image_deepfake_detector: 0.95,    // Generative visual manipulation
};

export function determineRiskBand(score: number): RiskBand {
  if (score < 30) return 'lower';
  if (score < 60) return 'moderate';
  if (score < 80) return 'high';
  return 'very_high';
}

export function generateRecommendedActions(riskBand: RiskBand, primaryDrivers: string[]): string[] {
  const actions: string[] = [];

  if (riskBand === 'very_high') {
    actions.push('DO NOT click any links, scan QR codes, or execute payment requests.');
    actions.push('Cease communication immediately and do not reply or engage with the sender.');
    actions.push('Report the message or sender through official institutional or platform fraud channels.');
    actions.push('If sensitive credentials or 2FA codes were entered, immediately reset passwords and revoke active sessions.');
  } else if (riskBand === 'high') {
    actions.push('Exercise extreme caution. Do not share one-time passcodes, financial details, or personal information.');
    actions.push('Verify the identity of the sender independently using official published phone numbers or bookmarked URLs.');
    actions.push('Inspect the destination domain carefully for typosquatting or homoglyphs before taking any action.');
  } else if (riskBand === 'moderate') {
    actions.push('Treat with vigilance: verify unfamiliar senders or unexpected messages through an independent channel.');
    actions.push('Avoid opening unexpected attachments or shortened web links.');
    actions.push('Ensure multi-factor authentication (MFA) is enabled on your primary accounts.');
  } else {
    actions.push('No acute scam indicators detected by active models. Continue observing standard cyber hygiene.');
    actions.push('Always confirm payment requests or account changes through authenticated internal workflows.');
  }

  return actions;
}

export function executeTrustFusion(detectors: Record<string, DetectorResult>): FusionResult {
  const activeWeights: Record<string, number> = {};
  let weightedRiskSum = 0;
  let totalActiveWeight = 0;
  let modulesEvaluated = 0;
  let modulesUnconfiguredOrFailed = 0;

  const validDetectors: DetectorResult[] = [];
  const primaryRiskDrivers: string[] = [];

  // Iterate over all submitted detector outputs
  for (const [moduleId, result] of Object.entries(detectors)) {
    if (result.status === 'success' && result.normalizedRisk !== null && typeof result.normalizedRisk === 'number') {
      const weight = DETECTOR_WEIGHTS[moduleId] || 1.0;
      activeWeights[moduleId] = weight;
      weightedRiskSum += weight * result.normalizedRisk;
      totalActiveWeight += weight;
      modulesEvaluated++;
      validDetectors.push(result);

      if (result.riskScore && result.riskScore >= 40) {
        primaryRiskDrivers.push(`${result.name} (Risk: ${result.riskScore}/100)`);
      }
    } else if (result.status === 'failed' || result.status === 'unconfigured') {
      modulesUnconfiguredOrFailed++;
    }
  }

  // If no valid outputs exist: Unable to assess
  if (modulesEvaluated === 0 || totalActiveWeight === 0) {
    return {
      trustRiskScore: 0,
      riskBand: 'lower',
      combinedRisk: 0,
      fusionFormula: 'SUM(w_i * r_i) / SUM(w_i) [No Valid Modules Available]',
      activeWeights: {},
      modulesEvaluated: 0,
      modulesUnconfiguredOrFailed,
      isAssessable: false,
      summaryExplanation: 'Unable to assess: None of the evaluated detectors returned a valid risk score.',
      recommendedActions: ['Provide valid text, a URL, a readable QR code, or supported media for analysis.'],
      primaryRiskDrivers: ['No valid detector results'],
    };
  }

  // Formula: Combined Risk = SUM(w_i * r_i) / SUM(w_i)
  const combinedRisk = weightedRiskSum / totalActiveWeight;
  const trustRiskScore = Math.min(100, Math.max(0, Math.round(combinedRisk * 100)));
  const riskBand = determineRiskBand(trustRiskScore);
  const recommendedActions = generateRecommendedActions(riskBand, primaryRiskDrivers);

  // Transparent explanation summary
  let summaryExplanation = '';
  if (modulesEvaluated === 1) {
    const single = validDetectors[0];
    summaryExplanation = `Single-modality assessment via ${single.name}. Trust Risk Score of ${trustRiskScore}/100 based on ${single.evidence.length} inspected attributes.`;
  } else {
    summaryExplanation = `Multimodal fusion evaluated ${modulesEvaluated} active detectors with normalized weighted fusion. Combined Trust Risk Score: ${trustRiskScore}/100 (${riskBand.replace('_', ' ').toUpperCase()} RISK).`;
  }

  const fusionFormula = `Combined Risk = (${Object.entries(activeWeights)
    .map(([k, w]) => `${w} × r[${k}]`)
    .join(' + ')}) / ${totalActiveWeight.toFixed(2)}`;

  return {
    trustRiskScore,
    riskBand,
    combinedRisk: Number(combinedRisk.toFixed(4)),
    fusionFormula,
    activeWeights,
    modulesEvaluated,
    modulesUnconfiguredOrFailed,
    isAssessable: true,
    summaryExplanation,
    recommendedActions,
    primaryRiskDrivers: primaryRiskDrivers.length > 0 ? primaryRiskDrivers : ['Baseline safety indicators within acceptable bounds'],
  };
}
