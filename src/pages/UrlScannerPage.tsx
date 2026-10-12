import React, { useState } from 'react';
import { Globe, Sparkles, Loader2, AlertCircle, Shield, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalysisReport } from '../types/sentinel.js';
import { storageService } from '../services/storageService.js';

interface UrlScannerPageProps {
  onAnalysisComplete: (report: AnalysisReport) => void;
}

export const UrlScannerPage: React.FC<UrlScannerPageProps> = ({
  onAnalysisComplete,
}) => {
  const [url, setUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleUrls = [
    {
      label: 'Deceptive Lookalike Brand',
      url: 'http://paypa1-security-verification.xyz/update-account',
    },
    {
      label: 'Raw IP Hostname Phish',
      url: 'http://185.220.101.5/banking-login/index.php',
    },
    {
      label: 'Credential Deception (@ Trick)',
      url: 'http://google.com@phish-portal.click/verify',
    },
    {
      label: 'Legitimate Corporate Domain',
      url: 'https://support.google.com/accounts/answer/185839',
    },
  ];

  const handleScan = async () => {
    if (!url.trim()) {
      setErrorMessage('Please enter a URL to inspect.');
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
    const prefs = storageService.getPreferences();

    try {
      const report = await apiClient.analyzeUrl(url, prefs.privacyMode);
      onAnalysisComplete(report);
    } catch (err: any) {
      setErrorMessage(err?.message || 'URL inspection failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-cyan-400" />
          <span>URL & Phishing Domain Analyzer</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Detects homoglyphs, typosquatting brand spoofing, direct IP hostnames, high-abuse TLDs, and embedded credential syntax.
        </p>
      </div>

      {/* Critical Security Box */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="font-bold">Zero-Visit SSRF Protection Guarantee:</span>
          <p className="text-amber-200/80 leading-relaxed">
            SentinelX performs strictly static structural, lexical, and DNS namespace heuristics. The server never connects to or requests arbitrary user-submitted URLs, preventing Server-Side Request Forgery (SSRF) and attacker token tripwires.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Box */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>Target Web Link (URL)</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. https://login.bank-update.xyz/verify or http://192.168.1.1/auth"
            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 p-3.5 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition font-mono"
          />
          <button
            onClick={handleScan}
            disabled={isAnalyzing}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 flex-shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inspecting Domain...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Inspect URL Safety</span>
              </>
            )}
          </button>
        </div>

        {/* Samples */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Load threat test cases:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setUrl(s.url)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
