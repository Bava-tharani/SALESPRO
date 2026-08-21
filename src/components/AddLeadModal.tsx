import React, { useState } from 'react';
import { Lead, User, LeadSource, LeadPriority, LeadStatus } from '../types';
import { LocalAIService } from '../services/aiService';
import { X, UserPlus, Sparkles, Building2, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  salespeople: User[];
  onSave: (newLead: Lead) => void;
  onClose: () => void;
}

export const AddLeadModal: React.FC<Props> = ({ salespeople, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [priority, setPriority] = useState<LeadPriority>('High');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [assignedTo, setAssignedTo] = useState<string>(salespeople[0]?.id || '');
  const [dealValue, setDealValue] = useState('350000');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lead Full Name is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please provide a valid contact phone number.');
      return;
    }

    const assignedUser = salespeople.find((s) => s.id === assignedTo);

    const tempLead: Partial<Lead> = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: company.trim() || 'Direct Client',
      source,
      priority,
      status,
      assignedTo,
      assignedToName: assignedUser?.name || 'Unassigned',
      city: city.trim() || 'Pan India',
      estimatedDealValue: Number(dealValue) || 250000,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const aiAnalysis = LocalAIService.scoreLead(tempLead);

    const fullLead: Lead = {
      ...(tempLead as Lead),
      aiAnalysis
    };

    onSave(fullLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Lead</h3>
              <p className="text-xs text-gray-500">Enter prospective buyer or corporate contact details</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98230 11223"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vikram@enterprise.in"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Singhania Tech Logistics"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Manual Entry">Manual Entry</option>
                <option value="CSV Import">CSV Import</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Assign Sales Representative</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                {salespeople.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Est. Deal Value (₹)</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="350000"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Initial Notes & Context</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Inquired about 20-agent telephony deployment for Mumbai office..."
              className="w-full bg-[#161616] border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
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
              <CheckCircle2 className="w-4 h-4" /> CREATE LEAD & RUN AI SCORING
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
