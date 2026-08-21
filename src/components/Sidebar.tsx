import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  CalendarClock,
  BarChart3,
  UserCheck,
  Settings,
  Sparkles,
  Shield,
  PhoneForwarded,
  Briefcase
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'leads'
  | 'calls'
  | 'followups'
  | 'reports'
  | 'users'
  | 'settings';

interface Props {
  role: UserRole;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  leadsCount: number;
  overdueFollowUpsCount: number;
  callsTodayCount: number;
}

export const Sidebar: React.FC<Props> = ({
  role,
  activeTab,
  onSelectTab,
  leadsCount,
  overdueFollowUpsCount,
  callsTodayCount
}) => {
  const managerNavItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as NavTab, label: 'Lead Management', icon: Briefcase, badge: leadsCount },
    { id: 'calls' as NavTab, label: 'Call Analytics', icon: PhoneCall, badge: callsTodayCount },
    { id: 'followups' as NavTab, label: 'Follow-ups', icon: CalendarClock, badge: overdueFollowUpsCount, badgeAlert: overdueFollowUpsCount > 0 },
    { id: 'reports' as NavTab, label: 'Team Reports', icon: BarChart3 },
    { id: 'users' as NavTab, label: 'Sales Team', icon: Users },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  const salespersonNavItems = [
    { id: 'dashboard' as NavTab, label: 'Calling Desk', icon: LayoutDashboard },
    { id: 'leads' as NavTab, label: 'My Leads', icon: Briefcase, badge: leadsCount },
    { id: 'calls' as NavTab, label: 'Call Analytics', icon: PhoneCall },
    { id: 'followups' as NavTab, label: 'Follow-ups', icon: CalendarClock, badge: overdueFollowUpsCount, badgeAlert: overdueFollowUpsCount > 0 },
    { id: 'reports' as NavTab, label: 'Performance Reports', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  const items = role === 'manager' ? managerNavItems : salespersonNavItems;

  return (
    <aside className="w-[230px] bg-[#0f0f0f] border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-4">
        {/* Portal Type Pill */}
        <div className="px-3 py-2 rounded-lg bg-[#161616] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {role === 'manager' ? (
              <Shield className="w-3.5 h-3.5 text-[#00f2ff]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
            )}
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
              {role === 'manager' ? 'Manager View' : 'Sales Rep Desk'}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#00f2ff] shadow-[0_0_6px_#00f2ff] animate-pulse" />
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00f2ff]/10 border-l-2 border-[#00f2ff] text-[#00f2ff]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f2ff]' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      item.badgeAlert
                        ? 'bg-red-900/40 text-red-400 border border-red-400/20 animate-pulse'
                        : isActive
                        ? 'bg-[#00f2ff]/20 text-[#00f2ff]'
                        : 'bg-[#161616] text-gray-400 border border-white/5'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Mini Card */}
      <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
        <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-1">System Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" />
          <span className="text-xs text-white font-medium">AI Engine: Active</span>
        </div>
      </div>
    </aside>
  );
};

