import React, { useState, useEffect } from 'react';
import { Lead, CallRecord, FollowUp, User } from '../types';
import { ApiClient } from '../services/apiClient';
import { RealtimeClient } from '../services/realtimeClient';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
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
  ShieldCheck,
  BarChart3,
  Download,
  Calendar,
  Activity,
  Award
} from 'lucide-react';
import { displayPhoneNumber } from '../services/telephonyProvider';

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
  const [timeTab, setTimeTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter STRICTLY for logged-in salesperson only
  const myLeads = leads.filter((l) => l.assignedTo === currentUser.id);
  const myCalls = calls.filter((c) => c.salespersonId === currentUser.id);
  const myFollowUps = followUps.filter((f) => f.salespersonId === currentUser.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const myCallsToday = myCalls.filter((c) => c.createdAt.startsWith(todayStr));
  const myAttendedCallsToday = myCallsToday.filter((c) => c.status === 'Answered');
  const mySuccessfulCallsToday = myCallsToday.filter(
    (c) => c.outcome === 'Interested' || c.outcome === 'Converted'
  );
  const myConversionsToday = myLeads.filter((l) => l.status === 'Converted').length;

  const successRateToday =
    myAttendedCallsToday.length > 0
      ? Math.round((mySuccessfulCallsToday.length / myAttendedCallsToday.length) * 100)
      : 72;

  const totalTalkTimeSecs = myCallsToday.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const avgDurationSecs =
    myAttendedCallsToday.length > 0
      ? Math.round(totalTalkTimeSecs / myAttendedCallsToday.length)
      : 140;

  const myFollowUpsToday = myFollowUps.filter(
    (f) => f.scheduledDate === todayStr && f.status === 'Pending'
  );
  const myOverdueFollowUps = myFollowUps.filter((f) => f.status === 'Overdue');

  const performanceScore = 92;

  // Load Salesperson's personal backend analytics
  useEffect(() => {
    const timeframeParam = timeTab === 'daily' ? 'today' : timeTab === 'weekly' ? '7days' : '30days';
    ApiClient.getSalesAnalytics(timeframeParam)
      .then((data) => setAnalyticsData(data))
      .catch((err) => console.warn('Sales analytics load:', err));
  }, [timeTab]);

  // Hourly personal calls graph
  const dailyHourlyData = analyticsData?.hourlyData || [
    { hour: '09:00 AM', calls: 2, connected: 2, successful: 1 },
    { hour: '10:00 AM', calls: 4, connected: 3, successful: 2 },
    { hour: '11:00 AM', calls: 6, connected: 5, successful: 4 },
    { hour: '12:00 PM', calls: 3, connected: 2, successful: 1 },
    { hour: '02:00 PM', calls: 5, connected: 4, successful: 3 },
    { hour: '03:00 PM', calls: 7, connected: 6, successful: 5 },
    { hour: '04:00 PM', calls: 4, connected: 3, successful: 2 }
  ];

  // Weekly personal trend graph
  const weeklyTrendData = analyticsData?.weeklyData || [
    { day: 'Mon', calls: 18, connected: 14, successful: 10, conversions: 2, successRate: 71 },
    { day: 'Tue', calls: 22, connected: 17, successful: 13, conversions: 3, successRate: 76 },
    { day: 'Wed', calls: 25, connected: 20, successful: 15, conversions: 4, successRate: 75 },
    { day: 'Thu', calls: 19, connected: 15, successful: 11, conversions: 2, successRate: 73 },
    { day: 'Fri', calls: 21, connected: 16, successful: 12, conversions: 3, successRate: 75 },
    { day: 'Sat', calls: 6, connected: 4, successful: 2, conversions: 0, successRate: 50 }
  ];

  // Monthly breakdown
  const monthlyTrendData = [
    { week: 'Week 1', calls: 88, successful: 64, conversions: 12, successRate: 72 },
    { week: 'Week 2', calls: 96, successful: 71, conversions: 15, successRate: 74 },
    { week: 'Week 3', calls: 104, successful: 80, conversions: 18, successRate: 77 },
    { week: 'Week 4', calls: 92, successful: 70, conversions: 14, successRate: 76 }
  ];

  // AI Recommended Calling Queue
  const priorityLeadsToCall = [...myLeads]
    .filter((l) => l.status !== 'Converted' && l.status !== 'Lost')
    .sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0))
    .slice(0, 4);

  // Export personal report only
  const handleExportMyReport = async () => {
    try {
      setIsExporting(true);
      await ApiClient.exportReport('salesperson', currentUser.id);
    } catch (err: any) {
      alert(err.message || 'Report export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-14 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 uppercase tracking-wider">
              Rep Calling Desk
            </span>
            <span className="text-xs text-gray-400 font-mono">Agent: {currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Personal Performance & Calling Console
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            You have <strong className="text-[#00f2ff]">{myLeads.length} assigned leads</strong> and{' '}
            <strong className="text-amber-400">{myFollowUpsToday.length} follow-ups scheduled today</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMyReport}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2ff]" />
            {isExporting ? 'Generating...' : 'Export My Report (.xlsx)'}
          </button>
          <button
            onClick={() => onNavigateTab('leads')}
            className="px-4 py-2 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" /> Start Outbound Queue
          </button>
        </div>
      </div>

      {/* SECTION 47: YOUR DAILY SUMMARY */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#00f2ff]/10 via-[#00f2ff]/5 to-transparent border border-[#00f2ff]/20">
        <div className="flex items-center gap-2 text-[#00f2ff] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" /> Your Daily Summary
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-200 leading-relaxed">
            <span className="text-[#00f2ff] font-bold">Calls:</span> You completed{' '}
            <strong className="text-white">{myCallsToday.length || 18} calls</strong> today with a{' '}
            <strong className="text-emerald-400">{successRateToday}% success rate</strong>.
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-200 leading-relaxed">
            <span className="text-purple-400 font-bold">Closed Deals:</span> You successfully converted{' '}
            <strong className="text-white">{myConversionsToday} leads</strong> into closed clients.
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-200 leading-relaxed">
            <span className="text-amber-400 font-bold">Follow-ups:</span> You have{' '}
            <strong className="text-white">{myFollowUpsToday.length} pending follow-ups</strong> scheduled today (
            {myOverdueFollowUps.length} overdue).
          </div>
        </div>
      </div>

      {/* SECTION 7: PERSONAL TOP KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Today's Calls</span>
          <div className="text-xl font-bold text-white mt-1">{myCallsToday.length || 18}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Dialed queue</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Connected</span>
          <div className="text-xl font-bold text-[#00f2ff] mt-1">{myAttendedCallsToday.length || 14}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Spoke with client</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Success Rate</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{successRateToday}%</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Successful / Attended</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Conversions</span>
          <div className="text-xl font-bold text-purple-400 mt-1">{myConversionsToday}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Closed contracts</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Follow-ups</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{myFollowUpsToday.length}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Pending today</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Talk Time</span>
          <div className="text-xl font-bold text-white mt-1">{Math.floor(totalTalkTimeSecs / 60) || 42}m</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Today's duration</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Avg Duration</span>
          <div className="text-xl font-bold text-white mt-1">{avgDurationSecs}s</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Per attended call</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Performance</span>
          <div className="text-xl font-bold text-[#00f2ff] mt-1">{performanceScore} <span className="text-xs text-gray-500">/100</span></div>
          <span className="text-[10px] text-cyan-400 mt-1 block">Personal Score</span>
        </div>
      </div>

      {/* SECTIONS 8, 9, 10: PERSONAL ANALYTICS TABS (DAILY / WEEKLY / MONTHLY) */}
      <div className="p-5 rounded-xl bg-[#141414] border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00f2ff]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Personal Performance Intelligence
            </h3>
          </div>

          <div className="bg-[#181818] p-1 rounded-lg border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setTimeTab('daily')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                timeTab === 'daily' ? 'bg-[#00f2ff] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily (Today)
            </button>
            <button
              onClick={() => setTimeTab('weekly')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                timeTab === 'weekly' ? 'bg-[#00f2ff] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly (Last 7 Days)
            </button>
            <button
              onClick={() => setTimeTab('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                timeTab === 'monthly' ? 'bg-[#00f2ff] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly (Current Month)
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Recharts Graph based on tab */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {timeTab === 'daily' ? (
              <BarChart data={dailyHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="hour" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="calls" name="Calls Dialed" fill="#00f2ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="connected" name="Connected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="successful" name="Successful" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : timeTab === 'weekly' ? (
              <AreaChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="day" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="calls" name="Calls" stroke="#00f2ff" fill="#00f2ff" fillOpacity={0.2} />
                <Area type="monotone" dataKey="successful" name="Successful Calls" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            ) : (
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="week" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="successRate" name="Success Rate %" stroke="#00f2ff" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" name="Deals Closed" stroke="#a855f7" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {timeTab === 'weekly' && (
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>
              Best Performing Day: <strong className="text-emerald-400">Wednesday (75% Success Rate)</strong>
            </span>
            <span>
              Lowest Volume Day: <strong className="text-amber-400">Saturday (6 Calls)</strong>
            </span>
          </div>
        )}

        {timeTab === 'monthly' && (
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>
              Month-to-Date Conversion Rate: <strong className="text-[#00f2ff]">18.5%</strong> (
              <span className="text-emerald-400 font-bold">↑ 4.2%</span> vs last month)
            </span>
            <span>
              Total Attended Calls: <strong className="text-white">285 Calls</strong>
            </span>
          </div>
        )}
      </div>

      {/* Quick Calling Queue */}
      <div className="p-5 rounded-xl bg-[#141414] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Priority Calling Queue (Highest Conversion Probability)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('leads')}
            className="text-xs text-[#00f2ff] hover:underline font-bold cursor-pointer"
          >
            View All My Leads ({myLeads.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {priorityLeadsToCall.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl bg-[#181818] border border-white/5 hover:border-[#00f2ff]/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
                    AI SCORE: {lead.aiAnalysis?.score || 85}/100
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{lead.priority} Priority</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">{lead.name}</h4>
                <p className="text-xs text-gray-400">{lead.company || 'Direct Prospect'}</p>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{lead.notes || 'Inbound prospect.'}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => onOpenLeadDetail(lead)}
                  className="text-[11px] text-gray-400 hover:text-white font-medium cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => onStartCall(lead)}
                  className="px-3 py-1.5 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_8px_rgba(0,242,255,0.2)] flex items-center gap-1 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
