import React, { useState, useMemo } from 'react';
import { Lead, User, LeadStatus, LeadPriority, LeadSource } from '../types';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  PhoneCall,
  Sparkles,
  UserCheck,
  Trash2,
  Eye,
  ArrowUpDown,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';

interface Props {
  leads: Lead[];
  currentUser: User;
  salespeople: User[];
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenLeadDetail: (lead: Lead) => void;
  onOpenAssignModal: (selectedLeads: Lead[]) => void;
  onOpenAiExplainer: (lead: Lead) => void;
  onStartCall: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export const LeadManagementView: React.FC<Props> = ({
  leads,
  currentUser,
  salespeople,
  onOpenAddModal,
  onOpenImportModal,
  onOpenLeadDetail,
  onOpenAssignModal,
  onOpenAiExplainer,
  onStartCall,
  onDeleteLead
}) => {
  const isManager = currentUser.role === 'manager';

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Salespeople can only see assigned leads in their view
        if (!isManager && lead.assignedTo !== currentUser.id) {
          return false;
        }

        // Search Term Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matches =
            lead.name.toLowerCase().includes(q) ||
            lead.phone.toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q) ||
            lead.company.toLowerCase().includes(q) ||
            lead.id.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;

        // Priority Filter
        if (priorityFilter !== 'ALL' && lead.priority !== priorityFilter) return false;

        // Salesperson Filter
        if (isManager && salespersonFilter !== 'ALL' && lead.assignedTo !== salespersonFilter)
          return false;

        // Source Filter
        if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0);
        }
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [
    leads,
    isManager,
    currentUser.id,
    searchTerm,
    statusFilter,
    priorityFilter,
    salespersonFilter,
    sourceFilter,
    sortBy
  ]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    salespersonFilter !== 'ALL' ||
    sourceFilter !== 'ALL';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSalespersonFilter('ALL');
    setSourceFilter('ALL');
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    const map: Record<LeadStatus, string> = {
      New: 'bg-white/10 text-white border-white/10',
      Contacted: 'bg-purple-900/40 text-purple-400 border-purple-400/20',
      Interested: 'bg-blue-900/40 text-blue-400 border-blue-400/20',
      'Follow-up': 'bg-amber-900/40 text-amber-400 border-amber-400/20',
      Converted: 'bg-emerald-900/40 text-emerald-400 border-emerald-400/20',
      'Not Interested': 'bg-[#1f1f1f] text-gray-400 border-white/10',
      Lost: 'bg-red-900/40 text-red-400 border-red-400/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${map[status]}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    const map: Record<LeadPriority, string> = {
      High: 'bg-red-900/30 text-red-400 border-red-500/20',
      Medium: 'bg-amber-900/30 text-amber-400 border-amber-500/20',
      Low: 'bg-gray-800/40 text-gray-400 border-white/5'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${map[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {isManager ? 'Lead Management' : 'My Leads'}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#161616] text-[#00f2ff] border border-white/10 font-mono">
              {filteredLeads.length} leads
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isManager
              ? 'Filter, prioritize, score with AI, and assign leads across the sales team.'
              : 'Execute calling campaigns on your prioritized prospect pipeline.'}
          </p>
        </div>

        {/* Manager Action Buttons */}
        {isManager && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {selectedLeadIds.length > 0 && (
              <button
                onClick={() => {
                  const targetLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
                  onOpenAssignModal(targetLeads);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 text-xs font-bold transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" /> Bulk Assign ({selectedLeadIds.length})
              </button>
            )}

            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> IMPORT CSV
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4" /> ADD LEAD
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-lg bg-[#121212] border border-white/5 space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Intelligence..."
              className="w-full bg-[#161616] border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:flex-1">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Converted">Converted</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Manager: Salesperson Filter */}
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

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
            >
              <option value="ALL">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="CSV Import">CSV Import</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-gray-500 uppercase font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00f2ff]"
            >
              <option value="score">AI Score (High to Low)</option>
              <option value="date">Date Created (Newest)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="rounded-lg bg-[#121212] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-gray-500 uppercase text-[10px] font-semibold border-b border-white/5">
              <tr>
                {isManager && (
                  <th className="p-4 text-center w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-gray-500 hover:text-[#00f2ff] cursor-pointer"
                    >
                      {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#00f2ff]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="p-4 font-semibold">Lead Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">AI Score</th>
                <th className="p-4 font-semibold text-center">Conversion Probability</th>
                {isManager && <th className="p-4 font-semibold">Assignee</th>}
                <th className="p-4 font-semibold">Next Follow-up</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 8 : 7} className="p-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-gray-300">No leads found</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Try clearing your search terms or filters to view available leads.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] text-[#00f2ff] border border-white/10 text-xs font-semibold cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const score = lead.aiAnalysis?.score || 50;
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-white/5 transition-colors ${
                        isSelected ? 'bg-[#00f2ff]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      {isManager && (
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleSelectOne(lead.id)}
                            className="text-gray-500 hover:text-[#00f2ff] cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#00f2ff]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Lead Name & Company */}
                      <td className="p-4">
                        <div>
                          <button
                            onClick={() => onOpenLeadDetail(lead)}
                            className="font-medium text-white hover:text-[#00f2ff] transition-colors text-left cursor-pointer"
                          >
                            {lead.name}
                          </button>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <span className="truncate max-w-[150px]">{lead.company}</span>
                            <span className="text-gray-600">• {lead.source}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">{getStatusBadge(lead.status)}</td>

                      {/* AI Score Badge + "Why?" */}
                      <td className="p-4 font-mono text-[#00f2ff]">
                        <span className="font-bold text-sm">{score}</span>
                        <button
                          onClick={() => onOpenAiExplainer(lead)}
                          className="ml-2 text-gray-500 hover:text-white underline text-[9px] cursor-pointer"
                        >
                          WHY?
                        </button>
                      </td>

                      {/* Conversion Probability Bar */}
                      <td className="p-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${score > 70 ? 'bg-[#00f2ff] shadow-[0_0_5px_#00f2ff]' : score > 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 w-7 text-right">
                            {score}%
                          </span>
                        </div>
                      </td>

                      {/* Assigned Salesperson (Manager only) */}
                      {isManager && (
                        <td className="p-4 text-gray-300 font-medium">
                          {lead.assignedToName || 'Unassigned'}
                        </td>
                      )}

                      {/* Next Follow-up */}
                      <td className="p-4">
                        {lead.nextFollowUpAt ? (
                          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            {new Date(lead.nextFollowUpAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onStartCall(lead)}
                            className="p-1.5 rounded bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold transition-all shadow-[0_0_8px_rgba(0,242,255,0.3)] cursor-pointer"
                            title="Start Call"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenLeadDetail(lead)}
                            className="p-1.5 rounded bg-[#161616] hover:bg-[#1f1f1f] text-gray-300 border border-white/10 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isManager && (
                            <>
                              <button
                                onClick={() => onOpenAssignModal([lead])}
                                className="p-1.5 rounded bg-[#161616] hover:bg-[#1f1f1f] text-[#00f2ff] border border-white/10 transition-colors cursor-pointer"
                                title="Reassign Lead"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmId(lead.id)}
                                className="p-1.5 rounded bg-[#161616] hover:bg-red-500/20 text-red-400 border border-white/10 transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121212] border border-white/10 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Lead Deletion</h3>
            </div>
            <p className="text-xs text-gray-400">
              Are you sure you want to delete this lead record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs text-gray-400 hover:text-white bg-[#161616] rounded-md cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId) onDeleteLead(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-black bg-red-500 hover:bg-red-400 rounded-md shadow-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

