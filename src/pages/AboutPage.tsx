import React from 'react';
import { Info, Shield, Layers, BookOpen, GraduationCap, Cpu, Code2, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-2">
          Computer Science & Engineering Major Project
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          About SentinelX Platform
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          AI-Powered Multi-Modal Digital Trust Platform for Scam Prevention & Cyber Safety.
        </p>
      </div>

      {/* Abstract Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Project Abstract</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          Modern cyber fraud operates across multi-stage, multimodal attack vectors—combining social engineering SMS messages, lookalike phishing domains, tampered physical QR codes, synthetic voice clones, and deepfake imagery. Conventional single-channel defense mechanisms isolate these signals, forcing non-technical users to interpret fragmented risk indicators.
        </p>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          SentinelX delivers a unified digital trust architecture that ingests text, URLs, barcodes, and media. Each modality is processed through modular, calibrated detection pipelines and synthesized via a Central Trust Fusion Engine into an explainable Trust Risk Score (0–100), accompanied by evidence-grounded reasoning from Gemini Explainable AI.
        </p>
      </div>

      {/* Multimodal Fusion Mathematics */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span>Multimodal Fusion Mathematical Formulation</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Central Trust Fusion Engine aggregates normalized risk estimates <span className="font-mono text-cyan-300">r_i &in; [0.0, 1.0]</span> from all successfully executed and calibrated detector modules <span className="font-mono text-cyan-300">i &in; M_active</span>:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center text-xs md:text-sm text-cyan-300 space-y-2">
          <div>Combined Risk = &sum;(w_i &times; r_i) / &sum;(w_i)</div>
          <div className="text-slate-400 text-xs">Trust Risk Score = round(100 &times; Combined Risk)</div>
        </div>

        <div className="space-y-2 text-xs text-slate-400">
          <div className="font-semibold text-slate-300">Calibrated Module Weightings:</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
            <li className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">url_phishing_detector:</span> <span className="text-cyan-400 font-bold">1.25</span>
            </li>
            <li className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">qr_analyzer:</span> <span className="text-cyan-400 font-bold">1.10</span>
            </li>
            <li className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">text_nlp_detector:</span> <span className="text-cyan-400 font-bold">1.00</span>
            </li>
            <li className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">audio_voice_spoof:</span> <span className="text-cyan-400 font-bold">0.95</span>
            </li>
            <li className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">image_deepfake:</span> <span className="text-cyan-400 font-bold">0.95</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dataset & Literature Groundings */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>Scientific Grounding & Literature Citations</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">1. Natural Language Processing in Phishing Detection</div>
            <p className="text-slate-400">
              Corpus: UCI SMS Spam Collection & Enron Phishing Dataset. Extracted TF-IDF n-grams with logistic classification heuristics for urgency, sensitive PII harvesting, and coercion.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">2. Anti-Spoofing Synthetic Speech Analysis (ASVspoof 2021)</div>
            <p className="text-slate-400">
              Acoustic zero-crossing, clipping detection, and RawNet2/AASIST end-to-end waveform deep neural network architecture designed for Logical Access (LA) speech synthesis detection.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-slate-200">3. Video & Facial Manipulation Forensics (FaceForensics++)</div>
            <p className="text-slate-400">
              Benchmarked on Rossler et al. FaceForensics++ (Deepfakes, Face2Face, FaceSwap), utilizing facial landmark alignment and XceptionNet spatial feature extraction.
            </p>
          </div>
        </div>
      </div>

      {/* Project Mentorship and Team */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-200">Major Engineering Capstone Project</div>
            <div className="text-xs text-slate-400">Department of Computer Science & Engineering</div>
          </div>
        </div>
        <div className="text-xs text-slate-500 text-center sm:text-right">
          SentinelX Trust Platform v3.0 Core
        </div>
      </div>
    </div>
  );
};
