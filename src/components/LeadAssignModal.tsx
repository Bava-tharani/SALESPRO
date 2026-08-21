import React, { useState } from 'react';
import { Lead, User } from '../types';
import { X, UserCheck, CheckCircle2, Users, ArrowRight } from 'lucide-react';

interface Props {
  leadsToAssign: Lead[];
  salespeople: User[];
  allLeads: Lead[];
  onAssign: (leadIds: string[], targetSalespersonId: string) => void;
  onClose: () => void;
}

export const LeadAssignModal: React.FC<Props> = ({
  leadsToAssign,
  salespeople,
  allLeads,
  onAssign,
  onClose
}) => {
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>(
    salespeople[0]?.id || ''
  );

  // Compute live workload for each salesperson
  const getWorkload = (userId: string) => {
    return allLeads.filter((l) => l.assignedTo === userId && l.status !== 'Converted' && l.status !== 'Lost').length;
  };

  const handleConfirm = () => {
    if (!selectedSalespersonId) return;
    onAssign(leadsToAssign.map((l) => l.id), selectedSalespersonId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {leadsToAssign.length === 1 ? 'Assign Lead' : `Bulk Assign (${leadsToAssign.length} Leads)`}
              </h3>
              <p className="text-xs text-gray-500">
                Select target salesperson with balanced workload
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target Leads Summary */}
          <div className="p-3.5 rounded-lg bg-[#161616] border border-white/5 text-xs">
            <span className="text-gray-500 block mb-1 uppercase font-semibold text-[10px] tracking-wider">
              Selected Lead{leadsToAssign.length > 1 ? 's' : ''}:
            </span>
            <div className="font-medium text-[#00f2ff]">
              {leadsToAssign.length === 1
                ? `${leadsToAssign[0].name} (${leadsToAssign[0].company || 'Direct'})`
                : `${leadsToAssign.length} leads selected (${leadsToAssign.slice(0, 3).map(l => l.name).join(', ')}${leadsToAssign.length > 3 ? '...' : ''})`}
            </div>
          </div>

          {/* Salesperson Workload Selector */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Choose Sales Representative:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {salespeople.map((rep) => {
                const count = getWorkload(rep.id);
                const isSelected = selectedSalespersonId === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedSalespersonId(rep.id)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#00f2ff]/10 border-[#00f2ff]/60 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                        : 'bg-[#161616] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-[#00f2ff] text-black font-extrabold'
                            : 'bg-black/40 text-gray-300 border border-white/10'
                        }`}
                      >
                        {rep.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{rep.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{rep.email}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded font-semibold font-mono border ${
                          count > 15
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {count} Active Leads
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#121212] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-md border border-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> CONFIRM ASSIGNMENT
          </button>
        </div>
      </div>
    </div>
  );
};
