import React from 'react';
import { Lead } from '../types';
import { X, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Clock, Compass } from 'lucide-react';

interface Props {
  lead: Lead;
  onClose: () => void;
}

export const AiScoreExplainerModal: React.FC<Props> = ({ lead, onClose }) => {
  const analysis = lead.aiAnalysis;
  if (!analysis) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getGaugeStroke = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#06b6d4';
    if (score >= 40) return '#f59e0b';
    return '#f43f5e';
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (analysis.score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                AI Lead Intelligence Breakdown
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Prospect: <span className="text-gray-200 font-semibold">{lead.name}</span> ({lead.company || 'Individual'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Radial Gauge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#161616] border border-white/5">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1c1c1c"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={getGaugeStroke(analysis.score)}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-white font-mono">{analysis.score}</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">AI Score</span>
                </div>
              </div>
              <div className={`mt-2 px-2.5 py-0.5 rounded text-[11px] font-bold border ${getScoreColor(analysis.score)}`}>
                {analysis.buyingIntent} Intent
              </div>
            </div>

            {/* Probability & Confidence */}
            <div className="space-y-3 md:col-span-2">
              <div className="p-3.5 rounded-lg bg-[#161616] border border-white/5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#00f2ff]" /> Conversion Probability
                  </span>
                  <span className="text-sm font-bold text-[#00f2ff] font-mono">{analysis.conversionProbability}%</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00f2ff] rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(0,242,255,0.5)]"
                    style={{ width: `${analysis.conversionProbability}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Confidence
                  </div>
                  <div className="text-sm font-bold text-gray-200 mt-0.5 font-mono">{analysis.confidence}%</div>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Optimal Slot
                  </div>
                  <div className="text-xs font-semibold text-gray-200 mt-1 truncate">{analysis.bestTimeToCall}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-lg bg-[#161616] border border-[#00f2ff]/20 text-gray-300 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-[#00f2ff] font-bold mb-1 text-[10px] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> AI Predictive Assessment
            </div>
            {analysis.summary}
          </div>

          {/* Recommended Next Best Action */}
          <div className="p-4 rounded-lg bg-[#161616] border border-white/5">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Next Best Action Recommendation
            </div>
            <div className="text-xs font-medium text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              {analysis.recommendedAction}
            </div>
          </div>

          {/* Positive Factors Breakdown */}
          {analysis.positiveFactors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Positive Drivers ({analysis.positiveFactors.length})
              </div>
              <div className="space-y-2">
                {analysis.positiveFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#161616] border border-emerald-500/20 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gray-200">{f.factor}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">{f.detail}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono shrink-0 text-[10px] border border-emerald-500/30">
                      +{f.scoreDelta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Negative / Friction Factors Breakdown */}
          {analysis.negativeFactors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> Friction & Risk Signals ({analysis.negativeFactors.length})
              </div>
              <div className="space-y-2">
                {analysis.negativeFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#161616] border border-red-500/20 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gray-200">{f.factor}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">{f.detail}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold font-mono shrink-0 text-[10px] border border-red-500/30">
                      {f.scoreDelta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/5 bg-[#121212] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#161616] hover:bg-[#1a1a1a] text-gray-300 rounded-md border border-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
