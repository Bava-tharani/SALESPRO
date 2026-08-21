import React, { useState } from 'react';
import { Lead, CallRecord, FollowUp, User, LeadStatus, LeadPriority } from '../types';
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  PhoneCall,
  Edit3,
  CheckCircle,
  FileText,
  UserCheck,
  MapPin,
  IndianRupee,
  History,
  Plus
} from 'lucide-react';

interface Props {
  lead: Lead;
  allUsers: User[];
  callHistory: CallRecord[];
  followUps: FollowUp[];
  onClose: () => void;
  onStartCall: (lead: Lead) => void;
  onUpdateLead: (updated: Lead) => void;
  onOpenScheduleFollowUp: (lead: Lead) => void;
  onOpenAiExplainer: (lead: Lead) => void;
  currentUserRole: 'manager' | 'salesperson';
}

export const LeadDetailModal: React.FC<Props> = ({
  lead,
  allUsers,
  callHistory,
  followUps,
  onClose,
  onStartCall,
  onUpdateLead,
  onOpenScheduleFollowUp,
  onOpenAiExplainer,
  currentUserRole
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [currentPriority, setCurrentPriority] = useState<LeadPriority>(lead.priority);

  const leadCalls = callHistory.filter(c => c.leadId === lead.id);
  const leadFollowUps = followUps.filter(f => f.leadId === lead.id);

  const handleSaveNotesAndStatus = () => {
    const updatedLead: Lead = {
      ...lead,
      notes,
      status: currentStatus,
      priority: currentPriority,
      updatedAt: new Date().toISOString()
    };
    onUpdateLead(updatedLead);
    setIsEditingNotes(false);
  };

  const getStatusBadge = (status: LeadStatus) => {
    const styles: Record<LeadStatus, string> = {
      New: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      Contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      Interested: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      'Follow-up': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      Converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'Not Interested': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      Lost: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    const styles: Record<LeadPriority, string> = {
      High: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      Low: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[priority]}`}>
        {priority} Priority
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] font-bold text-base">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">{lead.name}</h2>
                {getStatusBadge(lead.status)}
                {getPriorityBadge(lead.priority)}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 font-mono">
                <span>{lead.company}</span>
                {lead.city && (
                  <span className="flex items-center gap-0.5">
                    • <MapPin className="w-3 h-3 text-gray-500" /> {lead.city}
                  </span>
                )}
                <span>• ID: {lead.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartCall(lead)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] text-xs transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Start Call
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* AI Score Banner */}
          {lead.aiAnalysis && (
            <div className="p-4 rounded-lg bg-[#161616] border border-[#00f2ff]/30 flex items-center justify-between flex-wrap gap-4 shadow-[0_0_15px_rgba(0,242,255,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex flex-col items-center justify-center text-[#00f2ff]">
                  <span className="text-base font-bold leading-none font-mono">{lead.aiAnalysis.score}</span>
                  <span className="text-[8px] uppercase font-bold text-gray-400">Score</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00f2ff] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" /> AI Buying Intent:
                    </span>
                    <span className="text-xs font-medium text-white">
                      {lead.aiAnalysis.buyingIntent} ({lead.aiAnalysis.conversionProbability}% probability)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lead.aiAnalysis.summary.substring(0, 100)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenAiExplainer(lead)}
                className="px-3 py-1.5 rounded-md bg-[#121212] hover:bg-white/5 border border-white/10 text-[#00f2ff] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" /> Explain Score ("Why?")
              </button>
            </div>
          )}

          {/* Quick Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00f2ff]" /> Contact Info
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px]">Phone</span>
                  <a href={`tel:${lead.phone}`} className="font-mono text-white hover:text-[#00f2ff] font-medium">
                    {lead.phone}
                  </a>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Email</span>
                  <a href={`mailto:${lead.email}`} className="text-gray-300 hover:text-[#00f2ff] truncate block font-mono">
                    {lead.email || '—'}
                  </a>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Company</span>
                  <span className="text-gray-200">{lead.company || '—'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Deal & Lead Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px]">Lead Source</span>
                  <span className="text-gray-200">{lead.source}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Estimated Deal Value</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    ₹{lead.estimatedDealValue ? lead.estimatedDealValue.toLocaleString('en-IN') : '2,50,000'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Assigned Salesperson</span>
                  <span className="text-gray-200 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#00f2ff]" /> {lead.assignedToName || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Interaction Schedule
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px]">Created Date</span>
                  <span className="text-gray-300 font-mono">
                    {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Last Contacted</span>
                  <span className="text-gray-300 font-mono">
                    {lead.lastContactedAt
                      ? new Date(lead.lastContactedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Next Scheduled Follow-up</span>
                  <span className="text-[#00f2ff] font-mono font-medium">
                    {lead.nextFollowUpAt
                      ? new Date(lead.nextFollowUpAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'None scheduled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Priority Management */}
          <div className="p-4 rounded-lg bg-[#161616] border border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Status & Notes Update
              </span>
              <button
                onClick={handleSaveNotesAndStatus}
                className="px-3 py-1 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-1 uppercase font-semibold">Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as LeadStatus)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Converted">Converted</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-1 uppercase font-semibold">Priority</label>
                <select
                  value={currentPriority}
                  onChange={(e) => setCurrentPriority(e.target.value as LeadPriority)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 block mb-1 uppercase font-semibold">Sales Notes & Key Requirements</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
                placeholder="Add meeting notes, customer objections, or specific product interests..."
              />
            </div>
          </div>

          {/* Interaction Timeline: Calls & Follow-ups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#00f2ff]" /> Interaction & Call Timeline ({leadCalls.length} calls)
              </h3>
              <button
                onClick={() => onOpenScheduleFollowUp(lead)}
                className="text-xs text-[#00f2ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Follow-up
              </button>
            </div>

            {leadCalls.length === 0 ? (
              <div className="p-6 text-center rounded-lg bg-[#161616] border border-dashed border-white/10 text-gray-500 text-xs">
                No calls recorded yet. Click <strong className="text-[#00f2ff]">"Start Call"</strong> above to make the first outreach.
              </div>
            ) : (
              <div className="space-y-2.5">
                {leadCalls.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-lg bg-[#161616] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {c.salespersonName}
                        </span>
                        <span className="text-gray-500 text-[10px] font-mono">
                          • {new Date(c.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at{' '}
                          {new Date(c.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#00f2ff] text-xs font-bold">
                          {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-black/40 text-gray-300 font-medium border border-white/5">
                          {c.outcome}
                        </span>
                      </div>
                    </div>

                    {c.notes && (
                      <p className="text-xs text-gray-400 bg-[#121212] p-2 rounded border border-white/5 italic">
                        {c.notes}
                      </p>
                    )}

                    {c.aiInsight && (
                      <div className="p-2.5 rounded bg-black/40 border border-[#00f2ff]/20 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#00f2ff] font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Summary & Quality:
                          </span>
                          <span className="text-gray-400 font-mono">
                            Quality: {c.aiInsight.callQualityScore}/100 | Sentiment: {c.aiInsight.sentiment}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs italic">"{c.aiInsight.aiSummary}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/5 bg-[#121212] flex justify-between items-center">
          <div className="text-[10px] text-gray-500 font-mono">
            Last modified: {new Date(lead.updatedAt).toLocaleDateString('en-IN')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenScheduleFollowUp(lead)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#161616] hover:bg-[#1f1f1f] text-gray-300 rounded-md border border-white/10 transition-colors cursor-pointer"
            >
              Schedule Follow-up
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
