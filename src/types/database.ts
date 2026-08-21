import {
  User,
  UserRole,
  Lead,
  CallRecord,
  FollowUp,
  NotificationItem,
  ActivityLog,
  CallStatus,
  CallOutcome,
  LeadPriority,
  LeadStatus,
  LeadSource,
  AiCallInsight,
  AiLeadAnalysis
} from '../types';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: string;
  createdAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  managerId: string;
  createdAt: string;
}

export interface CallRecording {
  id: string;
  organizationId: string;
  callId: string;
  storagePath: string;
  durationSeconds: number;
  audioUrl: string;
  audioChannels: number;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface CallTranscript {
  id: string;
  organizationId: string;
  callId: string;
  speaker: 'SALESPERSON' | 'CUSTOMER' | 'SYSTEM';
  speakerName: string;
  channel: number;
  timestamp: string;
  offsetSeconds: number;
  text: string;
  confidence: number;
  createdAt: string;
}

export interface CallAiAnalysis {
  id: string;
  organizationId: string;
  callId: string;
  salespersonId: string;
  leadId: string;
  summary: string; // Max 2 lines
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentimentTrend: {
    start: 'Positive' | 'Neutral' | 'Negative';
    middle: 'Positive' | 'Neutral' | 'Negative';
    end: 'Positive' | 'Neutral' | 'Negative';
  };
  intent: 'Purchase' | 'Demo' | 'Pricing' | 'Information' | 'Follow-up' | 'Not Interested';
  intentLevel: 'High Intent' | 'Medium Intent' | 'Low Intent';
  outcomeClassification: 'SUCCESSFUL' | 'UNSUCCESSFUL';
  successReason?: string;
  failureReason?: string;
  successReasonAi?: string[];
  failureReasonAi?: string[];
  nextAction: string;
  callQualityScore: number; // 0 - 100
  qualityScoreBreakdown: {
    opening: number; // /20
    discovery: number; // /20
    productExplanation: number; // /20
    objectionHandling: number; // /20
    closing: number; // /20
  };
  confidence: number; // 0 - 100%
  aiModel: string;
  keyTopics: string[];
  customerObjections: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalespersonDailyMetrics {
  id: string;
  organizationId: string;
  salespersonId: string;
  date: string; // YYYY-MM-DD
  totalCalls: number;
  attendedCalls: number;
  connectedCalls: number;
  successfulCalls: number;
  unsuccessfulCalls: number;
  successRate: number; // %
  conversions: number;
  totalTalkTime: number; // seconds
  averageCallDuration: number; // seconds
  followupsCompleted: number;
  followupsMissed: number;
  performanceScore: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface SalespersonWeeklyMetrics {
  id: string;
  organizationId: string;
  salespersonId: string;
  weekStart: string;
  weekEnd: string;
  totalCalls: number;
  attendedCalls: number;
  successfulCalls: number;
  successRate: number;
  conversions: number;
  totalTalkTime: number;
  followupsCompleted: number;
  followupsMissed: number;
  performanceScore: number;
}

export interface SalespersonMonthlyMetrics {
  id: string;
  organizationId: string;
  salespersonId: string;
  month: string; // YYYY-MM
  totalCalls: number;
  attendedCalls: number;
  successfulCalls: number;
  successRate: number;
  conversions: number;
  totalTalkTime: number;
  followupsCompleted: number;
  followupsMissed: number;
  performanceScore: number;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'CALL' | 'RECORDING' | 'AI_ANALYSIS' | 'LEAD' | 'ASSIGNMENT' | 'REPORT' | 'USER';
  resourceId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LiveSalespersonState {
  userId: string;
  userName?: string;
  email?: string;
  status: 'ONLINE' | 'ON_CALL' | 'OFFLINE';
  currentActivity: string;
  currentLeadId?: string;
  currentLeadName?: string;
  currentCallId?: string;
  callStartedAt?: string;
  lastActivityAt: string;
  todayCallsCount: number;
  todaySuccessRate: number;
  performanceScore?: number;
}
