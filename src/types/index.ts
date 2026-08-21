export type UserRole = 'manager' | 'salesperson';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  assignedLeadsCount?: number;
  callsTodayCount?: number;
  conversionsCount?: number;
  joinedDate: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Follow-up'
  | 'Converted'
  | 'Not Interested'
  | 'Lost';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export type LeadSource =
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'Referral'
  | 'Advertisement'
  | 'Manual Entry'
  | 'CSV Import';

export interface AiScoreFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  scoreDelta: number;
  detail: string;
}

export interface AiLeadAnalysis {
  score: number; // 0 - 100
  confidence: number; // 0 - 100%
  conversionProbability: number; // 0 - 100%
  recommendedAction: string;
  bestTimeToCall: string;
  buyingIntent: 'Very High' | 'High' | 'Moderate' | 'Low';
  positiveFactors: AiScoreFactor[];
  negativeFactors: AiScoreFactor[];
  summary: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: LeadSource;
  priority: LeadPriority;
  status: LeadStatus;
  assignedTo: string; // User ID
  assignedToName?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  city?: string;
  estimatedDealValue?: number; // In INR (₹)
  aiAnalysis?: AiLeadAnalysis;
}

export type CallStatus = 'Answered' | 'No Answer' | 'Busy' | 'Failed';

export type CallOutcome =
  | 'Interested'
  | 'Not Interested'
  | 'Follow-up Required'
  | 'Converted'
  | 'Wrong Number'
  | 'Call Later';

export interface AiCallInsight {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  interestScore: number; // 1 - 10
  callQualityScore: number; // 0 - 100
  keyTopics: string[];
  customerObjections: string[];
  aiSummary: string;
  smartFollowUpSuggestion?: {
    recommendedDate: string;
    recommendedTime: string;
    agenda: string;
  };
}

export interface CallRecord {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  salespersonId: string;
  salespersonName: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  status: CallStatus;
  outcome: CallOutcome;
  notes: string;
  createdAt: string;
  aiInsight?: AiCallInsight;
  // Phase 3 Telephony & Real-Time Intelligence Extensions
  telephonySession?: TelephonySession;
  realTimeInsights?: RealTimeInsights;
}

// -------------------------------------------------------------
// Phase 3 Telephony & Real-Time Intelligence Types
// -------------------------------------------------------------

export type TelephonyProviderType = 'webrtc' | 'twilio' | 'plivo' | 'agora' | 'sip';

export type CallDirection = 'inbound' | 'outbound';

export type SoftphoneState =
  | 'unregistered'
  | 'registering'
  | 'ready'
  | 'dialing'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'on_hold'
  | 'transferring'
  | 'disconnected'
  | 'failed';

export interface WebRtcStats {
  packetLoss: number; // 0 - 100%
  jitterMs: number; // ms
  rttMs: number; // latency ms
  audioBitrateKbps: number;
  codec: string;
  iceState: 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';
  audioLevelDb: number;
}

export interface TranscriptSegment {
  id: string;
  speaker: 'rep' | 'prospect' | 'system';
  speakerName: string;
  channel: 0 | 1; // 0: Salesperson Rep, 1: Prospect Customer
  text: string;
  timestamp: string;
  offsetSeconds: number;
  confidence: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  isFinal: boolean;
}

export type ObjectionCategory =
  | 'pricing'
  | 'competitor'
  | 'timing'
  | 'trust'
  | 'authority'
  | 'feature';

export interface BattleCard {
  title: string;
  prompt: string;
  talkingPoints: string[];
  suggestedQuestions: string[];
  recommendedOffer?: string;
}

export interface LiveObjection {
  id: string;
  timestamp: string;
  offsetSeconds: number;
  objectionType: ObjectionCategory;
  matchedText: string;
  severity: 'high' | 'medium' | 'low';
  battleCard: BattleCard;
  isAddressed: boolean;
}

export interface SentimentPoint {
  timeOffset: number; // seconds from start
  sentimentScore: number; // -1.0 to 1.0
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative';
  triggerText?: string;
}

export interface LiveCoachingAlert {
  id: string;
  message: string;
  type: 'pacing' | 'talk_ratio' | 'sentiment_drop' | 'action_reminder' | 'positive_cue';
  timestamp: string;
}

export interface RealTimeInsights {
  transcripts: TranscriptSegment[];
  objectionsDetected: LiveObjection[];
  sentimentTimeline: SentimentPoint[];
  currentSentimentScore: number; // -100 to 100
  liveTopics: string[];
  repTalkPercentage: number; // 0 - 100
  prospectTalkPercentage: number; // 0 - 100
  speakingPaceWpm: number;
  liveCoachingAlerts: LiveCoachingAlert[];
}

export interface CallTransferEvent {
  type: 'warm' | 'cold';
  fromUserId: string;
  toUserId: string;
  toUserName: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress';
}

export interface ConferenceParticipant {
  id: string;
  name: string;
  role: string;
  phone?: string;
  joinedAt: string;
  isMuted?: boolean;
  status: 'active' | 'dropped';
}

export type ComplianceJurisdiction =
  | 'US-Two-Party'
  | 'US-One-Party'
  | 'EU-GDPR'
  | 'IN-TRAI';

export interface TelephonySession {
  sessionSid: string;
  direction: CallDirection;
  provider: TelephonyProviderType;
  callerId: string;
  destinationNumber: string;
  trunkName: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  s3Bucket?: string;
  s3Key?: string;
  audioChannels: 1 | 2;
  sttVendor: 'deepgram' | 'openai' | 'assemblyai' | 'browser_webspeech';
  consentStatus: 'obtained' | 'declined' | 'not_required' | 'exempt';
  complianceJurisdiction: ComplianceJurisdiction;
  webrtcStats?: WebRtcStats;
  transfers?: CallTransferEvent[];
  conferenceParticipants?: ConferenceParticipant[];
  dtmfLogs?: string[];
}

export interface TelephonyConfig {
  defaultProvider: TelephonyProviderType;
  primaryTrunk: string;
  callerId: string;
  sttVendor: 'deepgram' | 'openai' | 'assemblyai' | 'browser_webspeech';
  dualChannelAudio: boolean;
  autoConsentDisclaimer: boolean;
  jurisdiction: ComplianceJurisdiction;
  s3RecordingBucket: string;
  dtmfToneAudio: boolean;
  holdMusicAudio: boolean;
  micNoiseSuppression: boolean;
  echoCancellation: boolean;
}

export type FollowUpStatus = 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';

export type FollowUpReminder =
  | 'At time of follow-up'
  | '15 minutes before'
  | '30 minutes before'
  | '1 hour before'
  | '1 day before';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  salespersonId: string;
  salespersonName: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  reminder: FollowUpReminder;
  status: FollowUpStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  priority?: LeadPriority;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lead_assigned' | 'followup_due' | 'overdue_alert' | 'call_logged' | 'conversion' | 'system';
  read: boolean;
  createdAt: string;
  linkId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'Lead' | 'Call' | 'FollowUp' | 'User';
  entityId: string;
  entityName?: string;
  description: string;
  createdAt: string;
}
