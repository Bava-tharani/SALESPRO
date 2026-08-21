import React from 'react';
import { Lead, CallRecord, FollowUp, User } from '../types';
import {
  PhoneCall,
  Flame,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  PhoneForwarded,
  Clock,
  CheckCircle2,
  Building2,
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  currentUser: User;
  leads: Lead[];
  calls: CallRecord[];
  followUps: FollowUp[];
  onStartCall: (lead: Lead) => void;
  onOpenLeadDetail: (lead: Lead) => void;
  onOpenScheduleFollowUp: (lead: Lead) => void;
  onNavigateTab: (tab: any) => void;
}

export const SalespersonDashboard: React.FC<Props> = ({
  currentUser,
  leads,
  calls,
  followUps,
  onStartCall,
  onOpenLeadDetail,
  onOpenScheduleFollowUp,
  onNavigateTab
}) => {
  // Filter for logged-in salesperson only
  const myLeads = leads.filter((l) => l.assignedTo === currentUser.id);
  const myCalls = calls.filter((c) => c.salespersonId === currentUser.id);
  const myFollowUps = followUps.filter((f) => f.salespersonId === currentUser.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const myCallsToday = myCalls.filter((c) => c.createdAt.startsWith(todayStr)).length;
  const myCompletedCalls = myCalls.filter((c) => c.status === 'Answered').length;
  const myInterestedLeads = myLeads.filter((l) => l.status === 'Interested').length;
  const myConvertedLeads = myLeads.filter((l) => l.status === 'Converted').length;

  const myFollowUpsToday = myFollowUps.filter(
    (f) => f.scheduledDate === todayStr && f.status === 'Pending'
  );
  const myOverdueFollowUps = myFollowUps.filter((f) => f.status === 'Overdue');

  const answerRate =
    myCalls.length > 0 ? Math.round((myCompletedCalls / myCalls.length) * 100) : 78;
  const conversionRate =
    myLeads.length > 0 ? ((myConvertedLeads / myLeads.length) * 100).toFixed(1) : '0.0';

  // AI Recommended Leads to Call Next (Highest AI Score not yet converted)
  const aiRecommendedToCall = [...myLeads]
    .filter((l) => l.status !== 'Converted' && l.status !== 'Lost')
    .sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0))
    .slice(0, 4);

  const priorityLeads = myLeads.filter((l) => l.priority === 'High' && l.status !== 'Converted');

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 uppercase tracking-wider">
              Rep Calling Desk
            </span>
            <span className="text-xs text-gray-500">Live Agent Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {currentUser.name}’s Calling Desk
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            You have <strong className="text-[#00f2ff]">{myLeads.length} active leads</strong> and{' '}
            <strong className="text-amber-400">{myFollowUpsToday.length} follow-ups scheduled today</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('leads')}
            className="px-3.5 py-1.5 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" /> START CALLING QUEUE
          </button>
        </div>
      </div>

      {/* Overdue Alert */}
      {myOverdueFollowUps.length > 0 && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">
                You have {myOverdueFollowUps.length} Overdue Follow-up{myOverdueFollowUps.length > 1 ? 's' : ''}
              </div>
              <p className="text-[11px] text-gray-400">
                Outreach pending for {myOverdueFollowUps.map((f) => f.leadName).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('followups')}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
          >
            Call Overdue Leads →
          </button>
        </div>
      )}

      {/* Salesperson Personal KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border-t-2 border-[#00f2ff] p-4 rounded-lg border-x border-b border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Assigned Leads</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white tracking-tight font-mono">{myLeads.length}</h2>
            <span className="text-[10px] text-[#00f2ff] font-semibold">{priorityLeads.length} high priority</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Directly allocated to you</div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-4 rounded-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Calls Made</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white tracking-tight font-mono">{myCallsToday || myCalls.length}</h2>
            <span className="text-[10px] text-gray-500 font-mono">/ 25 daily</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">{answerRate}% answer connection rate</div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-4 rounded-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Due Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-amber-400 tracking-tight font-mono">{myFollowUpsToday.length}</h2>
            <span className="text-[10px] text-gray-500">{myOverdueFollowUps.length} overdue</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Scheduled call checkpoints</div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-4 rounded-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Deals Won</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">{myConvertedLeads}</h2>
            <span className="text-[10px] text-[#00f2ff] font-semibold">{conversionRate}% win</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Converted to active accounts</div>
        </div>
      </div>

      {/* Middle Grid: AI Recommended Queue & Today's Follow-up Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommended Leads to Call Next */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#00f2ff] flex items-center justify-center">
                <span className="text-[10px] text-black font-black">AI</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recommended Next Calls (Highest Conversion Probability)
                </h2>
                <p className="text-[10px] text-gray-500">
                  Ranked by AI buying intent, corporate intent, and optimal time slot
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {aiRecommendedToCall.map((lead) => (
              <div
                key={lead.id}
                className="p-3.5 rounded-lg bg-[#161616] border border-white/5 hover:border-[#00f2ff]/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex flex-col items-center justify-center text-[#00f2ff] shrink-0">
                    <span className="text-sm font-black font-mono">{lead.aiAnalysis?.score || 70}</span>
                    <span className="text-[7px] uppercase font-bold tracking-tighter">AI Score</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onOpenLeadDetail(lead)}
                        className="font-medium text-white text-xs hover:text-[#00f2ff] cursor-pointer"
                      >
                        {lead.name}
                      </span>
                      <span className="text-[10px] text-gray-500">• {lead.company}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] font-bold border border-[#00f2ff]/20">
                        {lead.aiAnalysis?.buyingIntent} Intent
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                      <span className="text-emerald-400 font-medium">
                        Slot: {lead.aiAnalysis?.bestTimeToCall}
                      </span>
                      <span>•</span>
                      <span className="line-clamp-1 italic">"{lead.aiAnalysis?.recommendedAction}"</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenLeadDetail(lead)}
                    className="px-3 py-1.5 rounded-md bg-[#161616] hover:bg-[#1f1f1f] text-gray-300 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onStartCall(lead)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Follow-up Agenda */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-400" /> Today’s Follow-ups
            </h2>
            <button
              onClick={() => onNavigateTab('followups')}
              className="text-xs text-[#00f2ff] hover:underline font-semibold cursor-pointer"
            >
              All →
            </button>
          </div>

          <div className="space-y-2.5">
            {myFollowUpsToday.length === 0 ? (
              <div className="p-6 text-center rounded-lg bg-[#161616] border border-dashed border-white/10 text-gray-500 text-xs">
                No pending follow-ups for today! Great work staying ahead.
              </div>
            ) : (
              myFollowUpsToday.map((fu) => {
                const targetLead = leads.find((l) => l.id === fu.leadId);
                return (
                  <div
                    key={fu.id}
                    className="p-3 rounded-lg bg-[#161616] border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{fu.leadName}</span>
                      <span className="font-mono text-[#00f2ff] font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10 text-[10px]">
                        {fu.scheduledTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{fu.notes}</p>
                    <div className="pt-1 flex justify-end">
                      {targetLead && (
                        <button
                          onClick={() => onStartCall(targetLead)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] font-bold text-[11px] border border-[#00f2ff]/30 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3 h-3" /> Call {fu.scheduledTime}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Priority Leads Table */}
      <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" /> High-Priority Assigned Leads ({priorityLeads.length})
            </h2>
            <p className="text-[10px] text-gray-500">Critical prospects designated for rapid deal cycle</p>
          </div>
          <button
            onClick={() => onNavigateTab('leads')}
            className="text-xs text-[#00f2ff] hover:underline font-semibold cursor-pointer"
          >
            View All My Leads →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-gray-500 uppercase text-[10px] font-semibold">
              <tr>
                <th className="p-3">Lead Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Company</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">AI Score</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {priorityLeads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">
                    <button
                      onClick={() => onOpenLeadDetail(lead)}
                      className="hover:text-[#00f2ff] text-left cursor-pointer"
                    >
                      {lead.name}
                    </button>
                  </td>
                  <td className="p-3 font-mono text-gray-300">{lead.phone}</td>
                  <td className="p-3 text-gray-400">{lead.company}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/40 text-blue-400 border border-blue-400/20">
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-mono font-bold text-xs text-[#00f2ff]">
                      {lead.aiAnalysis?.score || 80}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onStartCall(lead)}
                      className="px-3 py-1 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold rounded text-xs transition-colors cursor-pointer"
                    >
                      Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

