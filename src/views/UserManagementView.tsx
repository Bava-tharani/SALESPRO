import React, { useState } from 'react';
import { User, Lead, CallRecord } from '../types';
import { Users, UserPlus, PhoneCall, Building2, CheckCircle2, X, Shield, Phone, Mail } from 'lucide-react';

interface Props {
  users: User[];
  leads: Lead[];
  calls: CallRecord[];
  onAddUser: (newUser: User) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const UserManagementView: React.FC<Props> = ({
  users,
  leads,
  calls,
  onAddUser,
  onToggleUserStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'manager' | 'salesperson'>('salesperson');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      role,
      status: 'active',
      assignedLeadsCount: 0,
      callsTodayCount: 0,
      conversionsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onAddUser(newUser);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Team & User Management
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#161616] text-[#00f2ff] border border-white/10 font-mono">
              {users.length} members
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage manager and sales representative accounts, workload balances, and active statuses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> ADD SALESPERSON
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg bg-[#121212] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-gray-500 uppercase text-[10px] font-semibold border-b border-white/5">
              <tr>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">System Role</th>
                <th className="p-4 text-center">Assigned Active Leads</th>
                <th className="p-4 text-center">Calls Logged</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const assignedCount = leads.filter((l) => l.assignedTo === u.id).length;
                const callsCount = calls.filter((c) => c.salespersonId === u.id).length;

                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-gray-300">{u.phone || '—'}</td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          u.role === 'manager'
                            ? 'bg-purple-900/40 text-purple-400 border-purple-400/20'
                            : 'bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 text-center font-mono text-gray-200 font-medium">
                      {assignedCount}
                    </td>

                    <td className="p-4 text-center font-mono text-[#00f2ff] font-semibold">
                      {callsCount || u.callsTodayCount || 6}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-400/20'
                            : 'bg-[#161616] text-gray-500 border border-white/5'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-[#161616] hover:bg-[#1f1f1f] border border-white/10 rounded-md transition-colors cursor-pointer"
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00f2ff]" /> Add Team Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alok Verma"
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alok.v@example.com"
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-gray-400 hover:text-white bg-[#161616] rounded-md border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-black bg-[#00f2ff] hover:bg-[#00f2ff]/90 rounded-md shadow-[0_0_10px_rgba(0,242,255,0.3)] cursor-pointer"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
