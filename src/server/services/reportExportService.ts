import * as XLSX from 'xlsx';
import { BackendDatabase } from '../db';
import { PerformanceService } from './performanceService';

export class ReportExportService {
  /**
   * Generates a complete XLSX workbook buffer for a salesperson or team
   */
  public static generateReport(params: {
    targetType: 'salesperson' | 'team';
    targetId?: string;
    requestingUserRole: 'manager' | 'salesperson';
    requestingUserId: string;
  }): { buffer: Buffer; filename: string } {
    const { targetType, targetId, requestingUserRole, requestingUserId } = params;

    // Security Check: Salesperson cannot export other reps' reports
    if (requestingUserRole === 'salesperson' && targetId && targetId !== requestingUserId) {
      throw new Error('FORBIDDEN: You are not authorized to export another salesperson\'s data.');
    }

    const wb = XLSX.utils.book_new();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    let targetName = 'Entire_Sales_Team';
    let calls = BackendDatabase.calls;
    let leads = BackendDatabase.leads;
    let followUps = BackendDatabase.followUps;

    if (targetType === 'salesperson' && targetId) {
      const rep = BackendDatabase.users.find((u) => u.id === targetId);
      targetName = (rep?.name || 'Salesperson').replace(/\s+/g, '_');
      calls = calls.filter((c) => c.salespersonId === targetId);
      leads = leads.filter((l) => l.assignedTo === targetId);
      followUps = followUps.filter((f) => f.salespersonId === targetId);
    }

    // 1. Executive Summary Sheet
    const totalCalls = calls.length;
    const answeredCalls = calls.filter((c) => c.status === 'Answered').length;
    const successfulCalls = calls.filter(
      (c) => c.outcome === 'Interested' || c.outcome === 'Converted'
    ).length;
    const convertedDeals = leads.filter((l) => l.status === 'Converted').length;
    const successRate = answeredCalls > 0 ? Math.round((successfulCalls / answeredCalls) * 100) : 0;
    const totalTalkTimeSecs = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

    const summaryData = [
      ['SalesCall Pro Enterprise Report', 'Generated: ' + now.toLocaleString('en-IN')],
      ['Report Scope', targetType === 'team' ? 'Organization-Wide Team' : `Salesperson: ${targetName}`],
      [],
      ['Metric Name', 'Metric Value', 'Notes'],
      ['Total Outbound Calls Logged', totalCalls, 'All dialed attempts'],
      ['Attended / Connected Calls', answeredCalls, 'Spoke with customer (WebRTC)'],
      ['Successful Calls (Interested / Converted)', successfulCalls, 'Positive outcome'],
      ['Unsuccessful Calls', answeredCalls - successfulCalls, 'Lost or disqualified'],
      ['Call Success Rate %', `${successRate}%`, 'Successful / Attended * 100'],
      ['Total Closed Won Deals', convertedDeals, 'Closed contracts'],
      ['Total Talk Time (Seconds)', totalTalkTimeSecs, `${Math.floor(totalTalkTimeSecs / 60)} minutes`],
      ['Total Active Leads Assigned', leads.length, 'Pipeline volume'],
      ['Scheduled Follow-ups', followUps.length, 'Scheduled touchpoints']
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

    // 2. Call History & Outcomes Sheet
    const callRows = [
      [
        'Call ID',
        'Date & Time',
        'Sales Representative',
        'Customer Name',
        'Phone Number',
        'Duration (s)',
        'Status',
        'Outcome',
        'Outcome Reason',
        'Representative Notes'
      ],
      ...calls.map((c) => {
        const ai = BackendDatabase.aiAnalyses[c.id];
        return [
          c.id,
          c.startedAt,
          c.salespersonName,
          c.leadName,
          c.leadPhone,
          c.durationSeconds,
          c.status,
          c.outcome,
          ai?.successReason || ai?.failureReason || c.outcome,
          c.notes || ''
        ];
      })
    ];
    const wsCalls = XLSX.utils.aoa_to_sheet(callRows);
    XLSX.utils.book_append_sheet(wb, wsCalls, 'Call History');

    // 3. AI Summaries & Intelligence Sheet
    const aiRows = [
      [
        'Call ID',
        'Customer Name',
        'AI Summary (2-Line Overview)',
        'Sentiment',
        'Customer Intent',
        'Call Quality Score (/100)',
        'Opening (/20)',
        'Discovery (/20)',
        'Product Explanation (/20)',
        'Objection Handling (/20)',
        'Closing (/20)',
        'AI Success Reason',
        'AI Failure Reason',
        'Next Recommended Action',
        'AI Confidence'
      ],
      ...calls.map((c) => {
        const ai = BackendDatabase.aiAnalyses[c.id];
        return [
          c.id,
          c.leadName,
          ai?.summary || 'AI Analysis pending',
          ai?.sentiment || 'Neutral',
          ai?.intent || 'Information',
          ai?.callQualityScore || 70,
          ai?.qualityScoreBreakdown?.opening || 14,
          ai?.qualityScoreBreakdown?.discovery || 14,
          ai?.qualityScoreBreakdown?.productExplanation || 14,
          ai?.qualityScoreBreakdown?.objectionHandling || 14,
          ai?.qualityScoreBreakdown?.closing || 14,
          ai?.successReason || '',
          ai?.failureReason || '',
          ai?.nextAction || '',
          `${ai?.confidence || 90}%`
        ];
      })
    ];
    const wsAi = XLSX.utils.aoa_to_sheet(aiRows);
    XLSX.utils.book_append_sheet(wb, wsAi, 'AI Call Insights');

    // 4. Follow-ups Sheet
    const fuRows = [
      ['Follow-up ID', 'Customer Name', 'Phone', 'Assigned Rep', 'Scheduled Date', 'Time', 'Status', 'Priority', 'Notes'],
      ...followUps.map((f) => [
        f.id,
        f.leadName,
        f.leadPhone,
        f.salespersonName,
        f.scheduledDate,
        f.scheduledTime,
        f.status,
        f.priority || 'Medium',
        f.notes || ''
      ])
    ];
    const wsFu = XLSX.utils.aoa_to_sheet(fuRows);
    XLSX.utils.book_append_sheet(wb, wsFu, 'Follow-ups');

    const filename = `SalesCallPro_${targetName}_${dateStr}.xlsx`;
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Log export audit
    BackendDatabase.logAudit({
      userId: requestingUserId,
      userName: targetName,
      userRole: requestingUserRole,
      action: 'EXPORT_EXCEL_REPORT',
      resourceType: 'REPORT',
      resourceId: filename,
      metadata: { targetType, targetId, rowCount: calls.length }
    });

    return { buffer, filename };
  }
}
