# SentinelX — AI-Powered Multi-Modal Digital Trust Platform for Scam Prevention & Cyber Safety

**Academic Major Project | Department of Computer Science & Engineering**

---

## 1. Executive Overview

SentinelX is an explainable multimodal digital trust and fraud prevention platform. Modern social engineering increasingly fuses urgent text messages, lookalike phishing domains, QR codes (quishing), synthetic voice clones, and deepfake videos. While conventional tools evaluate these threat vectors in silos, SentinelX unifies them into a coherent decision framework, computing an explainable **Trust Risk Score** from **0 to 100** via a normalized weighted Central Trust Fusion Engine.

---

## 2. Key Capabilities & Analytical Modules

| Modality / Detector | Version | Methodological Architecture | Grounding & Datasets |
|---|---|---|---|
| **Text & Message Scanner** | 1.4.0 | TF-IDF n-grams + Logistic Heuristics + Urgency / Credential Rule Taxonomy | UCI SMS Spam Collection, Enron Phishing Corpus |
| **URL & Phishing Scanner** | 2.1.0 | Public Suffix List (`tldts`), Homoglyph Character Swaps, Raw IP & @-syntax detection | APWG Phishing Reports, OpenPhish taxonomy |
| **QR Code Scanner** | 1.2.0 | Reed-Solomon optical matrix decoding (`jsQR`) with piped URL phishing inspection | ISO/IEC 18004 standards, Quishing threat intelligence |
| **Voice Spoof Detector** | 1.1.0 | Acoustic signal processing (ZCR, RMS energy, clipping) + RawNet2 deep neural network adapter | ASVspoof 2019/2021 Logical Access (LA) partition |
| **Deepfake Analyzer** | 1.2.0 | EXIF sensor provenance, 1:1 latent diffusion grid heuristics + XceptionNet FF++ adapter | FaceForensics++ (Deepfakes, Face2Face, FaceSwap) |
| **Central Trust Fusion Engine** | 1.0.0 | Normalized weighted arithmetic: `Combined Risk = SUM(w_i * r_i) / SUM(w_i)` | ISO/IEC risk management principles |
| **Explainable AI (XAI)** | 2.5 | Gemini Flash structured explanation engine with strict prompt injection guardrails | Google GenAI SDK (`@google/genai`) |

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Canvas 2D API, Web Audio API
- **Backend & Middleware**: Node.js Express, Connect middleware in Vite dev server, typed REST endpoints
- **Optical & Signal Processing**: `jsQR` (matrix barcode raster decoding), `tldts` (canonical Public Suffix List parsing), Web Audio `AudioContext`
- **AI / LLM Integration**: `@google/genai` (Gemini 2.5 Flash for evidence-grounded non-technical explanations)
- **Quality & Testing**: Automated test suite (`tests/run-tests.ts`), zero-error TypeScript linting (`tsc --noEmit`), Vite production build

---

## 4. Quickstart & Verification

### Running the Development Server
```bash
npm run dev
# The dev server launches on http://0.0.0.0:3000 with live API middleware
```

### Running Automated Verification Tests
```bash
npm run test
# Executes 12 comprehensive unit and integration tests across all detectors and the fusion engine
```

### Production Build
```bash
npm run build
npm run start
```

---

## 5. Security & Isolation Guarantees

1. **Zero-Visit SSRF Protection**: The server never issues outbound HTTP requests to user-submitted URLs. Inspection is strictly static, lexical, and DNS namespace-based.
2. **Defensive Prompt Injection Filtering**: Gemini explanation prompts treat user inputs as passive unexecutable strings and forbid the model from modifying numeric fusion calculations.
3. **Incognito Privacy Mode**: When enabled, scans are executed in-memory only and never persisted to the audit history ledger.
