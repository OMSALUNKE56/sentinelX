import React, { useState } from 'react';
import { QrCode, Upload, Sparkles, Loader2, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { AnalysisReport } from '../types/sentinel.js';
import { storageService } from '../services/storageService.js';

interface QrScannerPageProps {
  onAnalysisComplete: (report: AnalysisReport) => void;
}

export const QrScannerPage: React.FC<QrScannerPageProps> = ({
  onAnalysisComplete,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<string | null>(null);
  const [matrixDims, setMatrixDims] = useState<{ width: number; height: number } | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setDecodedPayload(null);
    setMatrixDims(null);
    setIsDecoding(true);

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    try {
      const decoded = await apiClient.decodeQrFromImageFile(file);
      setDecodedPayload(decoded.payload);
      setMatrixDims({ width: decoded.width, height: decoded.height });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to decode QR code from the selected image.');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleRunSecurityAnalysis = async () => {
    if (!decodedPayload) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    const prefs = storageService.getPreferences();

    try {
      const report = await apiClient.analyzeQr(
        decodedPayload,
        matrixDims?.width,
        matrixDims?.height,
        prefs.privacyMode
      );
      onAnalysisComplete(report);
    } catch (err: any) {
      setErrorMessage(err?.message || 'QR Security analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyPayload = () => {
    if (!decodedPayload) return;
    navigator.clipboard.writeText(decodedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <QrCode className="w-6 h-6 text-purple-400" />
          <span>QR Code & Quishing Threat Scanner</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Decodes matrix barcodes in high fidelity using client-side Reed-Solomon algorithms, then filters unpacked web destinations through the URL security engine.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload & Preview Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Dropzone */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select or Drop QR Code Image
            </span>
            <p className="text-xs text-slate-400">
              Supports PNG, JPEG, SVG, and WebP format screenshots or photo captures.
            </p>
          </div>

          <label className="cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition text-center bg-slate-950/40">
            {isDecoding ? (
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-purple-400" />
            )}
            <span className="text-xs font-semibold text-slate-200">
              {isDecoding ? 'Decoding Matrix Pattern...' : 'Browse QR Image File'}
            </span>
            <span className="text-[10px] text-slate-500">
              Decoding occurs in-memory via jsQR
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <div className="text-[11px] text-slate-500">
            Tip: For desktop testing, take a screenshot of any QR code or save a sample barcode.
          </div>
        </div>

        {/* Decode Preview */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Decoded Payload & Raster View
          </span>

          {imagePreview ? (
            <div className="space-y-3">
              <div className="h-36 w-full rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={imagePreview}
                  alt="QR Preview"
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>

              {decodedPayload ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Decoded Destination</span>
                    </span>
                    <button
                      onClick={copyPayload}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title="Copy payload"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-200 break-all max-h-24 overflow-y-auto">
                    {decodedPayload}
                  </div>
                </div>
              ) : !isDecoding ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 text-xs">
                  No valid QR barcode recognized in this image raster.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-44 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <QrCode className="w-8 h-8 opacity-40 mb-2" />
              <span>No image loaded yet. Select a file on the left.</span>
            </div>
          )}

          <button
            onClick={handleRunSecurityAnalysis}
            disabled={!decodedPayload || isAnalyzing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Piping to Destination Phishing Analyzer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate QR Destination Risk</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
