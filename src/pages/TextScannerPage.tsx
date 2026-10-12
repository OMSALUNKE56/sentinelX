import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, AlertCircle, Info, ShieldCheck, Zap } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalysisReport } from '../types/sentinel.js';
import { storageService } from '../services/storageService.js';

interface TextScannerPageProps {
  onAnalysisComplete: (report: AnalysisReport) => void;
}

export const TextScannerPage: React.FC<TextScannerPageProps> = ({
  onAnalysisComplete,
}) => {
  const [text, setText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleMessages = [
    {
      label: 'Bank Phishing Alert',
      content: 'SECURITY NOTICE: Your Chase debit card has been placed on hold due to unusual overseas activity. Please confirm your 6-digit one-time passcode (OTP) immediately to reactivate: http://chase-card-portal.click/verify',
    },
    {
      label: 'Legal Extortion Threat',
      content: 'IRS Legal Department: A formal arrest warrant has been filed in your jurisdiction for tax evasion. Law enforcement will arrive within 2 hours unless you settle the outstanding processing fee of $450 via Apple gift card immediately.',
    },
    {
      label: 'Job Recruitment Scam',
      content: 'Congratulations! You have been selected for our part-time remote task job. Earn $800 daily by liking social media posts. Only requirement is a refundable security deposit of $50 to initiate your employee account.',
    },
    {
      label: 'Benign Meeting Request',
      content: 'Hey Alex, quick reminder about the product roadmap review scheduled for 2 PM this afternoon in Conference Room B. Please review the shared slides before the call.',
    },
  ];

  const handleScan = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter or paste message content to analyze.');
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
    const prefs = storageService.getPreferences();

    try {
      const report = await apiClient.analyzeText(text, prefs.privacyMode);
      onAnalysisComplete(report);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Text analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-blue-400" />
          <span>Text & Message Threat Analyzer</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Specialized Natural Language Processing scanner detecting urgency ultimatums, credential harvesting, impersonation, and irreversible payment lures.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Box */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Suspicious Message Content</span>
          </label>
          <span className="text-xs font-mono text-slate-500">{text.length} characters</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste SMS, WhatsApp message, email, or chat conversation here..."
          className="w-full rounded-lg bg-slate-950 border border-slate-800 p-4 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
        />

        {/* Sample Templates */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Load realistic sample scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setText(s.content)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Embedded URLs within messages are automatically extracted and cross-checked.</span>
          </div>

          <button
            onClick={handleScan}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95 disabled:opacity-60 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing NLP Indicators...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Methodology Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
        <h4 className="font-semibold text-slate-200 font-mono uppercase text-[11px]">
          Engine Pipeline Note
        </h4>
        <p>
          The text classifier evaluates lexical features against TF-IDF n-grams calibrated on the UCI SMS Spam Collection and Enron Phishing corpus, paired with deterministic rule weighting for credential theft vectors.
        </p>
      </div>
    </div>
  );
};
