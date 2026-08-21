import React, { useState } from 'react';
import { Lead, CallRecord, FollowUp, User, ActivityLog } from '../types';
import {
  Users,
  PhoneCall,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  UserCheck,
  PhoneForwarded,
  Layers
} from 'lucide-react';

interface Props {
  leads: Lead[];
  calls: CallRecord[];
  followUps: FollowUp[];
  salespeople: User[];
  activityLogs: ActivityLog[];
  onOpenLeadDetail: (lead: Lead) => void;
  onOpenAssignModal: (leads: Lead[]) => void;
  onNavigateTab: (tab: any) => void;
}

export const ManagerDashboard: React.FC<Props> = ({
  leads,
  calls,
  followUps,
  salespeople,
  activityLogs,
  onOpenLeadDetail,
  onOpenAssignModal,
  onNavigateTab
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days'>('7days');

  // Calculated Real-Time Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const interestedLeads = leads.filter((l) => l.status === 'Interested').length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  const todayStr = new Date().toISOString().split('T')[0];
  const callsToday = calls.filter((c) => c.createdAt.startsWith(todayStr)).length;
  const completedCalls = calls.filter((c) => c.status === 'Answered').length;

  const followUpsToday = followUps.filter(
    (f) => f.scheduledDate === todayStr && f.status === 'Pending'
  ).length;
  const overdueFollowUps = followUps.filter((f) => f.status === 'Overdue').length;

  // Pipeline total value calculation
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedDealValue || 250000), 0);

  // Status Distribution
  const statusCounts = {
    New: leads.filter((l) => l.status === 'New').length,
    Contacted: leads.filter((l) => l.status === 'Contacted').length,
    Interested: leads.filter((l) => l.status === 'Interested').length,
    'Follow-up': leads.filter((l) => l.status === 'Follow-up').length,
    Converted: leads.filter((l) => l.status === 'Converted').length,
    'Not Interested': leads.filter((l) => l.status === 'Not Interested').length,
    Lost: leads.filter((l) => l.status === 'Lost').length
  };

  // High AI Score Hot Prospects
  const highIntentLeads = [...leads]
    .sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0))
    .slice(0, 5);

  const avgAiScore = (leads.reduce((acc, l) => acc + (l.aiAnalysis?.score || 60), 0) / (leads.length || 1)).toFixed(1);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Manager Executive Dashboard
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 uppercase tracking-wider">
              Live Operations
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time pipeline metrics, team velocity, call performance, and AI conversion intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('leads')}
            className="px-3.5 py-1.5 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Manage Leads ({totalLeads})
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3.5 py-1.5 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] cursor-pointer"
          >
            Full Analytics Report
          </button>
        </div>
      </div>

      {/* Overdue Warning Alert Banner if any */}
      {overdueFollowUps > 0 && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">
                Action Required: {overdueFollowUps} Overdue Follow-up{overdueFollowUps > 1 ? 's' : ''} Detected
              </div>
              <p className="text-[11px] text-gray-400">
                Leads may cool down. Prompt assigned salespeople to complete scheduled outreaches immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('followups')}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
          >
            Review Overdue Follow-ups →
          </button>
        </div>
      )}

      {/* Primary KPI Grid (Matching Design Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline */}
        <div className="bg-[#121212] border-t-2 border-[#00f2ff] p-4 rounded-lg border-x border-b border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Total Pipeline</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
              ₹{(totalPipelineValue / 10000000).toFixed(2)}Cr
            </h2>
            <span className="text-[10px] text-[#00f2ff] font-semibold">+14.2%</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">{totalLeads} total enterprise leads</div>
        </div>

        {/* Calls Today */}
        <div className="bg-[#121212] border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Calls Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white tracking-tight font-mono">{callsToday}</h2>
            <span className="text-[10px] text-gray-500 font-mono">/ 50 target</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">{completedCalls} calls completed successfully</div>
        </div>

        {/* Avg AI Score */}
        <div className="bg-[#121212] border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Avg AI Score</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-[#00f2ff] tracking-tight font-mono">{avgAiScore}</h2>
            <span className="text-[10px] text-gray-500">High Propensity</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Algorithmic probability ranking</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[#121212] border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Conv. Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white tracking-tight font-mono">{conversionRate}%</h2>
            <span className="text-[10px] text-[#00f2ff] font-semibold">Top 5%</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">{convertedLeads} won out of {totalLeads} leads</div>
        </div>
      </div>

      {/* Secondary Quick Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/5 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">New Leads</div>
            <div className="text-lg font-bold text-[#00f2ff] font-mono mt-0.5">{newLeads}</div>
          </div>
          <Sparkles className="w-4 h-4 text-[#00f2ff]" />
        </div>

        <div className="bg-[#121212] border border-white/5 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Interested</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{interestedLeads}</div>
          </div>
          <Flame className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="bg-[#121212] border border-white/5 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Due Today</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{followUpsToday}</div>
          </div>
          <CalendarCheck className="w-4 h-4 text-amber-400" />
        </div>

        <div className="bg-[#121212] border border-white/5 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Sales Reps</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{salespeople.length}</div>
          </div>
          <Users className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Visual Charts & Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads by Status Funnel */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Pipeline Stage Distribution</h2>
              <p className="text-[10px] text-gray-500">Active leads across stages</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              const barColors: Record<string, string> = {
                New: 'bg-blue-500',
                Contacted: 'bg-purple-500',
                Interested: 'bg-[#00f2ff] shadow-[0_0_5px_#00f2ff]',
                'Follow-up': 'bg-amber-500',
                Converted: 'bg-emerald-500 shadow-[0_0_5px_#10b981]',
                'Not Interested': 'bg-gray-600',
                Lost: 'bg-red-500'
              };

              return (
                <div key={status} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-gray-300">{status}</span>
                    <span className="font-mono text-gray-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#161616] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColors[status] || 'bg-[#00f2ff]'} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salesperson Performance Comparison Matrix */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Sales Team Productivity</h2>
              <p className="text-[10px] text-gray-500">Workload distribution, logged calls, and win rates</p>
            </div>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs text-[#00f2ff] hover:underline font-semibold cursor-pointer"
            >
              Manage Team →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/20 text-gray-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Sales Representative</th>
                  <th className="p-3 text-center">Active Leads</th>
                  <th className="p-3 text-center">Calls Logged</th>
                  <th className="p-3 text-center">Conversions</th>
                  <th className="p-3 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {salespeople.map((sp) => {
                  const spLeads = leads.filter((l) => l.assignedTo === sp.id);
                  const spCalls = calls.filter((c) => c.salespersonId === sp.id);
                  const spConverted = spLeads.filter((l) => l.status === 'Converted').length;
                  const winRate = spLeads.length > 0 ? Math.round((spConverted / spLeads.length) * 100) : 0;

                  return (
                    <tr key={sp.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] flex items-center justify-center font-bold text-xs">
                            {sp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{sp.name}</div>
                            <div className="text-[10px] text-gray-500">{sp.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-gray-300 font-semibold">
                        {spLeads.length}
                      </td>
                      <td className="p-3 text-center font-mono text-[#00f2ff] font-semibold">
                        {spCalls.length || sp.callsTodayCount || 8}
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-400 font-bold">
                        {spConverted}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#00f2ff]">
                        {winRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Hot Opportunities & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI High-Intent Leads */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#00f2ff] flex items-center justify-center">
                <span className="text-[10px] text-black font-black">AI</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top High-Probability Opportunities</h2>
                <p className="text-[10px] text-gray-500">Ranked by predictive buying intent & engagement signals</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {highIntentLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onOpenLeadDetail(lead)}
                className="p-3 rounded-lg bg-[#161616] border border-white/5 hover:border-[#00f2ff]/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex flex-col items-center justify-center text-[#00f2ff]">
                    <span className="text-sm font-black font-mono">{lead.aiAnalysis?.score || 75}</span>
                    <span className="text-[7px] uppercase font-bold tracking-tighter">AI Score</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs group-hover:text-[#00f2ff] transition-colors">
                        {lead.name}
                      </span>
                      <span className="text-[10px] text-gray-500">• {lead.company}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 italic">
                      "{lead.aiAnalysis?.recommendedAction || lead.notes}"
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-white font-mono">
                    ₹{lead.estimatedDealValue ? lead.estimatedDealValue.toLocaleString('en-IN') : '3,50,000'}
                  </div>
                  <span className="text-[10px] text-gray-500">
                    Rep: <strong className="text-gray-300">{lead.assignedToName}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Activity Feed */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00f2ff]" /> Recent Activity
            </h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto divide-y divide-white/5">
            {activityLogs.map((log) => (
              <div key={log.id} className="pt-2.5 first:pt-0 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-200">{log.userName}</span>
                  <span className="text-gray-500 font-mono text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">{log.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

