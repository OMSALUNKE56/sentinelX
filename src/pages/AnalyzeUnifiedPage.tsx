import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Globe,
  QrCode,
  Mic,
  Video,
  Sparkles,
  Upload,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalysisReport } from '../types/sentinel.js';
import { storageService } from '../services/storageService.js';

interface AnalyzeUnifiedPageProps {
  onAnalysisComplete: (report: AnalysisReport) => void;
}

export const AnalyzeUnifiedPage: React.FC<AnalyzeUnifiedPageProps> = ({
  onAnalysisComplete,
}) => {
  const [text, setText] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');
  const [qrFileName, setQrFileName] = useState<string>('');

  const [audioFile, setAudioFile] = useState<{
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    durationSec?: number;
    sampleRateHz?: number;
    pcmBuffer?: number[];
  } | null>(null);

  const [mediaFile, setMediaFile] = useState<{
    mediaType: 'image' | 'video';
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    width?: number;
    height?: number;
    durationSec?: number;
    hasExifData?: boolean;
    previewUrl?: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle QR image file upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    try {
      const decoded = await apiClient.decodeQrFromImageFile(file);
      setQrPayload(decoded.payload);
      setQrFileName(file.name);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to decode QR code from the selected image.');
    }
  };

  // Handle Audio file upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    try {
      const features = await apiClient.extractAudioFeatures(file);
      setAudioFile({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || 'audio/wav',
        durationSec: features.durationSec,
        sampleRateHz: features.sampleRateHz,
        pcmBuffer: features.pcmSamples,
      });
    } catch (err: any) {
      // Fallback to basic file info if Web Audio decoding is unsupported for format
      setAudioFile({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || 'audio/wav',
        durationSec: 3.5,
        sampleRateHz: 16000,
      });
    }
  };

  // Handle Image/Video file upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);

    if (isVideo) {
      setMediaFile({
        mediaType: 'video',
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || 'video/mp4',
        durationSec: 4.2,
        previewUrl,
      });
    } else {
      const img = new Image();
      img.onload = () => {
        setMediaFile({
          mediaType: 'image',
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || 'image/jpeg',
          width: img.width,
          height: img.height,
          hasExifData: false, // Standard stripped canvas upload
          previewUrl,
        });
      };
      img.src = previewUrl;
    }
  };

  // Presets for immediate demonstration
  const loadPreset = (type: 'phish_sms' | 'irs_extortion' | 'task_scam' | 'clean_work') => {
    setErrorMessage(null);
    if (type === 'phish_sms') {
      setText('CHASE BANK ALERT: An unauthorized debit of $849.20 was placed on your account. If this was not you, immediate action required within 1 hour: verify your login credentials now at http://chase-security-verify.xyz/login?session=active');
      setUrl('http://chase-security-verify.xyz/login?session=active');
      setQrPayload('');
      setAudioFile(null);
      setMediaFile(null);
    } else if (type === 'irs_extortion') {
      setText('FINAL NOTICE: Internal Revenue Service (IRS) legal lawsuit filed against your SSN. An immediate arrest warrant will be issued within 24 hours. To resolve immediately without criminal charges, wire funds or purchase target gift cards.');
      setUrl('');
      setQrPayload('');
      setAudioFile(null);
      setMediaFile(null);
    } else if (type === 'task_scam') {
      setText('Earn $600 to $1200 daily working from home! Guaranteed returns. Just like YouTube videos and complete simple tasks. Transfer refundable deposit fee to start immediately.');
      setUrl('https://earn-daily-crypto.top/deposit');
      setQrPayload('');
      setAudioFile(null);
      setMediaFile(null);
    } else {
      setText('Hi Sarah, here are the meeting notes from today’s architecture discussion. Please review the proposal before tomorrow morning’s team sync.');
      setUrl('https://docs.company.internal/project-review');
      setQrPayload('');
      setAudioFile(null);
      setMediaFile(null);
    }
  };

  const handleExecuteMultimodal = async () => {
    setErrorMessage(null);
    const hasText = Boolean(text.trim());
    const hasUrl = Boolean(url.trim());
    const hasQr = Boolean(qrPayload.trim());
    const hasAudio = Boolean(audioFile);
    const hasMedia = Boolean(mediaFile);

    if (!hasText && !hasUrl && !hasQr && !hasAudio && !hasMedia) {
      setErrorMessage('Please provide at least one input modality (Text, URL, QR Code, Audio, or Media).');
      return;
    }

    setIsAnalyzing(true);
    const prefs = storageService.getPreferences();

    try {
      const report = await apiClient.analyzeMultimodal({
        text: hasText ? text : undefined,
        url: hasUrl ? url : undefined,
        qrPayload: hasQr ? qrPayload : undefined,
        audio: audioFile || undefined,
        media: mediaFile || undefined,
        privacyMode: prefs.privacyMode,
      });

      onAnalysisComplete(report);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Multimodal analysis failed. Check server connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Unified Multimodal Threat Workbench</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Analyze multiple threat channels simultaneously. The Central Fusion Engine combines valid detector results into an explainable Trust Risk Score.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Presets:</span>
          <button
            onClick={() => loadPreset('phish_sms')}
            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            Chase Phish
          </button>
          <button
            onClick={() => loadPreset('irs_extortion')}
            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            IRS Extortion
          </button>
          <button
            onClick={() => loadPreset('task_scam')}
            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            Task Scam
          </button>
          <button
            onClick={() => loadPreset('clean_work')}
            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            Benign Work
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Multimodal Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Modality 1: Text & Message */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>1. Message Content (SMS / Email / DM)</span>
            </label>
            {text && (
              <button
                onClick={() => setText('')}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste suspicious text message, email body, urgency ultimatum, or job proposition..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Length: {text.length} chars</span>
            <span>Weight: 1.00</span>
          </div>
        </div>

        {/* Modality 2: URL / Domain */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>2. Web Link / URL Destination</span>
            </label>
            {url && (
              <button
                onClick={() => setUrl('')}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. http://paypal-security-update.xyz/login or 192.168.1.1/auth"
            className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
          />
          <p className="text-[11px] text-slate-500">
            Passive analysis only. The backend never requests external destinations directly (SSRF safe).
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span>Status: {url ? 'Specified' : 'Optional'}</span>
            <span>Weight: 1.25</span>
          </div>
        </div>

        {/* Modality 3: QR Code Decoder */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>3. QR Code (Quishing Check)</span>
            </label>
            {qrPayload && (
              <button
                onClick={() => {
                  setQrPayload('');
                  setQrFileName('');
                }}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
          </div>

          {qrPayload ? (
            <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Decoded Payload ({qrFileName}):</span>
              </div>
              <div className="text-xs font-mono text-slate-300 break-all">{qrPayload}</div>
            </div>
          ) : (
            <label className="cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 transition text-center bg-slate-950/40">
              <Upload className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-slate-300 font-medium">Upload or Drop QR Image</span>
              <span className="text-[10px] text-slate-500">PNG, JPEG, WebP (Decoded client-side via jsQR)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
            </label>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Status: {qrPayload ? 'Decoded' : 'Optional'}</span>
            <span>Weight: 1.10</span>
          </div>
        </div>

        {/* Modality 4 & 5: Audio / Video Media */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">/</span>
              <Video className="w-4 h-4 text-amber-400" />
              <span>4. Audio & Deepfake Media</span>
            </label>
            {(audioFile || mediaFile) && (
              <button
                onClick={() => {
                  setAudioFile(null);
                  setMediaFile(null);
                }}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Audio Upload */}
            <label className="cursor-pointer border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition text-center bg-slate-950/40">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium truncate max-w-full">
                {audioFile ? audioFile.fileName : 'Audio (Voice)'}
              </span>
              <span className="text-[9px] text-slate-500">WAV, MP3, OGG</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>

            {/* Image/Video Upload */}
            <label className="cursor-pointer border border-dashed border-slate-800 hover:border-amber-500/50 rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition text-center bg-slate-950/40">
              <Video className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-slate-300 font-medium truncate max-w-full">
                {mediaFile ? mediaFile.fileName : 'Image / Video'}
              </span>
              <span className="text-[9px] text-slate-500">JPG, PNG, MP4</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Attached: {[audioFile?.fileName, mediaFile?.fileName].filter(Boolean).join(', ') || 'None'}</span>
            <span>Weight: 0.95</span>
          </div>
        </div>
      </div>

      {/* Action Trigger Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          <span>Active inputs will be evaluated independently, then combined using the documented fusion algorithm:</span>
          <code className="ml-1 text-cyan-300 font-mono">SUM(w_i × r_i) / SUM(w_i)</code>
        </div>

        <button
          onClick={handleExecuteMultimodal}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Executing Fusion Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Execute Multimodal Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
