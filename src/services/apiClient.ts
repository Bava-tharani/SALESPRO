import { User, Lead, CallRecord, FollowUp, NotificationItem, ActivityLog } from '../types';
import { CallAiAnalysis, SalespersonDailyMetrics } from '../types/database';

export class ApiClient {
  private static currentUser: User | null = null;

  public static setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  private static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.currentUser) {
      headers['x-user-id'] = this.currentUser.id;
      headers['x-user-role'] = this.currentUser.role;
      headers['x-user-name'] = this.currentUser.name;
      headers['x-user-email'] = this.currentUser.email;
    }
    return headers;
  }

  // Manager Operations
  public static async getManagerDashboard() {
    const res = await fetch('/api/manager/dashboard', { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async getManagerTeam(timeframe: string = 'today') {
    const res = await fetch(`/api/manager/team?timeframe=${timeframe}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async getManagerTeamRepDetail(salespersonId: string, timeframe: string = '30days') {
    const res = await fetch(`/api/manager/team/${salespersonId}?timeframe=${timeframe}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async getManagerAnalytics(timeframe: string = 'today') {
    const res = await fetch(`/api/manager/analytics?timeframe=${timeframe}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async getLeadRecommendations(leadId: string) {
    const res = await fetch(`/api/manager/leads/recommendation?leadId=${leadId}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async assignLead(leadIds: string[], targetSalespersonId: string) {
    const res = await fetch('/api/manager/leads/assign', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ leadIds, targetSalespersonId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Salesperson Operations
  public static async getSalesDashboard() {
    const res = await fetch('/api/sales/dashboard', { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async getSalesAnalytics(timeframe: string = 'today') {
    const res = await fetch(`/api/sales/analytics?timeframe=${timeframe}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async updateSalespersonStatus(status: 'ONLINE' | 'ON_CALL' | 'OFFLINE', currentActivity?: string, currentLeadName?: string) {
    const res = await fetch('/api/salesperson/status', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, currentActivity, currentLeadName })
    });
    if (!res.ok) return null;
    return res.json();
  }

  // Calls Management
  public static async getCalls() {
    const res = await fetch('/api/calls', { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async getCallDetail(callId: string) {
    const res = await fetch(`/api/calls/${callId}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  public static async logCompletedCall(callData: {
    leadId: string;
    leadName: string;
    leadPhone: string;
    durationSeconds: number;
    status: string;
    outcome: string;
    notes: string;
    transcripts?: any[];
  }) {
    const res = await fetch('/api/calls', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(callData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Real Excel Export
  public static async exportReport(type: 'team' | 'salesperson', salespersonId?: string) {
    const query = new URLSearchParams({ type });
    if (salespersonId) query.set('salespersonId', salespersonId);

    const res = await fetch(`/api/reports/export?${query.toString()}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(err.message || err.error || 'Failed to export report');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SalesCallPro_${type === 'team' ? 'Entire_Team' : 'Salesperson'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
