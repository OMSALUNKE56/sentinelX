import React from 'react';
import { HelpCircle, ChevronRight, Shield, AlertTriangle, FileCode, CheckCircle } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const faqs = [
    {
      q: 'How is the Trust Risk Score calculated?',
      a: 'The Trust Risk Score ranges from 0 to 100. It is computed via the Central Trust Fusion Engine using normalized weighted arithmetic across only the detectors that successfully execute on your submitted input. 0–29 indicates lower risk, 30–59 moderate risk, 60–79 high risk, and 80–100 very high risk.',
    },
    {
      q: 'Does SentinelX ever visit or open suspicious URLs directly?',
      a: 'No. SentinelX strictly enforces Zero-Visit SSRF isolation. The backend analyzes domain structure, Public Suffix List rules, homoglyphs, and syntax without making direct outbound HTTP requests to user-submitted links.',
    },
    {
      q: 'Can SentinelX guarantee that a message or website is 100% safe?',
      a: 'No automated cybersecurity tool can offer absolute certainty. SentinelX is designed as a risk-assessment and digital trust verification aid. High scores indicate acute threat patterns, while lower scores reflect absence of known signatures.',
    },
    {
      q: 'What happens to my uploaded images and messages?',
      a: 'By default, metadata and forensic results are logged to your private local ledger. If you enable "Incognito Analysis Mode" in Settings or the top navigation bar, all scans are processed ephemerally in RAM and never saved to persistent storage.',
    },
    {
      q: 'How does the QR Code scanner work?',
      a: 'The QR scanner processes raster images directly inside your browser using jsQR and HTML5 Canvas. The decoded payload is extracted and automatically piped through the URL Phishing Analyzer to verify destination authenticity.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          <span>Help & Documentation</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Quickstart guidelines, scoring interpretation, and frequently asked technical questions.
        </p>
      </div>

      {/* Quickstart Guide */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400">
          Platform Quickstart Workflow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono">1</span>
              <span>Input Modalities</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Paste suspicious messages, URLs, drop QR images, or attach audio recordings into the Unified Scanner.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono">2</span>
              <span>Execute Fusion</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Detectors run independently; the Fusion Engine normalizes scores and synthesizes explainable risk factors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono">3</span>
              <span>Inspect & Act</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Review evidence checklist, Gemini AI breakdown, safety directives, and export PDF/JSON reports for incident filing.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-200">{faq.q}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer Box */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-300 uppercase font-mono text-[11px] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Academic Security Notice</span>
        </div>
        <p>
          SentinelX is developed as an educational and research engineering project. While designed with rigorous cybersecurity standards and defensive SSRF protections, it should be used as an assistive tool alongside official organizational verification protocols.
        </p>
      </div>
    </div>
  );
};
