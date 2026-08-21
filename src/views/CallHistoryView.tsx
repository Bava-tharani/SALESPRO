import React, { useState, useMemo } from 'react';
import { CallRecord, User, CallOutcome, CallStatus } from '../types';
import {
  PhoneCall,
  Search,
  Filter,
  Sparkles,
  Volume2,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Radio
} from 'lucide-react';
import { CallDetailModal } from '../components/CallDetailModal';

interface Props {
  calls: CallRecord[];
  currentUser: User;
  salespeople: User[];
  onOpenCallDetail?: (call: CallRecord) => void;
}

export const CallHistoryView: React.FC<Props> = ({
  calls,
  currentUser,
  salespeople
}) => {
  const isManager = currentUser.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('ALL');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      // Role protection: Salesperson sees only own calls
      if (!isManager && c.salespersonId !== currentUser.id) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          c.leadName.toLowerCase().includes(q) ||
          c.leadPhone.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q) ||
          (c.aiInsight?.aiSummary || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      if (outcomeFilter !== 'ALL' && c.outcome !== outcomeFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (isManager && salespersonFilter !== 'ALL' && c.salespersonId !== salespersonFilter)
        return false;

      return true;
    });
  }, [
    calls,
    isManager,
    currentUser.id,
    searchTerm,
    outcomeFilter,
    statusFilter,
    salespersonFilter
  ]);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder.toString().padStart(2, '0')}s`;
  };

  const getSentimentBadge = (sentiment?: string) => {
    if (sentiment === 'Positive')
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Positive</span>;
    if (sentiment === 'Negative')
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Negative</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">Neutral</span>;
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Call Logs & Intelligence
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#161616] text-[#00f2ff] border border-white/10 font-mono">
              {filteredCalls.length} calls
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isManager
              ? 'Complete team calling logs with AI speech sentiment, conversation summaries, and quality audit.'
              : 'Review your logged customer calls, durations, and AI-generated conversation insights.'}
          </p>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="p-4 rounded-lg bg-[#121212] border border-white/5 flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prospect name, phone, or notes..."
            className="w-full bg-[#161616] border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:flex-1">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
          >
            <option value="ALL">All Outcomes</option>
            <option value="Interested">Interested</option>
            <option value="Follow-up Required">Follow-up Required</option>
            <option value="Converted">Converted</option>
            <option value="Call Later">Call Later</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Wrong Number">Wrong Number</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Answered">Answered</option>
            <option value="No Answer">No Answer</option>
            <option value="Busy">Busy</option>
            <option value="Failed">Failed</option>
          </select>

          {isManager && (
            <select
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
            >
              <option value="ALL">All Sales Reps</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Calls Table */}
      <div className="rounded-lg bg-[#121212] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-gray-500 uppercase text-[10px] font-semibold border-b border-white/5">
              <tr>
                <th className="p-4">Call Date & Time</th>
                <th className="p-4">Prospect Name</th>
                {isManager && <th className="p-4">Sales Rep</th>}
                <th className="p-4">Duration</th>
                <th className="p-4">Status & Outcome</th>
                <th className="p-4">AI Sentiment & Quality</th>
                <th className="p-4">AI Summary / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="p-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-gray-300">No calls found</div>
                    <p className="text-xs text-gray-500 mt-1">
                      No call records match your current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCalls.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCall(c)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                    title="Click to view full audio recording, transcripts, and AI intelligence audit"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-medium text-white group-hover:text-[#00f2ff] transition-colors">
                        {new Date(c.startedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500">
                        {new Date(c.startedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{c.leadName}</div>
                      <div className="text-[10px] font-mono text-gray-500">{c.leadPhone}</div>
                    </td>

                    {isManager && (
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-xs text-gray-300 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-[#00f2ff]" />
                          {c.salespersonName}
                        </span>
                      </td>
                    )}

                    <td className="p-4 font-mono text-[#00f2ff] font-bold whitespace-nowrap">
                      {formatDuration(c.durationSeconds)}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-gray-200">{c.outcome}</div>
                      <div className="text-[10px] text-gray-500">{c.status}</div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getSentimentBadge(c.aiInsight?.sentiment)}
                        {c.aiInsight && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20">
                            {c.aiInsight.callQualityScore}/100
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 max-w-sm">
                      <p className="text-xs text-gray-400 line-clamp-2 italic">
                        "{c.aiInsight?.aiSummary || c.notes || '—'}"
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
};
