import { AnalysisReport, AnalyticsSummary, SystemStatusResponse } from '../types/sentinel.js';
import jsQR from 'jsqr';

export class ApiClient {
  private baseUrl = '/api';

  public async getSystemStatus(): Promise<SystemStatusResponse> {
    const res = await fetch(`${this.baseUrl}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  }

  public async getHealth(): Promise<{ status: string; uptime: number }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  }

  public async analyzeText(text: string, privacyMode = false): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, privacyMode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Text analysis failed');
    }
    return res.json();
  }

  public async analyzeUrl(url: string, privacyMode = false): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, privacyMode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'URL analysis failed');
    }
    return res.json();
  }

  public async analyzeQr(payload: string, width?: number, height?: number, privacyMode = false): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, width, height, privacyMode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'QR analysis failed');
    }
    return res.json();
  }

  public async analyzeAudio(audioData: {
    fileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    durationSec?: number;
    sampleRateHz?: number;
    pcmBuffer?: number[];
  }, privacyMode = false): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...audioData, privacyMode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Audio analysis failed');
    }
    return res.json();
  }

  public async analyzeImage(imageData: {
    fileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    hasExifData?: boolean;
  }, privacyMode = false): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...imageData, privacyMode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Image analysis failed');
    }
    return res.json();
  }

  public async analyzeVideo(videoData: {
    fileName?: string;
    fileSizeBytes?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    durationSec?: number;
  }, privacyMode = false): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...videoData, privacyMode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Video analysis failed');
    }
    return res.json();
  }

  public async analyzeMultimodal(data: {
    text?: string;
    url?: string;
    qrPayload?: string;
    audio?: any;
    media?: any;
    privacyMode?: boolean;
  }): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/analyze/multimodal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Multimodal analysis failed');
    }
    return res.json();
  }

  public async getHistory(params?: {
    search?: string;
    modality?: string;
    riskBand?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: AnalysisReport[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.modality) query.append('modality', params.modality);
    if (params?.riskBand) query.append('riskBand', params.riskBand);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));

    const res = await fetch(`${this.baseUrl}/history?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  }

  public async getHistoryById(id: string): Promise<AnalysisReport> {
    const res = await fetch(`${this.baseUrl}/history/${id}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  }

  public async deleteHistoryItem(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/history/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  public async clearHistory(): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/history`, { method: 'DELETE' });
    return res.ok;
  }

  public async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${this.baseUrl}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }

  // Client-side QR decoding using standard HTML5 Canvas & jsQR
  public async decodeQrFromImageFile(file: File): Promise<{ payload: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D context unavailable'));
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            resolve({ payload: code.data, width: img.width, height: img.height });
          } else {
            reject(new Error('No valid QR code pattern found in this image. Ensure the image is clear and well-lit.'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Client-side Audio feature extraction using Web Audio API
  public async extractAudioFeatures(file: File): Promise<{
    durationSec: number;
    sampleRateHz: number;
    channels: number;
    pcmSamples: number[];
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    // Downsample for transmission: take 200 evenly spaced samples
    const step = Math.max(1, Math.floor(channelData.length / 200));
    const pcmSamples: number[] = [];
    for (let i = 0; i < channelData.length && pcmSamples.length < 200; i += step) {
      pcmSamples.push(Number(channelData[i].toFixed(4)));
    }

    return {
      durationSec: audioBuffer.duration,
      sampleRateHz: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      pcmSamples,
    };
  }
}

export const apiClient = new ApiClient();
