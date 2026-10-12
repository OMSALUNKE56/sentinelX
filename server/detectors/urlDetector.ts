import { parse } from 'tldts';
import { DetectorResult, EvidenceItem } from '../../src/types/sentinel.js';

// Suspicious Top-Level Domains frequently abused in disposable phishing operations
const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'click', 'work', 'rest', 'gq', 'cf', 'tk', 'ml', 'ga', 
  'country', 'stream', 'download', 'bid', 'loan', 'win', 'racing', 'mom', 'vip'
]);

// High-value brand targets frequently impersonated in domain names
const TARGETED_BRANDS = [
  'paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix', 'chase',
  'wellsfargo', 'bankofamerica', 'citibank', 'facebook', 'instagram',
  'whatsapp', 'binance', 'coinbase', 'metamask', 'dhl', 'fedex', 'usps'
];

// Suspicious URL path/query keywords
const SUSPICIOUS_PATH_KEYWORDS = [
  'login', 'signin', 'verify', 'account', 'banking', 'secure-update',
  'credential', 'wallet', 'confirm-identity', 'auth-check', 'password-reset',
  '2fa', 'security-alert', 'unauthorized-access'
];

export interface UrlAnalysisInput {
  url: string;
}

export function normalizeUrl(input: string): { normalized: string; error?: string } {
  let cleaned = input.trim();
  if (!cleaned) return { normalized: '', error: 'URL input is empty' };

  // Check if starts with a scheme
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'http://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    return { normalized: parsed.href };
  } catch (err) {
    return { normalized: cleaned, error: 'Malformed URL syntax' };
  }
}

export function analyzeUrlSafety(rawUrl: string): DetectorResult {
  const startTime = Date.now();
  const { normalized, error } = normalizeUrl(rawUrl);

  if (error || !normalized) {
    return {
      moduleId: 'url_phishing_detector',
      name: 'URL & Phishing Domain Analyzer',
      version: '2.1.0-tldts-heuristics',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['MALFORMED_URL'],
      evidence: [],
      processingTimeMs: Date.now() - startTime,
      limitations: ['Cannot evaluate unparseable or syntactically invalid URLs.'],
      errorDetails: error || 'Provided URL could not be parsed into a valid URI structure.',
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    return {
      moduleId: 'url_phishing_detector',
      name: 'URL & Phishing Domain Analyzer',
      version: '2.1.0-tldts-heuristics',
      status: 'failed',
      riskScore: null,
      normalizedRisk: null,
      confidence: null,
      reasonCodes: ['INVALID_URL_SCHEME'],
      evidence: [],
      processingTimeMs: Date.now() - startTime,
      limitations: ['Cannot evaluate scheme or hostname.'],
      errorDetails: 'URL construction threw parsing exception.',
    };
  }

  const tldInfo = parse(normalized);
  const hostname = parsedUrl.hostname.toLowerCase();
  const evidence: EvidenceItem[] = [];
  const reasonCodes: string[] = [];
  let accumulatedRisk = 0;

  // 1. IP Address Hostname Detection (Phishers using raw IPs or hex)
  const isIpAddress = tldInfo.isIp || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[') || /^[0-9]+$/.test(hostname);
  if (isIpAddress) {
    accumulatedRisk += 40;
    reasonCodes.push('HOST_RAW_IP_ADDRESS');
    evidence.push({
      id: 'ev-ip-host',
      label: 'Direct Numerical IP Hostname',
      value: hostname,
      severity: 'danger',
      category: 'domain',
      explanation: 'Legitimate services utilize standard registered DNS domains rather than raw numeric IP addresses.',
    });
  }

  // 2. Embedded Authentication Credentials in URL syntax (e.g., http://google.com@phishingsite.com)
  if (parsedUrl.username || parsedUrl.password) {
    accumulatedRisk += 45;
    reasonCodes.push('EMBEDDED_CREDENTIALS_SYNTAX');
    evidence.push({
      id: 'ev-auth-syntax',
      label: 'Deceptive Userinfo Syntax (@-trick)',
      value: `${parsedUrl.username ? parsedUrl.username : ''}${parsedUrl.password ? ':***' : ''}@`,
      severity: 'danger',
      category: 'domain',
      explanation: 'Userinfo credentials preceding the @ symbol deceive users into believing they visit the authority before the @.',
    });
  }

  // 3. Suspicious or Abused TLD Detection
  const publicSuffix = (tldInfo.publicSuffix || '').toLowerCase();
  if (publicSuffix && SUSPICIOUS_TLDS.has(publicSuffix)) {
    accumulatedRisk += 25;
    reasonCodes.push('HIGH_RISK_TLD');
    evidence.push({
      id: 'ev-tld',
      label: 'High-Abuse Top-Level Domain (TLD)',
      value: `.${publicSuffix}`,
      severity: 'warning',
      category: 'domain',
      explanation: `The .${publicSuffix} TLD has historically demonstrated disproportionate prevalence in low-cost disposable spam campaigns.`,
    });
  }

  // 4. Brand Impersonation / Typosquatting in Domain or Subdomains
  const domainWithoutSuffix = (tldInfo.domainWithoutSuffix || '').toLowerCase();
  const subdomain = (tldInfo.subdomain || '').toLowerCase();
  
  for (const brand of TARGETED_BRANDS) {
    // If brand appears in subdomain or domain but is not the legitimate brand domain
    const appearsInSubdomain = subdomain.includes(brand);
    const appearsInDomain = domainWithoutSuffix.includes(brand);
    const isAuthenticBrandDomain = domainWithoutSuffix === brand;

    if ((appearsInSubdomain || appearsInDomain) && !isAuthenticBrandDomain) {
      accumulatedRisk += 35;
      reasonCodes.push(`BRAND_IMPERSONATION_${brand.toUpperCase()}`);
      evidence.push({
        id: `ev-brand-${brand}`,
        label: `Brand Impersonation / Lookalike Heuristic (${brand})`,
        value: hostname,
        severity: 'danger',
        category: 'impersonation',
        explanation: `Hostname references protected trademark "${brand}" inside an unverified domain structure (${tldInfo.domain || hostname}).`,
      });
      break;
    }

    // Levenshtein / character swap distance (e.g. paypa1, micros0ft, goog1e)
    const normalizedName = domainWithoutSuffix
      .replace(/0/g, 'o')
      .replace(/1/g, 'l')
      .replace(/vv/g, 'w')
      .replace(/rn/g, 'm');

    const hasHomoglyphBrand = normalizedName === brand || (normalizedName.includes(brand) && !domainWithoutSuffix.includes(brand));

    if (hasHomoglyphBrand && domainWithoutSuffix !== brand) {
      accumulatedRisk += 45;
      reasonCodes.push('TYPOSQUATTING_HOMOGLYPH');
      evidence.push({
        id: `ev-homoglyph-${brand}`,
        label: `Typosquatting Homoglyph Deception`,
        value: `${domainWithoutSuffix} resembles ${brand}`,
        severity: 'danger',
        category: 'impersonation',
        explanation: 'Character substitutions (e.g., 1 for l, 0 for o) engineered to spoof user visual verification.',
      });
      break;
    }
  }

  // 5. Excessive Subdomain Depth (e.g. login.secure.verify.update.account.evil.com)
  const subdomainParts = subdomain ? subdomain.split('.').filter(Boolean) : [];
  if (subdomainParts.length >= 3) {
    accumulatedRisk += 20;
    reasonCodes.push('EXCESSIVE_SUBDOMAINS');
    evidence.push({
      id: 'ev-subdomains',
      label: 'Deep Subdomain Nesting',
      value: `${subdomainParts.length} levels deep`,
      severity: 'warning',
      category: 'domain',
      explanation: 'Multi-tiered subdomains are used to disguise actual registrar apex domains on mobile browsers.',
    });
  }

  // 6. Multiple Hyphens in Domain Name
  const hyphenCount = (domainWithoutSuffix.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    accumulatedRisk += 18;
    reasonCodes.push('EXCESSIVE_HYPHENS');
    evidence.push({
      id: 'ev-hyphens',
      label: 'Multiple Domain Hyphenations',
      value: `${hyphenCount} hyphens in apex domain`,
      severity: 'warning',
      category: 'domain',
      explanation: 'Disproportionate hyphenation is characteristic of automated domain generation algorithms (DGA).',
    });
  }

  // 7. Suspicious Path / Query Strings
  const fullPathAndQuery = (parsedUrl.pathname + parsedUrl.search).toLowerCase();
  const matchedKeywords = SUSPICIOUS_PATH_KEYWORDS.filter(k => fullPathAndQuery.includes(k));
  if (matchedKeywords.length >= 2) {
    accumulatedRisk += 22;
    reasonCodes.push('SUSPICIOUS_PATH_INTENT');
    evidence.push({
      id: 'ev-keywords',
      label: 'High-Risk Path/Parameter Keywords',
      value: matchedKeywords.join(', '),
      severity: 'warning',
      category: 'urgency',
      explanation: 'Path triggers multiple authentication and credential harvesting vectors.',
    });
  }

  // 8. Excessive URL Length
  if (normalized.length > 140) {
    accumulatedRisk += 12;
    reasonCodes.push('EXCESSIVE_URL_LENGTH');
    evidence.push({
      id: 'ev-length',
      label: 'Abnormal URL Length',
      value: `${normalized.length} characters`,
      severity: 'warning',
      category: 'domain',
      explanation: 'Lengthy encoded parameters are often leveraged to conceal actual destination targets.',
    });
  }

  // 9. Plain HTTP protocol (Unencrypted)
  if (parsedUrl.protocol === 'http:') {
    accumulatedRisk += 15;
    reasonCodes.push('UNENCRYPTED_HTTP');
    evidence.push({
      id: 'ev-http',
      label: 'Unencrypted Protocol (Plain HTTP)',
      value: 'http:// (No TLS/SSL)',
      severity: 'warning',
      category: 'domain',
      explanation: 'Lacks transport-layer encryption, vulnerable to on-path interception and tampering.',
    });
  } else {
    evidence.push({
      id: 'ev-https',
      label: 'Transport Layer Security (HTTPS)',
      value: 'https:// enabled',
      severity: 'info',
      category: 'domain',
      explanation: 'HTTPS provides transport encryption, but does not guarantee the operator is trustworthy.',
    });
  }

  // 10. Clean domain indicators
  if (accumulatedRisk === 0) {
    evidence.push({
      id: 'ev-clean-url',
      label: 'Standard Domain Structure',
      value: `${tldInfo.domain || hostname}`,
      severity: 'safe',
      category: 'domain',
      explanation: 'No known homoglyphs, IP hostnames, high-abuse TLDs, or credential tricks detected.',
    });
  }

  const finalRiskScore = Math.min(100, Math.max(0, Math.round(accumulatedRisk)));
  const normalizedRisk = Number((finalRiskScore / 100).toFixed(2));
  const confidence = Number((0.65 + (reasonCodes.length > 0 ? 0.25 : 0.15)).toFixed(2));

  return {
    moduleId: 'url_phishing_detector',
    name: 'URL & Phishing Domain Analyzer',
    version: '2.1.0-tldts-heuristics',
    status: 'success',
    riskScore: finalRiskScore,
    normalizedRisk,
    confidence: Math.min(0.95, confidence),
    reasonCodes: reasonCodes.length > 0 ? reasonCodes : ['CLEAN_URL_HEURISTICS'],
    evidence,
    processingTimeMs: Date.now() - startTime,
    limitations: [
      'Evaluation is purely static and reputation-heuristic based; backend NEVER opens arbitrary URLs (SSRF protected).',
      'Newly registered domains with benign vocabulary may evade heuristic analysis until flagged in threat databases.',
      'HTTPS transport encryption does not imply server legitimacy.',
    ],
    modelDetails: {
      architecture: 'Public Suffix List (tldts) + Lexical Homoglyph Heuristics + Anti-Phishing Rules',
      datasetGrounding: 'APWG Phishing Activity Trends, OpenPhish taxonomy, IANA root zone database',
      inferenceType: 'rule_heuristic',
      statusNote: 'Operational (Static isolation parsing; zero SSRF risk)',
    },
  };
}
