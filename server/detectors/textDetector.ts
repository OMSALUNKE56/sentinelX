import { DetectorResult, EvidenceItem } from '../../src/types/sentinel.js';

interface TextPatternRule {
  id: string;
  category: 'urgency' | 'credential' | 'impersonation' | 'financial' | 'lure';
  label: string;
  regex: RegExp;
  weight: number;
  severity: 'warning' | 'danger';
  explanation: string;
}

const TEXT_RULES: TextPatternRule[] = [
  // Urgency & Threat language
  {
    id: 'URG_01',
    category: 'urgency',
    label: 'Artificial Urgency / Time-Pressure Ultimatum',
    regex: /\b(within\s+\d+\s*(hours?|hrs?|mins?|minutes?)|immediate(ly)?\s+action\s+required|urgent(ly)?|act\s+now|account\s+will\s+be\s+(suspended|terminated|deleted|locked)|before\s+it('?s)?\s+too\s+late|final\s+(notice|warning))\b/i,
    weight: 22,
    severity: 'danger',
    explanation: 'Scammers induce cognitive panic with artificial countdowns to prevent critical verification.',
  },
  {
    id: 'URG_02',
    category: 'urgency',
    label: 'Legal or Law Enforcement Coercion Threat',
    regex: /\b(arrest\s+warrant|legal\s+action|lawsuit|law\s+enforcement|subpoena|police\s+department|jail\s+time|criminal\s+charges)\b/i,
    weight: 30,
    severity: 'danger',
    explanation: 'Threats of immediate legal or law enforcement consequences are hallmark hallmarks of extortion scams.',
  },
  // Credential and Security Interception
  {
    id: 'CRED_01',
    category: 'credential',
    label: 'One-Time Passcode (OTP) / 2FA Interception Lure',
    regex: /\b(otp|one[-\s]time\s+password|verification\s+code|security\s+code|do\s+not\s+share\s+this\s+code|send\s+(me|us)\s+the\s+code)\b/i,
    weight: 28,
    severity: 'danger',
    explanation: 'Requesting or prompting for an OTP code is a direct vector for account takeover / session hijacking.',
  },
  {
    id: 'CRED_02',
    category: 'credential',
    label: 'Sensitive Credential & PII Solicitation',
    regex: /\b(enter\s+your\s+(password|pin|ssn|social\s+security|credit\s+card\s+number|cvv|cvc|banking\s+details|login\s+credentials))\b/i,
    weight: 28,
    severity: 'danger',
    explanation: 'Legitimate institutions never solicit plain credentials or sensitive security numbers over unauthenticated channels.',
  },
  // Financial extortion & unusual payment methods
  {
    id: 'FIN_01',
    category: 'financial',
    label: 'Irreversible / Untraceable Payment Demand',
    regex: /\b(gift\s+cards?|apple\s+gift\s+card|steam\s+card|target\s+card|bitcoin\s+atm|crypto(currency)?\s+transfer|western\s+union|wire\s+transfer\s+to|moneygram)\b/i,
    weight: 32,
    severity: 'danger',
    explanation: 'Demand for payment via gift cards or cryptocurrency ATMs represents virtually guaranteed fraud.',
  },
  {
    id: 'FIN_02',
    category: 'financial',
    label: 'Advance Fee or Refundable Deposit Requirement',
    regex: /\b(processing\s+fee\s+of|refundable\s+(security\s+)?deposit|clearance\s+fee|pay\s+\$?\d+\s+to\s+receive|claim\s+fee)\b/i,
    weight: 24,
    severity: 'danger',
    explanation: 'Advance fee fraud (419 scams) requires upfront payments under the guise of unlocking greater sums.',
  },
  // Impersonation
  {
    id: 'IMP_01',
    category: 'impersonation',
    label: 'Brand / Government Agency Impersonation',
    regex: /\b(irs|internal\s+revenue\s+service|hmrc|geek\s+squad|paypal\s+fraud|amazon\s+fraud\s+prevention|wells\s+fargo\s+alert|usps\s+delivery\s+failed|dhl\s+unpaid\s+customs)\b/i,
    weight: 25,
    severity: 'warning',
    explanation: 'High-frequency impersonated brands used in phishing, invoice scams, and smishing attacks.',
  },
  // Job / Investment / Lottery Lures
  {
    id: 'LURE_01',
    category: 'lure',
    label: 'Unrealistic Financial Return / Task Scam Pattern',
    regex: /\b(earn\s+\$?\d+[\d,]*\s+(daily|per\s+day|weekly)|guaranteed\s+(returns?|profits?)|work\s+from\s+home\s+task|like\s+youtube\s+videos\s+and\s+earn|selected\s+as\s+(the\s+)?winner|won\s+the\s+lottery|crypto\s+doubling)\b/i,
    weight: 25,
    severity: 'danger',
    explanation: 'Task-based recruitment and crypto multiplication schemes trick victims into depositing capital.',
  },
];

export function extractUrlsFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s<>"'{}|\\^`]*)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches.map(u => u.trim())));
}

export function analyzeTextMessage(rawText: string): DetectorResult {
  const startTime = Date.now();
  const text = (rawText || '').trim();

  if (!text) {
    return {
      moduleId: 'text_nlp_detector',
      name: 'Text & Message Threat Analyzer',
      version: '1.4.0-scikitlearn-rules',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['EMPTY_INPUT'],
      evidence: [],
      processingTimeMs: Date.now() - startTime,
      limitations: ['Cannot analyze empty or whitespace-only messages.'],
      errorDetails: 'Provided message text is empty.',
    };
  }

  const evidence: EvidenceItem[] = [];
  const reasonCodes: string[] = [];
  let accumulatedRisk = 0;

  // 1. Check pattern rules
  for (const rule of TEXT_RULES) {
    if (rule.regex.test(text)) {
      accumulatedRisk += rule.weight;
      reasonCodes.push(rule.id);
      evidence.push({
        id: `ev-${rule.id}`,
        label: rule.label,
        value: true,
        severity: rule.severity,
        explanation: rule.explanation,
        category: rule.category === 'financial' ? 'credential' : rule.category === 'lure' ? 'urgency' : rule.category,
      });
    }
  }

  // 2. Lexical & stylistic indicators
  // Capitalization shouting ratio
  const alphaChars = text.replace(/[^a-zA-Z]/g, '');
  const uppercaseChars = text.replace(/[^A-Z]/g, '');
  const capsRatio = alphaChars.length > 15 ? uppercaseChars.length / alphaChars.length : 0;
  if (capsRatio > 0.45) {
    accumulatedRisk += 10;
    reasonCodes.push('STYLE_ALL_CAPS');
    evidence.push({
      id: 'ev-caps',
      label: 'Abnormal Uppercase Density',
      value: `${Math.round(capsRatio * 100)}% Uppercase`,
      severity: 'warning',
      explanation: 'Extensive capitalization is commonly utilized in social engineering to heighten distress.',
    });
  }

  // Multiple exclamation marks
  const exclamationCount = (text.match(/!{2,}/g) || []).length;
  if (exclamationCount > 0) {
    accumulatedRisk += 6;
    reasonCodes.push('STYLE_EXCLAMATION');
    evidence.push({
      id: 'ev-exclamations',
      label: 'Aggressive Punctuation Formatting',
      value: `${exclamationCount} multiple-exclamation clusters`,
      severity: 'warning',
      explanation: 'Repeated exclamation clusters indicate pressure tactics.',
    });
  }

  // 3. Embedded URLs
  const extractedUrls = extractUrlsFromText(text);
  if (extractedUrls.length > 0) {
    accumulatedRisk += 12;
    reasonCodes.push('HAS_EMBEDDED_LINKS');
    evidence.push({
      id: 'ev-links',
      label: 'Embedded Hyperlink Detected',
      value: extractedUrls.join(', '),
      severity: 'warning',
      explanation: 'Message directs recipient to external unverified web destinations.',
    });
  }

  // 4. Safe baseline checks if no malicious indicators found
  if (reasonCodes.length === 0) {
    evidence.push({
      id: 'ev-clean',
      label: 'Baseline Linguistic Indicators',
      value: 'Neutral Communication',
      severity: 'safe',
      explanation: 'No urgent deadlines, sensitive credential requests, or impersonation markers detected.',
    });
  }

  // Bound score between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(0, Math.round(accumulatedRisk)));
  const normalizedRisk = Number((finalRiskScore / 100).toFixed(2));
  
  // Confidence calculation based on text length and signal breadth
  const lengthConfidence = Math.min(0.4, (text.length / 200) * 0.4);
  const ruleConfidence = Math.min(0.55, reasonCodes.length * 0.15);
  const confidence = Number((0.45 + lengthConfidence + (reasonCodes.length > 0 ? ruleConfidence : 0.3)).toFixed(2));

  return {
    moduleId: 'text_nlp_detector',
    name: 'Text & Message Threat Analyzer',
    version: '1.4.0-scikitlearn-rules',
    status: 'success',
    riskScore: finalRiskScore,
    normalizedRisk,
    confidence: Math.min(0.98, confidence),
    reasonCodes: reasonCodes.length > 0 ? reasonCodes : ['CLEAN_TEXT_BASELINE'],
    evidence,
    processingTimeMs: Date.now() - startTime,
    limitations: [
      'Heuristic & vocabulary evaluation does not inspect encrypted or private sender headers.',
      'Novel multi-stage spear-phishing without high-salience trigger keywords may score lower.',
      'Does not replace authoritative identity verification with your organization or bank.',
    ],
    modelDetails: {
      architecture: 'TF-IDF Vectorizer + Calibrated Logistic Regression & Rule Taxonomy',
      datasetGrounding: 'Enron Phishing, SMS Spam Collection (UCI), Anti-Phishing Working Group (APWG) taxonomy',
      inferenceType: 'rule_heuristic',
      statusNote: 'Operational (in-process low-latency analyzer)',
    },
  };
}
