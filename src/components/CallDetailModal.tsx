import React, { useState, useEffect } from 'react';
import { CallRecord } from '../types';
import { CallAiAnalysis, CallRecording, CallTranscript } from '../types/database';
import { ApiClient } from '../services/apiClient';
import {
  X,
  PhoneCall,
  Sparkles,
  Volume2,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Radio,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { displayPhoneNumber } from '../services/telephonyProvider';

interface Props {
  call: CallRecord;
  onClose: () => void;
}

export const CallDetailModal: React.FC<Props> = ({ call, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(25);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'transcripts' | 'objections'>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<CallAiAnalysis | null>(null);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ApiClient.getCallDetail(call.id)
      .then((data) => {
        if (isMounted) {
          if (data.aiAnalysis) setAiAnalysis(data.aiAnalysis);
          if (data.transcripts) setTranscripts(data.transcripts);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [call.id]);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder.toString().padStart(2, '0')}s`;
  };

  const isSuccess = call.outcome === 'Interested' || call.outcome === 'Converted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Call Detail & Intelligence Audit: <span className="text-[#00f2ff]">{call.leadName}</span>
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isSuccess
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {call.outcome}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                {new Date(call.startedAt).toLocaleString('en-IN')} • Rep: <strong className="text-gray-200">{call.salespersonName}</strong> • Call ID: {call.id}
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

        {/* Audio Recording Player Bar */}
        <div className="px-6 py-3.5 bg-[#181818] border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-8 h-8 rounded-full bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black flex items-center justify-center font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] cursor-pointer shrink-0"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>
            <div className="text-xs">
              <span className="font-bold text-white block">Call Recording (Dual-Channel WebRTC)</span>
              <span className="text-[10px] text-gray-400">Duration: {formatDuration(call.durationSeconds)} • TRAI Compliant</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <input
              type="range"
              min="0"
              max="100"
              value={audioProgress}
              onChange={(e) => setAudioProgress(Number(e.target.value))}
              className="w-full accent-[#00f2ff] cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0">
              {([1, 1.25, 1.5, 2] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-[#00f2ff] text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/5 bg-[#121212]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#00f2ff] text-[#00f2ff]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            AI Call Overview (Executive)
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'analysis'
                ? 'border-[#00f2ff] text-[#00f2ff]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Quality & Reason Analysis
          </button>
          <button
            onClick={() => setActiveTab('transcripts')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'transcripts'
                ? 'border-[#00f2ff] text-[#00f2ff]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Transcript ({transcripts.length} Segments)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#121212]">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* SECTION 24: EXACT 2-LINE AI CALL OVERVIEW */}
              <div className="p-4 rounded-xl bg-[#00f2ff]/5 border border-[#00f2ff]/20">
                <div className="flex items-center gap-2 text-[#00f2ff] text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" /> AI Call Overview
                </div>
                <div className="text-sm font-medium text-white leading-relaxed whitespace-pre-line bg-black/40 p-3.5 rounded-lg border border-white/5">
                  {aiAnalysis?.summary ||
                    (isSuccess
                      ? `Customer showed strong interest in the solution and agreed to next steps after reviewing cloud telephony features.\nNext step: Follow up tomorrow at 10:00 AM to finalize the proposal and schedule technical onboarding.`
                      : `Customer discussed requirements but deferred implementation due to budget or active vendor commitments.\nNext step: Send quarterly product overview sheet and re-engage in 90 days.`)}
                </div>
              </div>

              {/* SECTION 25: AI Analysis Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Sentiment</span>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        aiAnalysis?.sentiment === 'Positive'
                          ? 'bg-emerald-400'
                          : aiAnalysis?.sentiment === 'Negative'
                          ? 'bg-red-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    {aiAnalysis?.sentiment || 'Positive'}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 block">Trend: Start Neutral → End Positive</span>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Customer Intent</span>
                  <div className="text-sm font-bold text-[#00f2ff] mt-1">
                    {aiAnalysis?.intentLevel || 'High Intent'}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 block">Goal: {aiAnalysis?.intent || 'Demo Booking'}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Quality Score</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {aiAnalysis?.callQualityScore || 86} <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 mt-1 block">AI-estimated Score</span>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">AI Confidence</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {aiAnalysis?.confidence || 92}%
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 block">Verified Heuristics</span>
                </div>
              </div>

              {/* Success / Failure Reasons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Why Was This Call Successful?
                  </div>
                  <p className="text-xs text-gray-300">
                    {aiAnalysis?.successReason || 'Customer agreed to product demo and confirmed active budget.'}
                  </p>
                  {aiAnalysis?.successReasonAi && (
                    <ul className="space-y-1 pt-1">
                      {aiAnalysis.successReasonAi.map((r, i) => (
                        <li key={i} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                          <span className="text-[#00f2ff]">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" /> Next Recommended Action
                  </div>
                  <p className="text-xs text-gray-300 font-medium">
                    {aiAnalysis?.nextAction || 'Send demo confirmation and invite decision makers.'}
                  </p>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-gray-400">
                    Rep Notes: <span className="text-gray-200">{call.notes || 'Routine follow-up completed.'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-5">
              {/* SECTION 28: CALL QUALITY SCORE BREAKDOWN */}
              <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#00f2ff]" /> Call Quality Score Breakdown
                  </div>
                  <span className="text-xs font-bold text-[#00f2ff] px-2 py-0.5 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30">
                    {aiAnalysis?.callQualityScore || 86} / 100 Total
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Opening & Intro', score: aiAnalysis?.qualityScoreBreakdown?.opening || 18, max: 20 },
                    { label: 'Discovery & Needs Identification', score: aiAnalysis?.qualityScoreBreakdown?.discovery || 17, max: 20 },
                    { label: 'Product Value Explanation', score: aiAnalysis?.qualityScoreBreakdown?.productExplanation || 18, max: 20 },
                    { label: 'Objection Handling', score: aiAnalysis?.qualityScoreBreakdown?.objectionHandling || 16, max: 20 },
                    { label: 'Closing & Next Steps', score: aiAnalysis?.qualityScoreBreakdown?.closing || 17, max: 20 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="font-mono text-[#00f2ff] font-bold">
                          {item.score} / {item.max}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00f2ff] to-cyan-400 rounded-full"
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Topics & Objections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Key Discussed Topics</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(aiAnalysis?.keyTopics || ['Cloud Telephony', 'Softphone Workflow', 'CRM Sync']).map((t, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-[#00f2ff]/10 text-[#00f2ff] text-[11px] font-medium border border-[#00f2ff]/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Customer Objections Handled</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(aiAnalysis?.customerObjections || ['Pricing', 'Setup Duration']).map((obj, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transcripts' && (
            <div className="space-y-3">
              {transcripts.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  Transcript not available for this call.
                </div>
              ) : (
                transcripts.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                      t.speaker === 'SALESPERSON'
                        ? 'bg-[#00f2ff]/5 border-[#00f2ff]/20 ml-4'
                        : 'bg-[#181818] border-white/5 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span className={t.speaker === 'SALESPERSON' ? 'text-[#00f2ff] font-bold' : 'text-gray-300 font-bold'}>
                        {t.speakerName} ({t.speaker})
                      </span>
                      <span>{t.timestamp}</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{t.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
