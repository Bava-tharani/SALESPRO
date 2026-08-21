import { BackendDatabase } from '../db';
import {
  SalespersonDailyMetrics,
  SalespersonWeeklyMetrics,
  SalespersonMonthlyMetrics
} from '../../types/database';
import { CallRecord, Lead, FollowUp, User } from '../../types';

export class PerformanceService {
  /**
   * Computes comprehensive metrics for a given salesperson or all salespeople
   */
  public static calculateRepMetrics(
    salespersonId: string,
    timeframe: 'today' | '7days' | '30days' | 'all' = 'today'
  ) {
    const user = BackendDatabase.users.find((u) => u.id === salespersonId);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let calls = BackendDatabase.calls.filter((c) => c.salespersonId === salespersonId);
    let leads = BackendDatabase.leads.filter((l) => l.assignedTo === salespersonId);
    let followUps = BackendDatabase.followUps.filter((f) => f.salespersonId === salespersonId);

    if (timeframe === 'today') {
      calls = calls.filter((c) => c.createdAt.startsWith(todayStr));
      followUps = followUps.filter((f) => f.scheduledDate === todayStr);
    } else if (timeframe === '7days') {
      calls = calls.filter((c) => new Date(c.createdAt) >= sevenDaysAgo);
    } else if (timeframe === '30days') {
      calls = calls.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo);
    }

    const totalCalls = calls.length;
    // Attended calls: Salesperson actually connected and spoke with customer
    const attendedCalls = calls.filter((c) => c.status === 'Answered').length;
    const connectedCalls = attendedCalls;
    const missedCalls = calls.filter((c) => c.status === 'No Answer').length;
    const failedCalls = calls.filter((c) => c.status === 'Failed' || c.status === 'Busy').length;

    // Successful calls: Call outcome is Interested or Converted
    const successfulCalls = calls.filter(
      (c) => c.outcome === 'Interested' || c.outcome === 'Converted'
    ).length;
    const unsuccessfulCalls = attendedCalls - successfulCalls;

    // Success Rate = Successful Calls / Attended Calls * 100
    const successRate =
      attendedCalls > 0 ? Math.round((successfulCalls / attendedCalls) * 100) : 0;

    const conversions = leads.filter((l) => l.status === 'Converted').length;
    const conversionRate =
      leads.length > 0 ? Number(((conversions / leads.length) * 100).toFixed(1)) : 0;

    const totalTalkTime = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
    const averageCallDuration =
      attendedCalls > 0 ? Math.round(totalTalkTime / attendedCalls) : 0;

    const followupsCompleted = followUps.filter((f) => f.status === 'Completed').length;
    const followupsPending = followUps.filter((f) => f.status === 'Pending').length;
    const followupsMissed = followUps.filter((f) => f.status === 'Overdue').length;

    // SalesCall Pro Performance Score (0 - 100)
    // Weighted formula: Success Rate (35%) + Conversion Rate (25%) + Talk Time volume (20%) + Followup completion (20%)
    let performanceScore = 70;
    if (totalCalls > 0 || leads.length > 0) {
      const srPart = (successRate / 100) * 35;
      const crPart = Math.min(25, (conversionRate / 30) * 25);
      const ttPart = Math.min(20, (totalTalkTime / (timeframe === 'today' ? 1800 : 7200)) * 20);
      const fuPart = followupsCompleted + followupsPending > 0
        ? (followupsCompleted / (followupsCompleted + followupsPending + followupsMissed)) * 20
        : 15;
      performanceScore = Math.min(99, Math.max(45, Math.round(srPart + crPart + ttPart + fuPart)));
    }

    return {
      userId: salespersonId,
      userName: user?.name || 'Sales Representative',
      email: user?.email || '',
      role: user?.role || 'salesperson',
      timeframe,
      totalCalls,
      attendedCalls,
      connectedCalls,
      missedCalls,
      failedCalls,
      successfulCalls,
      unsuccessfulCalls,
      successRate,
      conversions,
      conversionRate,
      totalTalkTime,
      averageCallDuration,
      followupsCompleted,
      followupsPending,
      followupsMissed,
      performanceScore,
      assignedLeadsCount: leads.length
    };
  }

  /**
   * Computes organization-wide team metrics
   */
  public static calculateTeamMetrics(timeframe: 'today' | '7days' | '30days' | 'all' = 'today') {
    const salesReps = BackendDatabase.users.filter((u) => u.role === 'salesperson');
    const repStats = salesReps.map((rep) => this.calculateRepMetrics(rep.id, timeframe));

    const totalCalls = repStats.reduce((acc, r) => acc + r.totalCalls, 0);
    const attendedCalls = repStats.reduce((acc, r) => acc + r.attendedCalls, 0);
    const connectedCalls = repStats.reduce((acc, r) => acc + r.connectedCalls, 0);
    const successfulCalls = repStats.reduce((acc, r) => acc + r.successfulCalls, 0);
    const unsuccessfulCalls = repStats.reduce((acc, r) => acc + r.unsuccessfulCalls, 0);
    const successRate =
      attendedCalls > 0 ? Math.round((successfulCalls / attendedCalls) * 100) : 0;
    const conversions = repStats.reduce((acc, r) => acc + r.conversions, 0);
    const totalTalkTime = repStats.reduce((acc, r) => acc + r.totalTalkTime, 0);
    const averageCallDuration =
      attendedCalls > 0 ? Math.round(totalTalkTime / attendedCalls) : 0;
    const followupsCompleted = repStats.reduce((acc, r) => acc + r.followupsCompleted, 0);
    const followupsMissed = repStats.reduce((acc, r) => acc + r.followupsMissed, 0);

    const teamPerformanceScore =
      repStats.length > 0
        ? Math.round(
            repStats.reduce((acc, r) => acc + r.performanceScore, 0) / repStats.length
          )
        : 78;

    return {
      organizationId: BackendDatabase.organization.id,
      organizationName: BackendDatabase.organization.name,
      timeframe,
      totalReps: salesReps.length,
      totalCalls,
      attendedCalls,
      connectedCalls,
      successfulCalls,
      unsuccessfulCalls,
      successRate,
      conversions,
      totalTalkTime,
      averageCallDuration,
      followupsCompleted,
      followupsMissed,
      teamPerformanceScore,
      salespeople: repStats
    };
  }
}
