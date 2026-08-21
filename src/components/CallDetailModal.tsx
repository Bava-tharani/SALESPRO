import React, { useState } from 'react';
import { CallRecord } from '../types';
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
  MessageSquareQuote
} from 'lucide-react';
import { displayPhoneNumber } from '../services/telephonyProvider';

interface Props {
  call: CallRecord;
  onClose: () => void;
}

export const CallDetailModal: React.FC<Props> = ({ call, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [activeTab, setActiveTab] = useState<'transcripts' | 'objections' | 'telemetry'>('transcripts');

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder.toString().padStart(2, '0')}s`;
  };

  const transcripts = call.realTimeInsights?.transcripts || [
    {
      id: 'seg-1',
      speaker: 'rep',
      speakerName: call.salespersonName,
      channel: 0,
      text: `Hello ${call.leadName}, this is ${call.salespersonName} following up on your cloud sales telephony inquiry.`,
      timestamp: '14:10:05',
      offsetSeconds: 5,
      confidence: 0.98,
      isFinal: true
    },
    {
      id: 'seg-2',
      speaker: 'prospect',
      speakerName: call.leadName,
      channel: 1,
      text: 'Hi Rajesh. We are reviewing options to upgrade our 40 sales reps. We need reliable call recording and instant CRM transcript sync.',
      timestamp: '14:10:22',
      offsetSeconds: 22,
      confidence: 0.97,
      isFinal: true
    },
    {
      id: 'seg-3',
      speaker: 'rep',
      speakerName: call.salespersonName,
      channel: 0,
      text: 'We provide native WebRTC softphones with zero setup and automated dual-channel cloud recording under Indian TRAI regulations.',
      timestamp: '14:10:45',
      offsetSeconds: 45,
      confidence: 0.99,
      isFinal: true
    }
  ];

  const objections = call.realTimeInsights?.objectionsDetected || [];
  const session = call.telephonySession;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/40 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Call Intelligence Audit: {call.leadName}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {call.outcome}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">
                {new Date(call.startedAt).toLocaleString('en-IN')} • ID: {call.id}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dual-Channel Waveform Audio Player */}
          <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#00f2ff]" /> Dual-Channel Audio Playback (Opus 48kHz)
              </span>
              <span className="text-[10px] font-mono text-[#00f2ff] font-bold">
                {formatDuration(call.durationSeconds)}
              </span>
            </div>

            {/* Visual Waveform Bars */}
            <div className="flex items-center justify-between gap-1 h-10 px-2 bg-black/40 rounded border border-white/5">
              {[30, 60, 45, 80, 95, 70, 40, 65, 85, 100, 50, 75, 90, 60, 40, 70, 85, 90, 60, 30, 45, 80, 65, 40, 55, 70].map(
                (h, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all ${
                      idx < (audioProgress / 100) * 26 ? 'bg-[#00f2ff]' : 'bg-white/10'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="p-2 rounded bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Play Audio'}</span>
                </button>

                <button
                  onClick={() => setAudioProgress(0)}
                  className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs border border-white/10 cursor-pointer"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed Toggles */}
              <div className="flex items-center gap-1">
                {[1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd as any)}
                    className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Intelligence Summary Card */}
          {call.aiInsight && (
            <div className="p-4 rounded-lg bg-[#161616] border border-[#00f2ff]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Conversation Insights
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20">
                    Quality: {call.aiInsight.callQualityScore}/100
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {call.aiInsight.sentiment} Sentiment
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5 font-mono">
                {call.aiInsight.aiSummary}
              </p>

              {call.aiInsight.keyTopics && (
                <div className="flex flex-wrap gap-1.5">
                  {call.aiInsight.keyTopics.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#121212] text-gray-300 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tabs for Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setActiveTab('transcripts')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'transcripts'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" /> Full Transcripts
              </button>

              <button
                onClick={() => setActiveTab('objections')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'objections'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Objections & Battlecards ({objections.length})
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'telemetry'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#00f2ff]" /> Telephony & Cloud Storage
              </button>
            </div>

            {/* TAB: Transcripts */}
            {activeTab === 'transcripts' && (
              <div className="space-y-2.5 max-h-60 overflow-y-auto p-3 rounded-lg bg-[#161616] border border-white/5">
                {transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded text-xs space-y-1 ${
                      t.channel === 0 ? 'bg-[#00f2ff]/5 border-l-2 border-[#00f2ff]' : 'bg-black/40 border-l-2 border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span className="font-bold text-gray-300">{t.speakerName} ({t.channel === 0 ? 'Rep' : 'Customer'})</span>
                      <span>{t.timestamp}</span>
                    </div>
                    <p className="text-gray-200">{t.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Objections */}
            {activeTab === 'objections' && (
              <div className="space-y-2">
                {objections.length === 0 ? (
                  <div className="p-4 rounded bg-[#161616] border border-white/5 text-center text-xs text-gray-500">
                    No major customer friction or objections logged on this call.
                  </div>
                ) : (
                  objections.map((obj) => (
                    <div key={obj.id} className="p-3 rounded bg-[#161616] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {obj.battleCard.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{obj.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-300 italic bg-black/40 p-2 rounded">"{obj.matchedText}"</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Telemetry */}
            {activeTab === 'telemetry' && (
              <div className="p-4 rounded bg-[#161616] border border-white/5 space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>Trunk: <strong className="text-white">{session?.trunkName || 'SIP-Trunk-AWS-Mumbai'}</strong></div>
                  <div>STT Vendor: <strong className="text-[#00f2ff]">{session?.sttVendor || 'Deepgram Nova-2'}</strong></div>
                  <div>Storage Bucket: <strong className="text-white">{session?.s3Bucket || 's3://salescall-recordings-prod'}</strong></div>
                  <div>Jurisdiction: <strong className="text-emerald-400">{session?.complianceJurisdiction || 'IN-TRAI'}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#121212] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black rounded-md uppercase tracking-wider cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
