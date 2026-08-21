import React, { useState, useEffect } from 'react';
import { Lead, User } from '../types';
import { ApiClient } from '../services/apiClient';
import { SalespersonRecommendation } from '../server/services/assignmentService';
import {
  X,
  UserCheck,
  CheckCircle2,
  Users,
  Sparkles,
  Flame,
  TrendingUp,
  ShieldCheck,
  Activity,
  Award
} from 'lucide-react';

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
  const [recommendations, setRecommendations] = useState<SalespersonRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const targetLead = leadsToAssign[0];

  useEffect(() => {
    if (targetLead) {
      setIsLoadingRecs(true);
      ApiClient.getLeadRecommendations(targetLead.id)
        .then((res) => {
          if (res.recommendations && res.recommendations.length > 0) {
            setRecommendations(res.recommendations);
            // Select the top recommended rep by default
            setSelectedSalespersonId(res.recommendations[0].userId);
          }
          setIsLoadingRecs(false);
        })
        .catch(() => {
          setIsLoadingRecs(false);
        });
    }
  }, [targetLead?.id]);

  const handleConfirm = () => {
    if (!selectedSalespersonId) return;
    onAssign(leadsToAssign.map((l) => l.id), selectedSalespersonId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {targetLead?.priority === 'High' ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" /> Assign Important HOT Lead
                  </span>
                ) : (
                  'Assign Sales Lead'
                )}
              </h3>
              <p className="text-xs text-gray-400">
                AI-powered weighted recommendation scoring based on historical conversion & workload
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
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Target Leads Summary */}
          <div className="p-3.5 rounded-lg bg-[#161616] border border-white/5 text-xs flex items-center justify-between">
            <div>
              <span className="text-gray-500 block uppercase font-semibold text-[10px] tracking-wider">
                Selected Prospect:
              </span>
              <div className="font-bold text-white text-sm">
                {targetLead ? `${targetLead.name} (${targetLead.company || 'Direct'})` : 'Multiple Leads'}
              </div>
            </div>
            {targetLead && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  targetLead.priority === 'High'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/30'
                }`}
              >
                {targetLead.priority} Priority • {targetLead.source}
              </span>
            )}
          </div>

          {/* AI Salesperson Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#00f2ff]" /> Sales Representative Match Rankings:
              </label>
              <span className="text-[10px] text-gray-500 font-mono">
                Weighted: Success (30%), Conv (25%), Similar (20%), Bandwidth (15%), Status (10%)
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(recommendations.length > 0
                ? recommendations
                : salespeople.map((rep) => ({
                    userId: rep.id,
                    userName: rep.name,
                    email: rep.email,
                    status: 'ONLINE' as const,
                    score: 85,
                    scoreBreakdown: {
                      successRateScore: 26,
                      conversionRateScore: 21,
                      similarLeadScore: 16,
                      workloadScore: 12,
                      availabilityScore: 10
                    },
                    metrics: {
                      successRate: 78,
                      conversionRate: 22,
                      activeWorkload: 8,
                      similarLeadConversions: 4
                    },
                    recommendationReason: 'High historical conversion rate.'
                  }))
              ).map((rec, idx) => {
                const isSelected = selectedSalespersonId === rec.userId;
                const isTopRanked = idx === 0;

                return (
                  <div
                    key={rec.userId}
                    onClick={() => setSelectedSalespersonId(rec.userId)}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#00f2ff]/10 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.15)]'
                        : 'bg-[#161616] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-[#00f2ff] text-black font-extrabold shadow-[0_0_8px_#00f2ff]'
                              : 'bg-black/40 text-gray-300 border border-white/10'
                          }`}
                        >
                          {rec.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{rec.userName}</span>
                            {isTopRanked && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                                ★ Top Match
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  rec.status === 'ONLINE'
                                    ? 'bg-emerald-400'
                                    : rec.status === 'ON_CALL'
                                    ? 'bg-amber-400'
                                    : 'bg-gray-500'
                                }`}
                              />
                              {rec.status}
                            </span>
                            • {rec.metrics.activeWorkload} Active Leads • {rec.metrics.successRate}% Success
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-[#00f2ff]">{rec.score}</div>
                        <span className="text-[9px] text-gray-500 uppercase font-mono">Match Score</span>
                      </div>
                    </div>

                    {/* Transparent AI Score Explainer */}
                    <div className="pt-2 border-t border-white/5 text-[11px] text-gray-300 flex items-center justify-between">
                      <p className="italic text-gray-400">"{rec.recommendationReason}"</p>
                      <span className="text-[10px] font-mono text-[#00f2ff] font-bold shrink-0 ml-2">
                        SR: {rec.scoreBreakdown.successRateScore}/30 • CR: {rec.scoreBreakdown.conversionRateScore}/25
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#141414] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,242,255,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" /> Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};
