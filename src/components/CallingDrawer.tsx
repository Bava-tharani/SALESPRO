import React, { useState, useEffect, useRef } from 'react';
import {
  Lead,
  CallStatus,
  CallOutcome,
  CallRecord,
  FollowUp,
  User,
  AiCallInsight,
  TranscriptSegment,
  LiveObjection,
  SentimentPoint,
  LiveCoachingAlert,
  TelephonySession,
  WebRtcStats,
  SoftphoneState
} from '../types';
import { LocalAIService } from '../services/aiService';
import {
  audioSynth,
  displayPhoneNumber,
  formatE164,
  WebRtcSoftphoneGateway,
  TelephonySessionManager
} from '../services/telephonyProvider';
import {
  LiveSpeechAiEngine,
  SIMULATED_CALL_SCRIPTS
} from '../services/liveSpeechAiService';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle,
  Calendar,
  Clock,
  Building2,
  FileText,
  TrendingUp,
  AlertCircle,
  Volume2,
  Pause,
  Play,
  Share2,
  Users,
  Grid3X3,
  Shield,
  Radio,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  MessageSquareQuote,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  lead: Lead;
  currentUser: User;
  allSalespeople?: User[];
  onEndAndSaveCall: (
    callRecord: CallRecord,
    newFollowUp?: FollowUp,
    updatedLeadStatus?: Lead['status']
  ) => void;
  onCancelCall: () => void;
}

export const CallingDrawer: React.FC<Props> = ({
  lead,
  currentUser,
  allSalespeople = [],
  onEndAndSaveCall,
  onCancelCall
}) => {
  // Telephony Softphone States
  const [softphoneState, setSoftphoneState] = useState<SoftphoneState>('dialing');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [recordingConsentGiven, setRecordingConsentGiven] = useState(true);

  // In-Call Active Sub-Panels
  const [activeTab, setActiveTab] = useState<'ai_coach' | 'live_transcript' | 'dtmf_pad' | 'telemetry'>('ai_coach');
  const [dtmfDigits, setDtmfDigits] = useState<string[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [copiedBattleCardId, setCopiedBattleCardId] = useState<string | null>(null);

  // Real-Time STT & Mid-Call AI Intelligence State
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [objections, setObjections] = useState<LiveObjection[]>([]);
  const [sentimentScore, setSentimentScore] = useState(25); // -100 to +100
  const [sentimentTimeline, setSentimentTimeline] = useState<SentimentPoint[]>([
    { timeOffset: 0, sentimentScore: 0.25, sentimentLabel: 'Positive' }
  ]);
  const [liveTopics, setLiveTopics] = useState<string[]>(['Carrier Voice Quality', 'CRM & API Integration']);
  const [repTalkPct, setRepTalkPct] = useState(48);
  const [prospectTalkPct, setProspectTalkPct] = useState(52);
  const [speakingPaceWpm, setSpeakingPaceWpm] = useState(136);
  const [coachingAlerts, setCoachingAlerts] = useState<LiveCoachingAlert[]>([]);
  const [webrtcStats, setWebrtcStats] = useState<WebRtcStats>({
    packetLoss: 0.08,
    jitterMs: 11,
    rttMs: 36,
    audioBitrateKbps: 64,
    codec: 'Opus 48kHz / Fullband Stereo',
    iceState: 'completed',
    audioLevelDb: -22
  });

  // Call Logging Form State (Phase 2 Post-Call)
  const [callStatus, setCallStatus] = useState<CallStatus>('Answered');
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('Interested');
  const [callNotes, setCallNotes] = useState('');
  const [aiInsight, setAiInsight] = useState<AiCallInsight | null>(null);

  // Follow-up sub-form
  const [scheduleFollowUp, setScheduleFollowUp] = useState(true);
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Refs & Engine instances
  const softphoneGatewayRef = useRef<WebRtcSoftphoneGateway>(new WebRtcSoftphoneGateway());
  const timerRef = useRef<number | null>(null);
  const telemetryIntervalRef = useRef<number | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const speechScriptIndexRef = useRef<number>(0);
  const sessionDataRef = useRef<TelephonySession>(
    TelephonySessionManager.createSession('outbound', lead.phone, '+91 22 6900 1200', 'webrtc', 'deepgram', 'IN-TRAI')
  );

  // Choose script scenario based on lead priority or characteristics
  const scriptScenario = lead.priority === 'High'
    ? SIMULATED_CALL_SCRIPTS.enterprise_demo
    : SIMULATED_CALL_SCRIPTS.pricing_objection;

  // Softphone Outbound Call Setup Lifecycle
  useEffect(() => {
    // 1. Dialing state (0s - 1.5s)
    setSoftphoneState('dialing');

    const ringTimeout = setTimeout(() => {
      // 2. Ringing state (1.5s - 3.2s)
      setSoftphoneState('ringing');
      audioSynth.playRingPulse();
    }, 1400);

    const connectTimeout = setTimeout(() => {
      // 3. WebRTC ICE connection established (3.2s)
      setSoftphoneState('connected');

      // Add system compliance disclosure segment
      const complianceSegment: TranscriptSegment = {
        id: `sys-${Date.now()}`,
        speaker: 'system',
        speakerName: 'Compliance System',
        channel: 0,
        text: '📢 [TRAI / GDPR Notice]: This call is recorded on secure dual-channel cloud storage for quality assurance.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        offsetSeconds: 0,
        confidence: 1.0,
        isFinal: true
      };
      setTranscripts([complianceSegment]);
    }, 3200);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
    };
  }, [lead.id]);

  // Main Call Duration Timer & Telemetry Polling
  useEffect(() => {
    if (softphoneState === 'connected' || softphoneState === 'on_hold') {
      timerRef.current = window.setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);

      telemetryIntervalRef.current = window.setInterval(() => {
        const stats = softphoneGatewayRef.current.getWebRtcStats();
        setWebrtcStats(stats);
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    };
  }, [softphoneState]);

  // Real-Time Speech Recognition & Mid-Call AI Streaming Simulation
  useEffect(() => {
    if (softphoneState !== 'connected' || isOnHold) return;

    let timeoutHandle: NodeJS.Timeout;

    const streamNextSpeech = () => {
      if (speechScriptIndexRef.current >= scriptScenario.length) return;

      const item = scriptScenario[speechScriptIndexRef.current];
      timeoutHandle = setTimeout(() => {
        const nowStr = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const currentOffset = durationSeconds;

        const newSeg: TranscriptSegment = {
          id: `seg-${Date.now()}-${speechScriptIndexRef.current}`,
          speaker: item.speaker,
          speakerName: item.speaker === 'rep' ? currentUser.name : lead.name,
          channel: item.speaker === 'rep' ? 0 : 1,
          text: item.text,
          timestamp: nowStr,
          offsetSeconds: currentOffset,
          confidence: parseFloat((0.95 + Math.random() * 0.04).toFixed(2)),
          sentiment: item.sentiment,
          isFinal: true
        };

        setTranscripts((prev) => {
          const updated = [...prev, newSeg];

          // 1. Detect mid-call objections
          if (item.speaker === 'prospect') {
            const detectedObj = LiveSpeechAiEngine.detectObjection(item.text, currentOffset);
            if (detectedObj) {
              setObjections((objPrev) => [detectedObj, ...objPrev]);
            }
          }

          // 2. Compute dynamic sentiment drift
          const sentimentResult = LiveSpeechAiEngine.computeSentimentDrift(updated, item.text, item.speaker);
          setSentimentScore(sentimentResult.sentimentScore);
          setSentimentTimeline((stPrev) => [
            ...stPrev,
            {
              timeOffset: currentOffset,
              sentimentScore: parseFloat((sentimentResult.sentimentScore / 100).toFixed(2)),
              sentimentLabel: sentimentResult.sentimentLabel,
              triggerText: item.text
            }
          ]);

          // 3. Extract real-time topics
          const allText = updated.map((s) => s.text).join(' ');
          setLiveTopics(LiveSpeechAiEngine.extractLiveTopics(allText));

          // 4. Calculate Talk-to-Listen ratios & pacing
          const metrics = LiveSpeechAiEngine.calculateTalkRatios(updated);
          setRepTalkPct(metrics.repTalkPercentage);
          setProspectTalkPct(metrics.prospectTalkPercentage);
          setSpeakingPaceWpm(metrics.speakingPaceWpm);
          if (metrics.alerts.length > 0) {
            setCoachingAlerts(metrics.alerts);
          }

          return updated;
        });

        // Scroll transcript downward
        if (transcriptScrollRef.current) {
          transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
        }

        speechScriptIndexRef.current += 1;
        streamNextSpeech();
      }, item.delayMs);
    };

    streamNextSpeech();

    return () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    };
  }, [softphoneState, isOnHold, scriptScenario, currentUser.name, lead.name, durationSeconds]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // In-Call Action Handlers
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    softphoneGatewayRef.current.mute(nextMuted);
  };

  const handleToggleHold = () => {
    const nextHold = !isOnHold;
    setIsOnHold(nextHold);
    setSoftphoneState(nextHold ? 'on_hold' : 'connected');
    softphoneGatewayRef.current.hold(nextHold);
  };

  const handleDtmfPress = (digit: string) => {
    softphoneGatewayRef.current.sendDtmf(digit);
    setDtmfDigits((prev) => [...prev, digit]);
  };

  const handleCopyBattleCard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBattleCardId(id);
    setTimeout(() => setCopiedBattleCardId(null), 2000);
  };

  const handleEndCall = () => {
    setSoftphoneState('disconnected');
    softphoneGatewayRef.current.hangup(sessionDataRef.current.sessionSid);

    // Auto-synthesize rich notes from live transcripts
    const prospectUtterances = transcripts
      .filter((t) => t.speaker === 'prospect')
      .map((t) => t.text)
      .join(' ');

    const defaultNotes = transcripts.length > 2
      ? `Live call transcript logged. Key points: ${prospectUtterances.slice(0, 220)}...`
      : `Completed call with ${lead.name}. Telephony session ${sessionDataRef.current.sessionSid} recorded.`;

    setCallNotes(defaultNotes);

    // Generate Phase 2 AI analysis enriched with Phase 3 live transcript data
    const insight = LocalAIService.analyzeCall(
      callStatus,
      callOutcome,
      durationSeconds,
      defaultNotes,
      lead.name
    );
    setAiInsight(insight);

    if (insight.smartFollowUpSuggestion) {
      setFollowUpNotes(insight.smartFollowUpSuggestion.agenda);
    }
  };

  const handleOutcomeChange = (newOutcome: CallOutcome) => {
    setCallOutcome(newOutcome);
    if (newOutcome === 'Converted') {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    }
    const insight = LocalAIService.analyzeCall(
      callStatus,
      newOutcome,
      durationSeconds,
      callNotes,
      lead.name
    );
    setAiInsight(insight);
    if (insight.smartFollowUpSuggestion) {
      setFollowUpNotes(insight.smartFollowUpSuggestion.agenda);
    }
  };

  const handleStatusChange = (newStatus: CallStatus) => {
    setCallStatus(newStatus);
    if (newStatus !== 'Answered') {
      setCallOutcome('Call Later');
    }
    const insight = LocalAIService.analyzeCall(
      newStatus,
      callOutcome,
      durationSeconds,
      callNotes,
      lead.name
    );
    setAiInsight(insight);
  };

  const handleSaveRecord = () => {
    const finalInsight = LocalAIService.analyzeCall(
      callStatus,
      callOutcome,
      durationSeconds,
      callNotes,
      lead.name
    );

    // Attach Phase 3 Telephony Session and Real-Time Insights into the CallRecord
    const callRecord: CallRecord = {
      id: `CALL-${Date.now().toString().slice(-5)}`,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: Math.max(1, durationSeconds),
      status: callStatus,
      outcome: callOutcome,
      notes: callNotes,
      createdAt: new Date().toISOString(),
      aiInsight: finalInsight,
      telephonySession: {
        ...sessionDataRef.current,
        webrtcStats,
        dtmfLogs: dtmfDigits
      },
      realTimeInsights: {
        transcripts,
        objectionsDetected: objections,
        sentimentTimeline,
        currentSentimentScore: sentimentScore,
        liveTopics,
        repTalkPercentage: repTalkPct,
        prospectTalkPercentage: prospectTalkPct,
        speakingPaceWpm,
        liveCoachingAlerts: coachingAlerts
      }
    };

    let newFollowUp: FollowUp | undefined = undefined;
    if (
      scheduleFollowUp &&
      (callOutcome === 'Interested' ||
        callOutcome === 'Follow-up Required' ||
        callOutcome === 'Call Later')
    ) {
      newFollowUp = {
        id: `FU-${Date.now().toString().slice(-5)}`,
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone,
        salespersonId: currentUser.id,
        salespersonName: currentUser.name,
        scheduledDate: followUpDate,
        scheduledTime: followUpTime,
        reminder: '15 minutes before',
        status: 'Pending',
        notes: followUpNotes || `Follow-up following live WebRTC call outcome: ${callOutcome}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: lead.priority
      };
    }

    let newLeadStatus: Lead['status'] | undefined;
    if (callOutcome === 'Converted') newLeadStatus = 'Converted';
    else if (callOutcome === 'Interested') newLeadStatus = 'Interested';
    else if (callOutcome === 'Follow-up Required' || callOutcome === 'Call Later')
      newLeadStatus = 'Follow-up';
    else if (callOutcome === 'Not Interested') newLeadStatus = 'Not Interested';
    else if (callStatus === 'Answered') newLeadStatus = 'Contacted';

    onEndAndSaveCall(callRecord, newFollowUp, newLeadStatus);
  };

  const isLive = softphoneState === 'connected' || softphoneState === 'on_hold';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-slideInRight selection:bg-[#00f2ff] selection:text-black">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-[#121212]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isLive ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f2ff]"></span>
              </span>
            ) : softphoneState === 'dialing' || softphoneState === 'ringing' ? (
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            ) : (
              <span className="w-3 h-3 rounded-full bg-gray-500" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {softphoneState === 'dialing' && 'SIP INVITE • Dialing Carrier Trunk...'}
                {softphoneState === 'ringing' && '180 Ringing • Awaiting Pick-up...'}
                {softphoneState === 'connected' && 'WebRTC Active • Dual-Channel STT'}
                {softphoneState === 'on_hold' && 'Call On Hold • Music Synth Active'}
                {softphoneState === 'disconnected' && 'Call Terminated • Log Outcome'}
              </span>
              {isLive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1 font-bold">
                  <Radio className="w-3 h-3 animate-pulse" /> REC DUAL-CHANNEL
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Trunk: SIP-AWS-Mumbai • Codec: Opus 48kHz • STT: Deepgram Nova-2
            </p>
          </div>
        </div>

        <button
          onClick={onCancelCall}
          className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded hover:bg-white/5"
        >
          Close
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Softphone Live Hero Calling Card */}
        <div className="p-5 rounded-lg bg-[#161616] border border-white/5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-black/50 border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] font-extrabold text-xl shadow-[0_0_15px_rgba(0,242,255,0.15)] shrink-0">
                {lead.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    {lead.name}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                    {lead.priority}
                  </span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>{lead.company || 'Direct Contact'}</span>
                  <span>•</span>
                  <span className="text-[#00f2ff]">{displayPhoneNumber(lead.phone)}</span>
                </div>
              </div>
            </div>

            {/* Live Call Duration Clock */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="py-1.5 px-4 rounded-md bg-black/60 border border-[#00f2ff]/40 text-[#00f2ff] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00f2ff]" />
                <span className="text-xl font-bold font-mono tracking-widest">
                  {formatTime(durationSeconds)}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono mt-1">
                ICE RTT: {webrtcStats.rttMs}ms • Jitter: {webrtcStats.jitterMs}ms
              </span>
            </div>
          </div>

          {/* Interactive In-Call Control Bar */}
          {isLive && (
            <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mute Button */}
                <button
                  onClick={handleToggleMute}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isMuted
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                {/* Hold Button */}
                <button
                  onClick={handleToggleHold}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isOnHold
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                  }`}
                  title={isOnHold ? 'Resume Call' : 'Place Call on Hold'}
                >
                  {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isOnHold ? 'Resume' : 'Hold'}</span>
                </button>

                {/* Keypad DTMF Trigger */}
                <button
                  onClick={() => setActiveTab('dtmf_pad')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'dtmf_pad'
                      ? 'bg-[#00f2ff]/10 border-[#00f2ff]/50 text-[#00f2ff]'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Keypad</span>
                </button>

                {/* Transfer Trigger */}
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="p-2.5 rounded-lg border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:border-white/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Transfer</span>
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs uppercase tracking-wider font-extrabold rounded-md shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" /> End Call & Log
              </button>
            </div>
          )}

          {/* Dialing / Ringing indicator */}
          {(softphoneState === 'dialing' || softphoneState === 'ringing') && (
            <div className="mt-4 p-3 rounded bg-black/40 border border-amber-500/20 text-xs text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Connecting WebRTC Softphone to carrier route...
              </span>
              <button
                onClick={onCancelCall}
                className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
              >
                Cancel Dial
              </button>
            </div>
          )}
        </div>

        {/* Phase 3 Mid-Call Tabs Selector (Active Call Mode) */}
        {isLive && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setActiveTab('ai_coach')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ai_coach'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" /> Live Mid-Call AI Coach
                {objections.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                    {objections.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('live_transcript')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'live_transcript'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-[#00f2ff]" /> Dual-Channel Live Transcript
                <span className="text-[10px] font-mono text-gray-500">({transcripts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('dtmf_pad')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'dtmf_pad'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5 text-[#00f2ff]" /> DTMF Keypad
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'telemetry'
                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#00f2ff]" /> Network & Compliance
              </button>
            </div>

            {/* TAB 1: Live Mid-Call AI Coaching Assistant */}
            {activeTab === 'ai_coach' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Real-Time Sentiment & Drift Gauge */}
                <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00f2ff]" /> Live Customer Sentiment Drift
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        sentimentScore >= 25
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : sentimentScore <= -20
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      {sentimentScore > 0 ? `+${sentimentScore}% Positive` : `${sentimentScore}% Sentiment`}
                    </span>
                  </div>

                  {/* Dynamic Visual Gradient Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 flex">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(5, Math.min(95, (sentimentScore + 100) / 2))}%`,
                          backgroundColor:
                            sentimentScore >= 20 ? '#10b981' : sentimentScore <= -20 ? '#ef4444' : '#00f2ff'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
                      <span>-100% (High Friction)</span>
                      <span>0% Neutral</span>
                      <span>+100% (High Intent)</span>
                    </div>
                  </div>

                  {/* Talk Ratio & Speaking Pace */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span>Talk-to-Listen Ratio:</span>
                        <span className="font-mono text-white font-bold">{repTalkPct}% Rep / {prospectTalkPct}% Customer</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full flex overflow-hidden">
                        <div style={{ width: `${repTalkPct}%` }} className="bg-[#00f2ff]" />
                        <div style={{ width: `${prospectTalkPct}%` }} className="bg-emerald-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="text-[10px] text-gray-400">Pacing (WPM):</span>
                      <span className="font-mono text-white font-bold">{speakingPaceWpm} WPM</span>
                    </div>
                  </div>
                </div>

                {/* Mid-Call Live Objections & Battlecard Drawer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> Real-time Detected Objections & Battlecards
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {objections.length} Detected
                    </span>
                  </div>

                  {objections.length === 0 ? (
                    <div className="p-4 rounded-lg bg-[#161616] border border-white/5 text-center text-xs text-gray-500">
                      <Sparkles className="w-5 h-5 text-[#00f2ff]/40 mx-auto mb-1 animate-pulse" />
                      No critical objections detected yet. AI is listening to live speech stream...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {objections.map((obj) => (
                        <div
                          key={obj.id}
                          className="p-4 rounded-lg bg-[#161616] border-l-4 border-amber-400 border-white/10 space-y-3 shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                {obj.battleCard.title}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">{obj.timestamp}</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                              {obj.severity} Priority
                            </span>
                          </div>

                          <p className="text-xs text-gray-300 italic bg-black/40 p-2 rounded border border-white/5">
                            "{obj.matchedText}"
                          </p>

                          {/* Tactical Talking Points */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                              Tactical Talking Points:
                            </span>
                            <ul className="space-y-1 text-xs text-gray-200">
                              {obj.battleCard.talkingPoints.map((tp, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-[#00f2ff] font-bold">›</span>
                                  <span>{tp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended Question & Copy */}
                          {obj.battleCard.suggestedQuestions.length > 0 && (
                            <div className="p-2.5 rounded bg-black/50 border border-white/5 flex items-center justify-between gap-3">
                              <span className="text-xs text-[#00f2ff] italic font-mono">
                                {obj.battleCard.suggestedQuestions[0]}
                              </span>
                              <button
                                onClick={() => handleCopyBattleCard(obj.id, obj.battleCard.suggestedQuestions[0])}
                                className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                {copiedBattleCardId === obj.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Detected Topics */}
                <div className="p-3.5 rounded-lg bg-[#161616] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Live Extracted Topics & Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-1 rounded bg-[#121212] text-[#00f2ff] border border-[#00f2ff]/30 font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Live Dual-Channel Transcript */}
            {activeTab === 'live_transcript' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono px-1">
                  <span>Channel 0: Sales Rep ({currentUser.name})</span>
                  <span>Channel 1: Prospect ({lead.name})</span>
                </div>

                <div
                  ref={transcriptScrollRef}
                  className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-lg bg-[#161616] border border-white/5"
                >
                  {transcripts.map((seg) => (
                    <div
                      key={seg.id}
                      className={`flex flex-col ${
                        seg.speaker === 'system'
                          ? 'items-center text-center'
                          : seg.speaker === 'rep'
                          ? 'items-end'
                          : 'items-start'
                      }`}
                    >
                      {seg.speaker === 'system' ? (
                        <div className="p-2 rounded bg-black/50 border border-white/5 text-[10px] text-gray-400 font-mono">
                          {seg.text}
                        </div>
                      ) : (
                        <div className="max-w-[85%] space-y-1">
                          <div
                            className={`flex items-center gap-2 text-[10px] ${
                              seg.speaker === 'rep' ? 'justify-end text-cyan-400' : 'text-emerald-400'
                            }`}
                          >
                            <span className="font-bold">{seg.speakerName}</span>
                            <span className="text-gray-500 font-mono">{seg.timestamp}</span>
                            <span className="text-[9px] text-gray-600 font-mono">
                              ({Math.round(seg.confidence * 100)}% conf)
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-lg text-xs leading-relaxed ${
                              seg.speaker === 'rep'
                                ? 'bg-[#00f2ff]/10 text-gray-100 border border-[#00f2ff]/30 rounded-tr-none'
                                : 'bg-black/60 text-gray-200 border border-white/10 rounded-tl-none'
                            }`}
                          >
                            {seg.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Interactive DTMF Keypad */}
            {activeTab === 'dtmf_pad' && (
              <div className="p-6 rounded-lg bg-[#161616] border border-white/5 space-y-5 animate-fadeIn max-w-sm mx-auto">
                <div className="p-3 rounded bg-black/60 border border-white/10 text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
                    DTMF Tone Output
                  </span>
                  <span className="text-xl font-mono font-bold text-[#00f2ff] tracking-widest min-h-7 block">
                    {dtmfDigits.join(' ') || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDtmfPress(d)}
                      className="p-4 rounded-lg bg-black/40 hover:bg-[#00f2ff]/20 hover:border-[#00f2ff]/50 border border-white/10 text-white font-mono font-bold text-lg transition-all cursor-pointer active:scale-95 shadow-md"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Network Telemetry & Regulatory Compliance */}
            {activeTab === 'telemetry' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#00f2ff]" /> WebRTC Connection Telemetry
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-[10px] text-gray-500 block">Round-Trip Time (RTT)</span>
                      <span className="font-mono text-white font-bold">{webrtcStats.rttMs} ms</span>
                    </div>

                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-[10px] text-gray-500 block">Audio Jitter</span>
                      <span className="font-mono text-white font-bold">{webrtcStats.jitterMs} ms</span>
                    </div>

                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-[10px] text-gray-500 block">Packet Loss Rate</span>
                      <span className="font-mono text-emerald-400 font-bold">{webrtcStats.packetLoss}%</span>
                    </div>

                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-[10px] text-gray-500 block">Audio Codec</span>
                      <span className="font-mono text-gray-200 font-bold">Opus 48kHz Stereo</span>
                    </div>

                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-[10px] text-gray-500 block">ICE Connection</span>
                      <span className="font-mono text-[#00f2ff] font-bold">Completed (Direct UDP)</span>
                    </div>

                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-[10px] text-gray-500 block">Carrier Route</span>
                      <span className="font-mono text-gray-200 font-bold">AWS ap-south-1</span>
                    </div>
                  </div>
                </div>

                {/* S3 Storage & Compliance */}
                <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> S3 Object Storage & Compliance
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      TRAI & GDPR Compliant
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] font-mono">
                    Recording Bucket: <span className="text-[#00f2ff]">{sessionDataRef.current.s3Bucket}</span>
                  </p>
                  <p className="text-gray-400 text-[11px] font-mono">
                    Object Key: <span className="text-gray-300">{sessionDataRef.current.s3Key}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="p-4 rounded-lg bg-black/80 border border-white/20 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Representative for Live Call Transfer:
              </span>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {allSalespeople.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setShowTransferModal(false);
                    alert(`Initiating warm transfer to ${sp.name}...`);
                  }}
                  className="flex items-center justify-between p-2.5 rounded bg-[#161616] hover:bg-[#00f2ff]/10 border border-white/5 text-xs text-left cursor-pointer transition-colors"
                >
                  <span className="font-bold text-white">{sp.name}</span>
                  <span className="text-[10px] text-[#00f2ff] font-mono">Online • Transfer Call</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Call Logging Form (Phase 2 Post-Call View) */}
        {softphoneState === 'disconnected' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Call Status & Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Call Status
                </label>
                <select
                  value={callStatus}
                  onChange={(e) => handleStatusChange(e.target.value as CallStatus)}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                >
                  <option value="Answered">Answered</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Busy">Busy</option>
                  <option value="Failed">Failed / Disconnected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Call Outcome
                </label>
                <select
                  value={callOutcome}
                  onChange={(e) => handleOutcomeChange(e.target.value as CallOutcome)}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                >
                  <option value="Interested">Interested (High Intent)</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Converted">Converted / Deal Won 🚀</option>
                  <option value="Call Later">Call Later (Busy)</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Wrong Number">Wrong Number</option>
                </select>
              </div>
            </div>

            {/* Live Instant AI Call Analysis Breakdown */}
            {aiInsight && (
              <div className="p-4 rounded-lg bg-[#161616] border border-[#00f2ff]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Post-Call AI Intelligence Synthesis
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 font-bold font-mono">
                      Quality Score: {aiInsight.callQualityScore}/100
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                        aiInsight.sentiment === 'Positive'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : aiInsight.sentiment === 'Negative'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      {aiInsight.sentiment} Sentiment
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5 font-mono">
                  {aiInsight.aiSummary}
                </p>

                {aiInsight.keyTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                      Key Topics:
                    </span>
                    {aiInsight.keyTopics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#121212] text-gray-300 border border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversation Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between mb-1.5">
                <span>Call Conversation Notes</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Detailed logs & transcript summary
                </span>
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#161616] border border-white/10 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
                placeholder="Enter key customer feedback, objections, commitments, or specific feature interests discussed..."
              />
            </div>

            {/* Schedule Follow-up Toggle & Sub-form */}
            <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleFollowUp}
                  onChange={(e) => setScheduleFollowUp(e.target.checked)}
                  className="rounded text-[#00f2ff] focus:ring-[#00f2ff] h-4 w-4 bg-[#121212] border-white/10"
                />
                <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-[#00f2ff]" /> Schedule Next Follow-up
                </span>
              </label>

              {scheduleFollowUp && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider">
                        Follow-up Time
                      </label>
                      <input
                        type="time"
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider">
                      Follow-up Agenda / Note
                    </label>
                    <input
                      type="text"
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      placeholder="e.g., Deliver customized proposal review"
                      className="w-full bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-white/5 bg-[#121212] flex items-center justify-between">
        <button
          onClick={onCancelCall}
          className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-md border border-white/5 transition-colors cursor-pointer"
        >
          Discard
        </button>

        {softphoneState === 'disconnected' ? (
          <button
            onClick={handleSaveRecord}
            className="flex items-center gap-2 px-5 py-2 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Save Call & Update Lead
          </button>
        ) : (
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};
