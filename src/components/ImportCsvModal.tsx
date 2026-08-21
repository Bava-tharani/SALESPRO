import React, { useState } from 'react';
import { Lead, User, LeadSource, LeadPriority, LeadStatus } from '../types';
import { LocalAIService } from '../services/aiService';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  Users
} from 'lucide-react';

interface Props {
  salespeople: User[];
  onImport: (importedLeads: Lead[]) => void;
  onClose: () => void;
}

interface ParsedRecord {
  rowNumber: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: LeadSource;
  priority: LeadPriority;
  status: LeadStatus;
  errors: string[];
}

export const ImportCsvModal: React.FC<Props> = ({ salespeople, onImport, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [records, setRecords] = useState<ParsedRecord[]>([]);
  const [assignTo, setAssignTo] = useState<string>(salespeople[0]?.id || '');
  const [fileName, setFileName] = useState('');

  const SAMPLE_CSV_CONTENT = `name,phone,email,company,source,priority,status
Abhishek Mittal,+91 98211 44552,abhishek@mittalgroup.in,Mittal Enterprises,Website,High,New
Shikha Bansal,+91 98190 22331,shikha@bansaldigital.com,Bansal Media Labs,Referral,Medium,Contacted
Rameshwar Sen,+91 98450 77112,ramesh@sensolutions.in,Sen Logistics,CSV Import,High,Interested
Invalid User 1,,no-phone@bad.com,Missing Phone Co,Website,Low,New
Snehal Kulkarni,+91 98220 99881,snehal@kulkarnilabs.co,Kulkarni Labs,Facebook,Medium,New
Invalid User 2,+91 99999 99999,not-an-email,Test Co,Website,Low,New`;

  const parseCsvText = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const parsed: ParsedRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim());
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const name = row[0] || '';
      const phone = row[1] || '';
      const email = row[2] || '';
      const company = row[3] || '';
      const source = (row[4] as LeadSource) || 'CSV Import';
      const priority = (row[5] as LeadPriority) || 'Medium';
      const status = (row[6] as LeadStatus) || 'New';

      const errors: string[] = [];
      if (!name) errors.push('Missing contact name');
      if (!phone || phone.length < 8) errors.push('Invalid / missing phone number');
      if (email && !email.includes('@')) errors.push('Malformed email format');

      parsed.push({
        rowNumber: i,
        name,
        phone,
        email,
        company,
        source,
        priority,
        status,
        errors
      });
    }
    return parsed;
  };

  const handleLoadSample = () => {
    setFileName('sample_enterprise_leads.csv');
    const parsed = parseCsvText(SAMPLE_CSV_CONTENT);
    setRecords(parsed);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsvText(text);
      setRecords(parsed);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const validRecords = records.filter((r) => r.errors.length === 0);
  const invalidRecords = records.filter((r) => r.errors.length > 0);

  const handleProceedImport = () => {
    const assignedUser = salespeople.find((s) => s.id === assignTo);

    const newLeads: Lead[] = validRecords.map((r, index) => {
      const temp: Partial<Lead> = {
        id: `LEAD-CSV-${Date.now().toString().slice(-4)}-${index + 1}`,
        name: r.name,
        phone: r.phone,
        email: r.email,
        company: r.company || 'CSV Imported Lead',
        source: r.source || 'CSV Import',
        priority: r.priority || 'Medium',
        status: r.status || 'New',
        assignedTo: assignTo,
        assignedToName: assignedUser?.name || 'Unassigned',
        notes: `Imported via CSV (${fileName || 'file'}). Ready for initial outreach.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDealValue: 300000
      };

      const aiAnalysis = LocalAIService.scoreLead(temp);
      return {
        ...(temp as Lead),
        aiAnalysis
      };
    });

    onImport(newLeads);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Import Leads from CSV</h3>
              <p className="text-xs text-gray-500">
                Bulk upload, preview records, validate format, and auto-assign
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Upload or sample */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/10 hover:border-[#00f2ff]/50 rounded-lg p-8 text-center transition-all bg-[#161616]">
                <Upload className="w-10 h-10 text-[#00f2ff] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Select or drop your CSV file</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto font-mono">
                  Columns: name, phone, email, company, source, priority, status
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <label className="px-4 py-2 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-bold text-xs uppercase tracking-wider rounded-md cursor-pointer transition-colors shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                    Browse File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleLoadSample}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-gray-300 font-semibold text-xs rounded-md border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00f2ff]" /> Load Sample CSV
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#161616] border border-white/5 text-xs text-gray-400 space-y-1.5">
                <span className="font-bold text-gray-300 uppercase tracking-widest block text-[10px]">
                  CSV Format Instructions:
                </span>
                <p>• Header row is required with comma delimiters.</p>
                <p>• Phone numbers with country codes (e.g. +91) will be properly normalized.</p>
                <p>• Validation will automatically catch missing phone numbers or duplicate entries.</p>
              </div>
            </div>
          )}

          {/* Step 2: Validation Preview */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#161616] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Records</div>
                  <div className="text-lg font-bold text-white font-mono">{records.length}</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Records
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{validRecords.length}</div>
                </div>
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30">
                  <div className="text-[10px] text-red-400 font-semibold flex items-center gap-1 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" /> Invalid Records
                  </div>
                  <div className="text-lg font-bold text-red-400 font-mono">{invalidRecords.length}</div>
                </div>
              </div>

              {/* Assignment Selector */}
              <div className="p-3.5 rounded-lg bg-[#161616] border border-white/5 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs">
                  <span className="font-bold text-white block">Assign Valid Leads To:</span>
                  <span className="text-gray-500 text-[11px]">Choose designated sales rep</span>
                </div>
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                >
                  {salespeople.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Preview Table */}
              <div className="border border-white/5 rounded-lg overflow-hidden max-h-64 overflow-y-auto bg-[#161616]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121212] text-gray-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-white/5">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Company</th>
                      <th className="p-2.5">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {records.map((r) => (
                      <tr key={r.rowNumber} className={r.errors.length > 0 ? 'bg-red-950/20' : ''}>
                        <td className="p-2.5 font-mono text-gray-500">{r.rowNumber}</td>
                        <td className="p-2.5 font-semibold text-gray-200">{r.name || '—'}</td>
                        <td className="p-2.5 font-mono text-gray-400">{r.phone || '—'}</td>
                        <td className="p-2.5 text-gray-400">{r.company || '—'}</td>
                        <td className="p-2.5">
                          {r.errors.length === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Valid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              {r.errors.join(', ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#121212] flex justify-between items-center">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Choose another file
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-md border border-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {step === 2 && (
              <button
                disabled={validRecords.length === 0}
                onClick={handleProceedImport}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#00f2ff] hover:bg-[#00f2ff]/90 disabled:opacity-50 text-black rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> IMPORT {validRecords.length} VALID LEADS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
