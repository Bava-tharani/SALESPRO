import React, { useState, useMemo } from 'react';
import { FollowUp, Lead, User, FollowUpStatus } from '../types';
import {
  CalendarClock,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  RotateCw,
  Search,
  Filter,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Props {
  followUps: FollowUp[];
  leads: Lead[];
  currentUser: User;
  onStartCall: (lead: Lead) => void;
  onUpdateFollowUpStatus: (followUpId: string, newStatus: FollowUpStatus) => void;
  onRescheduleFollowUp: (followUp: FollowUp) => void;
}

export const FollowUpsView: React.FC<Props> = ({
  followUps,
  leads,
  currentUser,
  onStartCall,
  onUpdateFollowUpStatus,
  onRescheduleFollowUp
}) => {
  const isManager = currentUser.role === 'manager';
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const userFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      if (!isManager && f.salespersonId !== currentUser.id) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          f.leadName.toLowerCase().includes(q) ||
          f.leadPhone.toLowerCase().includes(q) ||
          f.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [followUps, isManager, currentUser.id, searchTerm]);

  // Tab filtering
  const displayedFollowUps = useMemo(() => {
    return userFollowUps.filter((f) => {
      if (activeTab === 'today') {
        return f.scheduledDate === todayStr && f.status === 'Pending';
      }
      if (activeTab === 'upcoming') {
        return f.scheduledDate > todayStr && f.status === 'Pending';
      }
      if (activeTab === 'overdue') {
        return f.status === 'Overdue' || (f.scheduledDate < todayStr && f.status === 'Pending');
      }
      if (activeTab === 'completed') {
        return f.status === 'Completed';
      }
      return true; // all
    });
  }, [userFollowUps, activeTab, todayStr]);

  const counts = {
    today: userFollowUps.filter((f) => f.scheduledDate === todayStr && f.status === 'Pending').length,
    upcoming: userFollowUps.filter((f) => f.scheduledDate > todayStr && f.status === 'Pending').length,
    overdue: userFollowUps.filter((f) => f.status === 'Overdue' || (f.scheduledDate < todayStr && f.status === 'Pending')).length,
    completed: userFollowUps.filter((f) => f.status === 'Completed').length,
    all: userFollowUps.length
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Follow-up Cadence
            {counts.overdue > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-500/30 animate-pulse uppercase">
                {counts.overdue} Overdue
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track scheduled call appointments, set alarms, and maintain continuous prospect contact momentum.
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121212] border border-white/5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'today', label: "Today's Due", count: counts.today, color: 'text-amber-400' },
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming, color: 'text-[#00f2ff]' },
            { id: 'overdue', label: 'Overdue', count: counts.overdue, color: 'text-red-400', alert: counts.overdue > 0 },
            { id: 'completed', label: 'Completed', count: counts.completed, color: 'text-emerald-400' },
            { id: 'all', label: 'All Follow-ups', count: counts.all, color: 'text-gray-300' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#161616] text-[#00f2ff] border border-white/10 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  t.alert
                    ? 'bg-red-950 text-red-400 border border-red-500/20'
                    : activeTab === t.id
                    ? 'bg-[#00f2ff]/20 text-[#00f2ff]'
                    : 'bg-[#161616] text-gray-500'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search follow-ups..."
            className="w-full bg-[#121212] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Follow-up Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedFollowUps.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-lg bg-[#121212] border border-white/5 text-gray-500">
            <CheckCircle2 className="w-8 h-8 text-[#00f2ff] mx-auto mb-2 opacity-60" />
            <div className="text-sm font-bold text-gray-300">No follow-ups in this queue</div>
            <p className="text-xs text-gray-500 mt-1">
              You are all caught up! Great job staying on top of client schedules.
            </p>
          </div>
        ) : (
          displayedFollowUps.map((fu) => {
            const targetLead = leads.find((l) => l.id === fu.leadId);
            const isOverdue =
              fu.status === 'Overdue' || (fu.scheduledDate < todayStr && fu.status === 'Pending');

            return (
              <div
                key={fu.id}
                className={`p-5 rounded-lg border transition-all space-y-3.5 flex flex-col justify-between ${
                  isOverdue
                    ? 'bg-red-950/10 border-red-500/30'
                    : fu.status === 'Completed'
                    ? 'bg-[#121212]/60 border-white/5 opacity-60'
                    : 'bg-[#121212] border-white/5 hover:border-[#00f2ff]/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{fu.leadName}</h3>
                      <div className="text-xs font-mono text-[#00f2ff] mt-0.5">{fu.leadPhone}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          isOverdue
                            ? 'bg-red-950/40 text-red-400 border-red-500/20'
                            : fu.status === 'Completed'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-950/40 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {isOverdue ? 'Overdue' : fu.status}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time Pill */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#00f2ff]" />
                      {new Date(fu.scheduledDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[#00f2ff] font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {fu.scheduledTime}
                    </span>
                  </div>

                  {/* Notes / Agenda */}
                  <p className="text-xs text-gray-400 mt-2 bg-[#161616] p-2.5 rounded-lg border border-white/5 line-clamp-3 italic">
                    {fu.notes || 'No specific agenda recorded.'}
                  </p>

                  {/* Salesperson Tag */}
                  {isManager && (
                    <div className="text-[10px] text-gray-500 mt-2">
                      Assigned Rep: <strong className="text-gray-300 font-medium">{fu.salespersonName}</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  {fu.status !== 'Completed' ? (
                    <>
                      <button
                        onClick={() => onUpdateFollowUpStatus(fu.id, 'Completed')}
                        className="px-2.5 py-1.5 rounded-md bg-[#161616] hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                      </button>

                      {targetLead && (
                        <button
                          onClick={() => onStartCall(targetLead)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold text-xs shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Lead
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed on schedule
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
