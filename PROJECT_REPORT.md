# SentinelX: AI-Powered Multi-Modal Digital Trust Platform for Scam Prevention & Cyber Safety
## Major Engineering Project Report (B.Tech Computer Science & Engineering)

---

## Abstract
Digital deception in the modern cyber landscape is increasingly multi-vector, chaining social engineering text prompts with homoglyph phishing domains, malicious physical QR codes, synthetic speech clones, and manipulated video media. Existing countermeasures operate primarily in isolation, placing the cognitive burden of correlation on end users. This project presents **SentinelX**, an integrated digital trust architecture that ingests multimodal inputs, executes specialized heuristic and machine-learning detectors, and synthesizes individual module outputs into an explainable **Trust Risk Score** via a normalized weighted Central Trust Fusion Engine. The platform incorporates strict Zero-Visit Server-Side Request Forgery (SSRF) isolation, defensive prompt-injection guardrails for Gemini Explainable AI synthesis, and user-controlled privacy modes.

---

## 1. Introduction & Problem Statement
Cybercrime syndicates exploit human vulnerabilities by synthesizing cognitive pressure across multiple digital modalities:
1. **Urgency & Coercion in Text**: Artificial deadlines designed to override rational deliberation.
2. **Deceptive Web Destinations**: Homoglyphs, typosquatting, raw IP hostnames, and credential syntax abuse.
3. **Quishing**: Physical barcode tampering that bypasses perimeter email link scanners.
4. **Synthetic Speech**: Voice cloning using few-shot audio synthesis to impersonate executives or distressed family members.
5. **Generative Imagery & Deepfakes**: Synthetic facial modifications and camera provenance scrubbing.

### Objectives:
- Develop a modular full-stack verification engine supporting text, URLs, barcodes, audio, and visual media.
- Formulate a reproducible mathematical fusion algorithm:
  $$\text{Combined Risk} = \frac{\sum_{i \in M_{\text{active}}} w_i \cdot r_i}{\sum_{i \in M_{\text{active}}} w_i}$$
  $$\text{Trust Risk Score} = \text{round}(100 \times \text{Combined Risk})$$
- Provide human-understandable evidence explanations and defensive directives.
- Ensure strict privacy options (ephemeral in-memory execution mode).

---

## 2. System Architecture & Component Design

```
+--------------------------------------------------------------------------+
|                        SentinelX Presentation Tier                       |
|  React 19 / TypeScript / Tailwind CSS / Lucide Icons / HTML5 Canvas / Audio |
+--------------------------------------------------------------------------+
                                    |
                                    v REST JSON API (/api/*)
+--------------------------------------------------------------------------+
|                     SentinelX Core Service Tier (Node.js)                |
+--------------------------------------------------------------------------+
  |                   |                 |                |              |
  v                   v                 v                v              v
[Text NLP]        [URL Safety]      [QR Decoder]    [Audio Spoof]  [Deepfake]
(TF-IDF/Rules)    (tldts/Homoglyph) (jsQR/Piped)    (ZCR/Acoustic) (EXIF/Grid)
  |                   |                 |                |              |
  +-------------------+-----------------+----------------+--------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
|                  Central Trust Fusion Engine (v1.0.0)                    |
|    - Dynamic Weight Normalization: SUM(w_i * r_i) / SUM(w_i)             |
|    - Risk Band Assignment: Lower / Moderate / High / Very High           |
|    - Primary Driver Extraction & Safety Directives Generation            |
+--------------------------------------------------------------------------+
         |                                                 |
         v                                                 v
[Gemini Explainable AI]                          [Audit History Ledger]
(@google/genai Flash XAI)                        (In-Memory & Storage)
```

---

## 3. Mathematical Fusion Formulation
Individual detectors return normalized risk estimates $r_i \in [0.0, 1.0]$. Calibrated module weights reflect exploit severity:
- $w_{\text{URL}} = 1.25$ (High direct execution danger)
- $w_{\text{QR}} = 1.10$ (Indirect obfuscation of dangerous URLs)
- $w_{\text{Text}} = 1.00$ (Cognitive social engineering indicators)
- $w_{\text{Audio}} = 0.95$ (Voice synthesis acoustic indicators)
- $w_{\text{Media}} = 0.95$ (Generative artifact forensics)

When a subset of detectors is unconfigured or skipped, the fusion engine renormalizes the active weight sum, guaranteeing mathematical stability and preventing unexecuted modules from distorting results.

---

## 4. Experimental Testing & Verification Summary
An automated test suite comprising 12 test assertions was developed and verified:
- **Test 1**: Benign message yields Lower Risk band (<30). *(PASS)*
- **Test 2**: Lawsuit / gift card coercion flagged as High/Very High. *(PASS)*
- **Test 3**: Syntactically benign URL parsed safely. *(PASS)*
- **Test 4**: Typosquatting homoglyphs (`paypa1`) detected. *(PASS)*
- **Test 5**: QR payload decoded and piped to URL engine. *(PASS)*
- **Test 6**: Corrupted / empty QR returns graceful failure. *(PASS)*
- **Test 7**: Audio acoustic baseline extracts features (ZCR, clipping). *(PASS)*
- **Test 8**: 1024x1024 square media triggers latent diffusion heuristic. *(PASS)*
- **Test 9**: Fusion engine weighted score matches mathematical expectation. *(PASS)*
- **Test 10**: Graceful degradation on module failure with weight renormalization. *(PASS)*
- **Test 11**: All modules failing correctly yields "Unable to assess". *(PASS)*
- **Test 12**: Ephemeral Privacy Mode guarantees zero ledger persistence. *(PASS)*

---

## 5. Academic & Security Limitations
1. **Zero-Visit Passive Analysis**: SentinelX does not download live executable page assets to avoid active SSRF risks.
2. **Adversarial Audio Codecs**: Severe VoIP bandwidth compression (e.g., GSM codecs) degrades high-frequency acoustic harmonics.
3. **Risk Score Interpretation**: The Trust Risk Score is an assistive probabilistic assessment, not a legal guarantee.
