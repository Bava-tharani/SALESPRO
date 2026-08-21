import { Router, Response } from 'express';
import { BackendDatabase } from '../db';
import { AuthMiddleware, AuthenticatedRequest } from '../auth';
import { RealtimeService } from '../services/realtimeService';
import { AiCallAnalysisService } from '../services/aiCallAnalysisService';
import { PerformanceService } from '../services/performanceService';
import { AssignmentService } from '../services/assignmentService';
import { ReportExportService } from '../services/reportExportService';
import { CallRecord, Lead, FollowUp, User } from '../../types';
import { LiveSalespersonState } from '../../types/database';

export const apiRouter = Router();

// Apply base authentication middleware
apiRouter.use(AuthMiddleware.authenticate);

// -------------------------------------------------------------
// 1. Realtime SSE Stream Endpoint
// -------------------------------------------------------------
apiRouter.get('/realtime/stream', (req: AuthenticatedRequest, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const userId = req.user?.id || 'anonymous';
  const role = req.user?.role || 'salesperson';

  RealtimeService.addClient(clientId, res, userId, role);

  // Send initial connection event
  res.write(
    `data: ${JSON.stringify({
      type: 'CONNECTED',
      userId,
      role,
      timestamp: new Date().toISOString()
    })}\n\n`
  );

  req.on('close', () => {
    RealtimeService.removeClient(clientId);
  });
});

// -------------------------------------------------------------
// 2. Salesperson Live Status Heartbeat & State Updates
// -------------------------------------------------------------
apiRouter.post('/salesperson/status', (req: AuthenticatedRequest, res: Response) => {
  const { status, currentActivity, currentLeadId, currentLeadName, currentCallId } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const prev = BackendDatabase.liveStatus[user.id];

  const updated: LiveSalespersonState = {
    userId: user.id,
    userName: user.name,
    email: user.email,
    status: status || prev?.status || 'ONLINE',
    currentActivity: currentActivity || (status === 'ON_CALL' ? 'On Live Call' : 'Online & Ready'),
    currentLeadId: currentLeadId !== undefined ? currentLeadId : prev?.currentLeadId,
    currentLeadName: currentLeadName !== undefined ? currentLeadName : prev?.currentLeadName,
    currentCallId: currentCallId !== undefined ? currentCallId : prev?.currentCallId,
    callStartedAt: status === 'ON_CALL' ? new Date().toISOString() : undefined,
    lastActivityAt: new Date().toISOString(),
    todayCallsCount: prev?.todayCallsCount || user.callsTodayCount || 0,
    todaySuccessRate: prev?.todaySuccessRate || 72,
    performanceScore: prev?.performanceScore || 85
  };

  BackendDatabase.liveStatus[user.id] = updated;

  // Broadcast realtime event
  RealtimeService.broadcast({
    type: status === 'OFFLINE' ? 'SALESPERSON_OFFLINE' : status === 'ON_CALL' ? 'CALL_STARTED' : 'SALESPERSON_ONLINE',
    userId: user.id,
    userName: user.name,
    data: updated,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, liveStatus: updated });
});

// -------------------------------------------------------------
// 3. Manager Dashboard & Live Operations
// -------------------------------------------------------------
apiRouter.get('/manager/dashboard', AuthMiddleware.requireManager, (req: AuthenticatedRequest, res: Response) => {
  const teamMetrics = PerformanceService.calculateTeamMetrics('today');
  const liveReps = BackendDatabase.users
    .filter((u) => u.role === 'salesperson')
    .map((rep) => {
      const live = BackendDatabase.liveStatus[rep.id] || {
        userId: rep.id,
        status: 'ONLINE',
        currentActivity: 'Available',
        lastActivityAt: new Date().toISOString(),
        todayCallsCount: 0,
        todaySuccessRate: 70
      };
      const repMetrics = PerformanceService.calculateRepMetrics(rep.id, 'today');
      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        phone: rep.phone,
        status: live.status,
        currentActivity: live.currentActivity,
        currentLeadName: live.currentLeadName,
        callStartedAt: live.callStartedAt,
        lastActivityAt: live.lastActivityAt,
        todayCalls: repMetrics.totalCalls,
        attendedCalls: repMetrics.attendedCalls,
        successfulCalls: repMetrics.successfulCalls,
        successRate: repMetrics.successRate,
        conversions: repMetrics.conversions,
        performanceScore: repMetrics.performanceScore
      };
    });

  // Generate real data Executive Summary
  const executiveSummary = [
    `Your sales team completed ${teamMetrics.totalCalls} calls today with a ${teamMetrics.successRate}% overall success rate across ${teamMetrics.attendedCalls} attended discussions.`,
    liveReps.length > 0
      ? `${liveReps.reduce((prev, curr) => (curr.successRate > prev.successRate ? curr : prev)).name} currently leads team performance with a ${liveReps.reduce((prev, curr) => (curr.successRate > prev.successRate ? curr : prev)).successRate}% call success rate.`
      : `All sales representatives are synchronized.`,
    `${BackendDatabase.leads.filter((l) => l.priority === 'High' && l.status === 'New').length} HOT priority leads are currently awaiting first outbound contact.`
  ];

  return res.json({
    organization: BackendDatabase.organization,
    teamMetrics,
    liveTeamActivity: liveReps,
    executiveSummary,
    recentActivityLogs: BackendDatabase.activityLogs.slice(0, 20)
  });
});

// -------------------------------------------------------------
// 4. Manager Team & Salesperson Detail View
// -------------------------------------------------------------
apiRouter.get('/manager/team', AuthMiddleware.requireManager, (req: AuthenticatedRequest, res: Response) => {
  const timeframe = (req.query.timeframe as any) || 'today';
  const teamMetrics = PerformanceService.calculateTeamMetrics(timeframe);
  return res.json(teamMetrics);
});

apiRouter.get('/manager/team/:salespersonId', AuthMiddleware.requireManager, (req: AuthenticatedRequest, res: Response) => {
  const { salespersonId } = req.params;
  const timeframe = (req.query.timeframe as any) || '30days';
  const rep = BackendDatabase.users.find((u) => u.id === salespersonId);
  if (!rep) return res.status(404).json({ error: 'Salesperson not found' });

  const metrics = PerformanceService.calculateRepMetrics(salespersonId, timeframe);
  const repCalls = BackendDatabase.calls.filter((c) => c.salespersonId === salespersonId);
  const repLeads = BackendDatabase.leads.filter((l) => l.assignedTo === salespersonId);
  const repFollowUps = BackendDatabase.followUps.filter((f) => f.salespersonId === salespersonId);

  return res.json({
    salesperson: rep,
    metrics,
    calls: repCalls,
    leads: repLeads,
    followUps: repFollowUps
  });
});

// -------------------------------------------------------------
// 5. Manager Analytics (Daily, Weekly, Monthly)
// -------------------------------------------------------------
apiRouter.get('/manager/analytics', AuthMiddleware.requireManager, (req: AuthenticatedRequest, res: Response) => {
  const timeframe = (req.query.timeframe as 'today' | '7days' | '30days') || 'today';
  const metrics = PerformanceService.calculateTeamMetrics(timeframe);

  // Hourly calls distribution for Daily tab
  const hourlyData = [
    { hour: '09:00 AM', calls: 14, connected: 11, successful: 8, conversions: 1 },
    { hour: '10:00 AM', calls: 28, connected: 22, successful: 17, conversions: 3 },
    { hour: '11:00 AM', calls: 42, connected: 36, successful: 29, conversions: 6 },
    { hour: '12:00 PM', calls: 24, connected: 18, successful: 12, conversions: 2 },
    { hour: '01:00 PM', calls: 16, connected: 11, successful: 7, conversions: 1 },
    { hour: '02:00 PM', calls: 35, connected: 29, successful: 21, conversions: 4 },
    { hour: '03:00 PM', calls: 46, connected: 39, successful: 31, conversions: 7 },
    { hour: '04:00 PM', calls: 30, connected: 23, successful: 16, conversions: 3 },
    { hour: '05:00 PM', calls: 18, connected: 14, successful: 9, conversions: 1 }
  ];

  // 7-Day breakdown for Weekly tab
  const weeklyData = [
    { day: 'Mon', calls: 135, attended: 108, successful: 78, conversions: 12, successRate: 72 },
    { day: 'Tue', calls: 152, attended: 124, successful: 91, conversions: 15, successRate: 73 },
    { day: 'Wed', calls: 168, attended: 139, successful: 104, conversions: 19, successRate: 75 },
    { day: 'Thu', calls: 144, attended: 118, successful: 85, conversions: 14, successRate: 72 },
    { day: 'Fri', calls: 159, attended: 130, successful: 96, conversions: 16, successRate: 74 },
    { day: 'Sat', calls: 45, attended: 32, successful: 21, conversions: 3, successRate: 66 },
    { day: 'Sun', calls: 18, attended: 12, successful: 7, conversions: 1, successRate: 58 }
  ];

  return res.json({
    metrics,
    hourlyData,
    weeklyData
  });
});

// -------------------------------------------------------------
// 6. AI Lead Assignment Recommendation
// -------------------------------------------------------------
apiRouter.get('/manager/leads/recommendation', AuthMiddleware.requireManager, (req: AuthenticatedRequest, res: Response) => {
  const leadId = req.query.leadId as string;
  if (!leadId) return res.status(400).json({ error: 'leadId is required' });

  const result = AssignmentService.getRecommendationsForLead(leadId);
  return res.json(result);
});

apiRouter.post('/manager/leads/assign', AuthMiddleware.requireManager, (req: AuthenticatedRequest, res: Response) => {
  const { leadIds, targetSalespersonId } = req.body;
  if (!leadIds || !targetSalespersonId) {
    return res.status(400).json({ error: 'leadIds and targetSalespersonId are required' });
  }

  const targetRep = BackendDatabase.users.find((u) => u.id === targetSalespersonId);
  if (!targetRep) return res.status(404).json({ error: 'Target salesperson not found' });

  const updatedLeads: Lead[] = [];
  leadIds.forEach((id: string) => {
    const lead = BackendDatabase.leads.find((l) => l.id === id);
    if (lead) {
      lead.assignedTo = targetRep.id;
      lead.assignedToName = targetRep.name;
      lead.updatedAt = new Date().toISOString();
      updatedLeads.push(lead);

      BackendDatabase.logActivity({
        userId: req.user!.id,
        userName: req.user!.name,
        userRole: 'manager',
        action: 'LEAD_ASSIGNED',
        entityType: 'Lead',
        entityId: lead.id,
        entityName: lead.name,
        description: `Manager assigned lead "${lead.name}" to representative ${targetRep.name}.`
      });
    }
  });

  // Broadcast realtime event
  RealtimeService.broadcast({
    type: 'LEAD_ASSIGNED',
    userId: targetRep.id,
    userName: targetRep.name,
    data: { leadIds, targetSalespersonId },
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, updatedLeads });
});

// -------------------------------------------------------------
// 7. Salesperson Personal Dashboard & Personal Analytics
// -------------------------------------------------------------
apiRouter.get('/sales/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const repMetrics = PerformanceService.calculateRepMetrics(user.id, 'today');
  const myLeads = BackendDatabase.leads.filter((l) => l.assignedTo === user.id);
  const myCalls = BackendDatabase.calls.filter((c) => c.salespersonId === user.id);
  const myFollowUps = BackendDatabase.followUps.filter((f) => f.salespersonId === user.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFollowupsToday = myFollowUps.filter(
    (f) => f.scheduledDate === todayStr && f.status === 'Pending'
  );
  const overdueFollowups = myFollowUps.filter((f) => f.status === 'Overdue');

  const dailySummary = [
    `You completed ${repMetrics.totalCalls} calls today with a ${repMetrics.successRate}% connection success rate.`,
    `You converted ${repMetrics.conversions} prospects into closed deals today.`,
    `You have ${pendingFollowupsToday.length} follow-ups scheduled for today (${overdueFollowups.length} overdue).`
  ];

  return res.json({
    metrics: repMetrics,
    leads: myLeads,
    calls: myCalls.slice(0, 15),
    followUps: myFollowUps,
    dailySummary
  });
});

apiRouter.get('/sales/analytics', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const timeframe = (req.query.timeframe as 'today' | '7days' | '30days') || 'today';
  const repMetrics = PerformanceService.calculateRepMetrics(user.id, timeframe);

  // Salesperson's personal hourly activity
  const hourlyData = [
    { hour: '09:00 AM', calls: 2, connected: 2, successful: 1 },
    { hour: '10:00 AM', calls: 4, connected: 3, successful: 2 },
    { hour: '11:00 AM', calls: 6, connected: 5, successful: 4 },
    { hour: '12:00 PM', calls: 3, connected: 2, successful: 1 },
    { hour: '02:00 PM', calls: 5, connected: 4, successful: 3 },
    { hour: '03:00 PM', calls: 7, connected: 6, successful: 5 },
    { hour: '04:00 PM', calls: 4, connected: 3, successful: 2 }
  ];

  const weeklyData = [
    { day: 'Mon', calls: 18, connected: 14, successful: 10, conversions: 2, successRate: 71 },
    { day: 'Tue', calls: 22, connected: 17, successful: 13, conversions: 3, successRate: 76 },
    { day: 'Wed', calls: 25, connected: 20, successful: 15, conversions: 4, successRate: 75 },
    { day: 'Thu', calls: 19, connected: 15, successful: 11, conversions: 2, successRate: 73 },
    { day: 'Fri', calls: 21, connected: 16, successful: 12, conversions: 3, successRate: 75 },
    { day: 'Sat', calls: 6, connected: 4, successful: 2, conversions: 0, successRate: 50 }
  ];

  return res.json({
    metrics: repMetrics,
    hourlyData,
    weeklyData
  });
});

// -------------------------------------------------------------
// 8. Calls Management & Realtime Intelligence Pipeline
// -------------------------------------------------------------
apiRouter.get('/calls', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let calls = BackendDatabase.calls;

  // Authorization: Salesperson only gets their own calls
  if (user.role === 'salesperson') {
    calls = calls.filter((c) => c.salespersonId === user.id);
  }

  return res.json(calls);
});

apiRouter.get('/calls/:callId', (req: AuthenticatedRequest, res: Response) => {
  const { callId } = req.params;
  const user = req.user!;
  const call = BackendDatabase.calls.find((c) => c.id === callId);

  if (!call) return res.status(404).json({ error: 'Call not found' });

  // Authorization check
  if (user.role === 'salesperson' && call.salespersonId !== user.id) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Access Denied: You cannot view calls conducted by other representatives.'
    });
  }

  const recording = BackendDatabase.recordings[callId];
  const transcripts = BackendDatabase.transcripts[callId] || [];
  const aiAnalysis = BackendDatabase.aiAnalyses[callId];

  // Log audit
  BackendDatabase.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'VIEW_CALL_DETAIL',
    resourceType: 'CALL',
    resourceId: callId
  });

  return res.json({
    call,
    recording,
    transcripts,
    aiAnalysis
  });
});

apiRouter.post('/calls', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { leadId, leadName, leadPhone, durationSeconds, status, outcome, notes, transcripts } = req.body;

  const newCall: CallRecord = {
    id: `CALL-${Date.now().toString().slice(-6)}`,
    leadId,
    leadName,
    leadPhone,
    salespersonId: user.id,
    salespersonName: user.name,
    startedAt: new Date(Date.now() - (durationSeconds || 60) * 1000).toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds: durationSeconds || 60,
    status: status || 'Answered',
    outcome: outcome || 'Interested',
    notes: notes || 'Call logged via softphone',
    createdAt: new Date().toISOString()
  };

  BackendDatabase.calls.unshift(newCall);

  // Generate & persist AI Analysis
  const aiAnalysis = await AiCallAnalysisService.analyzeCall({
    callId: newCall.id,
    salespersonId: user.id,
    salespersonName: user.name,
    leadId,
    leadName,
    durationSeconds: newCall.durationSeconds,
    status: newCall.status,
    outcome: newCall.outcome,
    notes: newCall.notes,
    transcripts
  });
  BackendDatabase.aiAnalyses[newCall.id] = aiAnalysis;

  // Create recording stub
  BackendDatabase.recordings[newCall.id] = {
    id: `rec-${newCall.id}`,
    organizationId: BackendDatabase.organization.id,
    callId: newCall.id,
    storagePath: `recordings/2026/08/${newCall.id}.wav`,
    durationSeconds: newCall.durationSeconds,
    audioUrl: `https://actions.google.com/sounds/v1/telecommunications/phone_dial_tone.ogg`,
    audioChannels: 2,
    mimeType: 'audio/wav',
    fileSizeBytes: 1800000,
    createdAt: newCall.createdAt
  };

  // Update lead status if outcome requires it
  const lead = BackendDatabase.leads.find((l) => l.id === leadId);
  if (lead) {
    if (outcome === 'Converted') lead.status = 'Converted';
    else if (outcome === 'Interested') lead.status = 'Interested';
    else if (outcome === 'Follow-up Required') lead.status = 'Follow-up';
    else if (outcome === 'Not Interested') lead.status = 'Not Interested';
    lead.lastContactedAt = newCall.createdAt;
    lead.updatedAt = newCall.createdAt;
  }

  // Update salesperson live state
  BackendDatabase.liveStatus[user.id] = {
    userId: user.id,
    status: 'ONLINE',
    currentActivity: 'Call completed & logged',
    lastActivityAt: new Date().toISOString(),
    todayCallsCount: (BackendDatabase.liveStatus[user.id]?.todayCallsCount || 0) + 1,
    todaySuccessRate: 75
  };

  // Log activity
  BackendDatabase.logActivity({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CALL_ENDED',
    entityType: 'Call',
    entityId: newCall.id,
    entityName: leadName,
    description: `Completed ${newCall.durationSeconds}s call with ${leadName}. Outcome: ${newCall.outcome}`
  });

  // Broadcast realtime event
  RealtimeService.broadcast({
    type: 'CALL_ENDED',
    userId: user.id,
    userName: user.name,
    leadId,
    leadName,
    callId: newCall.id,
    data: { call: newCall, aiAnalysis },
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({
    call: newCall,
    aiAnalysis
  });
});

// -------------------------------------------------------------
// 9. Excel Report Export (With strict role enforcement)
// -------------------------------------------------------------
apiRouter.get('/reports/export', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const targetType = (req.query.type as 'salesperson' | 'team') || 'team';
  const targetId = req.query.salespersonId as string | undefined;

  try {
    const { buffer, filename } = ReportExportService.generateReport({
      targetType: user.role === 'salesperson' ? 'salesperson' : targetType,
      targetId: user.role === 'salesperson' ? user.id : targetId,
      requestingUserRole: user.role,
      requestingUserId: user.id
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Export error' });
  }
});
