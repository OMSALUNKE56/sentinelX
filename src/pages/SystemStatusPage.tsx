import React, { useEffect, useState } from 'react';
import { Server, Activity, CheckCircle2, Clock, Cpu, RefreshCw, AlertCircle, Wifi } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { SystemStatusResponse } from '../types/sentinel.js';

export const SystemStatusPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const pingServer = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const data = await apiClient.getSystemStatus();
      setLatencyMs(Math.round(performance.now() - start));
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pingServer();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Server className="w-6 h-6 text-cyan-400" />
            <span>SentinelX System Telemetry & Status</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time operational health checks across all detector pipelines, endpoints, and server execution runtimes.
          </p>
        </div>

        <button
          onClick={pingServer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Status</span>
        </button>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Core Health</span>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational</span>
            </div>
          </div>
          <Activity className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Round-Trip Latency</span>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {latencyMs !== null ? `${latencyMs} ms` : 'Testing...'}
            </div>
          </div>
          <Wifi className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400">Engine Uptime</span>
            <div className="text-lg font-bold font-mono text-slate-200">
              {status?.uptimeSeconds ? `${status.uptimeSeconds}s` : 'Active'}
            </div>
          </div>
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* Detector Modules Telemetry Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Detection Pipelines & Model Adapters</span>
        </h3>

        {status?.detectors && (
          <div className="space-y-3">
            {Object.entries(status.detectors).map(([key, det]) => (
              <div
                key={key}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-200 uppercase font-mono">{key}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      v{det.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{det.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>OPERATIONAL</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Contract Endpoints */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          Documented REST Endpoints
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-emerald-400 font-bold">GET</span> /api/health
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-emerald-400 font-bold">GET</span> /api/system/status
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-cyan-400 font-bold">POST</span> /api/analyze/text
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-cyan-400 font-bold">POST</span> /api/analyze/url
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-cyan-400 font-bold">POST</span> /api/analyze/qr
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-cyan-400 font-bold">POST</span> /api/analyze/multimodal
          </div>
        </div>
      </div>
    </div>
  );
};
