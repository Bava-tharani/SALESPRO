import React, { useState } from 'react';
import { Lead, User, FollowUp, FollowUpReminder } from '../types';
import { X, Calendar, Clock, Bell, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  lead: Lead;
  currentUser: User;
  onSchedule: (followUp: FollowUp) => void;
  onClose: () => void;
}

export const ScheduleFollowUpModal: React.FC<Props> = ({
  lead,
  currentUser,
  onSchedule,
  onClose
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [date, setDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [time, setTime] = useState('11:30');
  const [reminder, setReminder] = useState<FollowUpReminder>('15 minutes before');
  const [notes, setNotes] = useState(
    `Follow-up call with ${lead.name} regarding project scope and contract finalization.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFollowUp: FollowUp = {
      id: `FU-${Date.now().toString().slice(-5)}`,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      scheduledDate: date,
      scheduledTime: time,
      reminder,
      status: 'Pending',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: lead.priority
    };

    onSchedule(newFollowUp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule Follow-up</h3>
              <p className="text-xs text-gray-500 font-mono">
                Prospect: <span className="text-[#00f2ff] font-semibold">{lead.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Date <span className="text-[#00f2ff]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Time <span className="text-[#00f2ff]">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Reminder Notification
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value as FollowUpReminder)}
              className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
            >
              <option value="At time of follow-up">At time of follow-up</option>
              <option value="15 minutes before">15 minutes before</option>
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="1 day before">1 day before</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Follow-up Agenda / Meeting Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#161616] border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
              placeholder="Outline discussion items, pricing deck review, or technical clarification..."
            />
          </div>

          <div className="px-6 py-4 border-t border-white/5 bg-[#121212] flex justify-end gap-2.5 -mx-6 -mb-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-md border border-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> SCHEDULE FOLLOW-UP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
