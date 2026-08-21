import {
  Organization,
  Team,
  CallRecording,
  CallTranscript,
  CallAiAnalysis,
  SalespersonDailyMetrics,
  SalespersonWeeklyMetrics,
  SalespersonMonthlyMetrics,
  AuditLog,
  LiveSalespersonState
} from '../types/database';
import {
  User,
  Lead,
  CallRecord,
  FollowUp,
  NotificationItem,
  ActivityLog,
  UserRole,
  CallOutcome,
  CallStatus,
  LeadPriority,
  LeadStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_LEADS,
  INITIAL_CALLS,
  INITIAL_FOLLOW_UPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS
} from '../data/mockData';

// Persistent In-Memory & Storage Database
export class BackendDatabase {
  public static organization: Organization = {
    id: 'org-salescall-pro',
    name: 'SalesCall Enterprise Cloud Inc.',
    domain: 'salescallpro.ai',
    plan: 'Enterprise Pro Tier',
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  public static users: User[] = [...INITIAL_USERS];
  public static leads: Lead[] = [...INITIAL_LEADS];
  public static calls: CallRecord[] = [...INITIAL_CALLS];
  public static followUps: FollowUp[] = [...INITIAL_FOLLOW_UPS];
  public static notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  public static activityLogs: ActivityLog[] = [...INITIAL_ACTIVITY_LOGS];
  public static auditLogs: AuditLog[] = [];
  public static recordings: Record<string, CallRecording> = {};
  public static transcripts: Record<string, CallTranscript[]> = {};
  public static aiAnalyses: Record<string, CallAiAnalysis> = {};

  // Live sales reps status tracking
  public static liveStatus: Record<string, LiveSalespersonState> = {};

  private static initialized = false;

  public static initialize() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed recordings & transcripts for existing calls
    this.calls.forEach((c) => {
      // Create recording metadata
      this.recordings[c.id] = {
        id: `rec-${c.id}`,
        organizationId: this.organization.id,
        callId: c.id,
        storagePath: `recordings/2026/08/${c.id}.wav`,
        durationSeconds: c.durationSeconds || 140,
        audioUrl: `https://actions.google.com/sounds/v1/telecommunications/phone_dial_tone.ogg`,
        audioChannels: 2,
        mimeType: 'audio/wav',
        fileSizeBytes: 2450000,
        createdAt: c.createdAt
      };

      // Seed transcript
      const isSuccessful = c.outcome === 'Interested' || c.outcome === 'Converted';
      this.transcripts[c.id] = [
        {
          id: `tr-${c.id}-1`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: 'SALESPERSON',
          speakerName: c.salespersonName,
          channel: 0,
          timestamp: '00:05',
          offsetSeconds: 5,
          text: `Hello ${c.leadName}, this is ${c.salespersonName} from SalesCall Pro. I saw your request regarding cloud telephony and CRM integration.`,
          confidence: 0.98,
          createdAt: c.createdAt
        },
        {
          id: `tr-${c.id}-2`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: 'CUSTOMER',
          speakerName: c.leadName,
          channel: 1,
          timestamp: '00:18',
          offsetSeconds: 18,
          text: isSuccessful
            ? `Hi ${c.salespersonName}! Yes, our team is currently upgrading 45 sales reps and we require real-time AI battlecards and automated call summaries.`
            : `Hello. We already evaluated our budget and decided to stay with our current phone system for this quarter.`,
          confidence: 0.96,
          createdAt: c.createdAt
        },
        {
          id: `tr-${c.id}-3`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: 'SALESPERSON',
          speakerName: c.salespersonName,
          channel: 0,
          timestamp: '00:42',
          offsetSeconds: 42,
          text: isSuccessful
            ? `That is exactly what we specialize in. We can have your entire outbound team provisioned in less than 24 hours with zero hardware required.`
            : `Understood. May I send you a 1-page comparison sheet in case your volume needs expand next quarter?`,
          confidence: 0.99,
          createdAt: c.createdAt
        },
        {
          id: `tr-${c.id}-4`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: 'CUSTOMER',
          speakerName: c.leadName,
          channel: 1,
          timestamp: '01:15',
          offsetSeconds: 75,
          text: isSuccessful
            ? `That sounds very promising. Please schedule a tailored live demo for our operations team tomorrow at 11 AM.`
            : `Sure, you can email that over. Thank you.`,
          confidence: 0.97,
          createdAt: c.createdAt
        }
      ];

      // Seed AI Analysis
      const isSuccess = c.outcome === 'Interested' || c.outcome === 'Converted';
      this.aiAnalyses[c.id] = {
        id: `ai-${c.id}`,
        organizationId: this.organization.id,
        callId: c.id,
        salespersonId: c.salespersonId,
        leadId: c.leadId,
        summary: isSuccess
          ? `Customer showed strong interest in the 45-seat telephony upgrade and requested a tailored live demo.\nNext step: Follow up tomorrow at 11:00 AM to present the technical architecture.`
          : `Customer indicated budget allocation was locked with their current provider for this quarter.\nNext step: Send quarterly comparison sheet and re-engage in 90 days.`,
        sentiment: isSuccess ? 'Positive' : 'Neutral',
        sentimentTrend: {
          start: 'Neutral',
          middle: isSuccess ? 'Positive' : 'Neutral',
          end: isSuccess ? 'Positive' : 'Negative'
        },
        intent: isSuccess ? 'Demo' : 'Not Interested',
        intentLevel: isSuccess ? 'High Intent' : 'Low Intent',
        outcomeClassification: isSuccess ? 'SUCCESSFUL' : 'UNSUCCESSFUL',
        successReason: isSuccess ? 'Customer agreed to product demo for 45 reps' : undefined,
        failureReason: !isSuccess ? 'Budget locked with existing provider for current quarter' : undefined,
        successReasonAi: isSuccess
          ? [
              'Customer showed strong interest in real-time AI battlecards',
              'Fast 24-hour provisioning timeline addressed their migration concerns',
              'Clear decision-maker demo scheduled'
            ]
          : undefined,
        failureReasonAi: !isSuccess
          ? [
              'Budgetary constraints for current fiscal quarter',
              'Incumbent contract active for 6 more months'
            ]
          : undefined,
        nextAction: isSuccess
          ? 'Send calendar invitation for live demo tomorrow at 11:00 AM.'
          : 'Enroll prospect into 90-day automated educational drip campaign.',
        callQualityScore: isSuccess ? 88 : 64,
        qualityScoreBreakdown: {
          opening: isSuccess ? 19 : 15,
          discovery: isSuccess ? 18 : 12,
          productExplanation: isSuccess ? 18 : 13,
          objectionHandling: isSuccess ? 16 : 11,
          closing: isSuccess ? 17 : 13
        },
        confidence: 92,
        aiModel: 'Gemini 2.5 Flash Telephony Analytics',
        keyTopics: isSuccess
          ? ['Cloud Telephony', 'AI Battlecards', 'CRM Sync', 'Seat Licensing']
          : ['Budget Constraints', 'Contract Duration', 'Follow-up Timeline'],
        customerObjections: isSuccess
          ? ['Migration complexity from legacy PBX']
          : ['No budget this quarter', 'Contract active with competitor'],
        createdAt: c.createdAt,
        updatedAt: c.createdAt
      };
    });

    // Seed live status for salespeople
    const salesReps = this.users.filter((u) => u.role === 'salesperson');
    salesReps.forEach((rep, idx) => {
      const statuses: Array<'ONLINE' | 'ON_CALL' | 'OFFLINE'> = ['ONLINE', 'ON_CALL', 'ONLINE', 'ONLINE', 'OFFLINE'];
      const currentStatus = statuses[idx % statuses.length];
      const repCalls = this.calls.filter((c) => c.salespersonId === rep.id);
      const successfulCalls = repCalls.filter(
        (c) => c.outcome === 'Interested' || c.outcome === 'Converted'
      ).length;
      const successRate =
        repCalls.length > 0 ? Math.round((successfulCalls / repCalls.length) * 100) : 70;

      this.liveStatus[rep.id] = {
        userId: rep.id,
        status: currentStatus,
        currentActivity:
          currentStatus === 'ON_CALL'
            ? 'Dialing outbound prospect'
            : currentStatus === 'ONLINE'
            ? 'Reviewing lead queue & AI battlecards'
            : 'Away from workstation',
        currentLeadId: currentStatus === 'ON_CALL' ? 'LEAD-1001' : undefined,
        currentLeadName: currentStatus === 'ON_CALL' ? 'Raj Kumar (Apex Tech)' : undefined,
        callStartedAt:
          currentStatus === 'ON_CALL'
            ? new Date(Date.now() - 4 * 60 * 1000 - 32 * 1000).toISOString()
            : undefined,
        lastActivityAt: new Date(Date.now() - (idx + 1) * 45 * 1000).toISOString(),
        todayCallsCount: rep.callsTodayCount || repCalls.length || 12,
        todaySuccessRate: successRate
      };
    });

    // Seed initial audit log entries
    this.logAudit({
      userId: 'usr-thara',
      userName: 'Thara Maps',
      userRole: 'manager',
      action: 'SYSTEM_INITIALIZATION',
      resourceType: 'USER',
      resourceId: 'org-salescall-pro',
      metadata: { note: 'Organization database securely booted.' }
    });
  }

  // Audit Logging
  public static logAudit(params: {
    userId: string;
    userName: string;
    userRole: UserRole;
    action: string;
    resourceType: AuditLog['resourceType'];
    resourceId: string;
    metadata?: Record<string, any>;
  }) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organizationId: this.organization.id,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata,
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    return log;
  }

  // Activity Logging
  public static logActivity(params: {
    userId: string;
    userName: string;
    userRole: UserRole;
    action: string;
    entityType: ActivityLog['entityType'];
    entityId: string;
    entityName?: string;
    description: string;
  }) {
    const activity: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description,
      createdAt: new Date().toISOString()
    };
    this.activityLogs.unshift(activity);
    if (this.activityLogs.length > 300) {
      this.activityLogs = this.activityLogs.slice(0, 300);
    }
    return activity;
  }
}

// Auto-run initialization
BackendDatabase.initialize();
