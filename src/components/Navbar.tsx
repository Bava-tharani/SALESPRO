import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import {
  PhoneCall,
  Bell,
  Check,
  Shield,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  LogOut,
  Sliders,
  CheckCheck,
  Radio,
  Search
} from 'lucide-react';

interface Props {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  activeCallLeadName?: string;
  onOpenCallingDrawer?: () => void;
  onTriggerInboundCall?: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  activeCallLeadName,
  onOpenCallingDrawer,
  onTriggerInboundCall
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const userNotifs = notifications.filter(
    (n) => n.userId === currentUser.id || currentUser.role === 'manager'
  );
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0f0f0f] border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
      {/* Brand & Active Call Indicator */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00f2ff] flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.35)]">
            <div className="w-4 h-4 bg-black rotate-45 flex items-center justify-center">
              <PhoneCall className="w-2.5 h-2.5 text-[#00f2ff] -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white uppercase font-sans">
                SALES<span className="text-[#00f2ff]">PRO</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 tracking-wider">
                AI ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-gray-500 hidden sm:block font-medium">
              Enterprise Lead & Call Intelligence
            </p>
          </div>
        </div>

        {/* Test Incoming Call Trigger */}
        {onTriggerInboundCall && !activeCallLeadName && (
          <button
            onClick={onTriggerInboundCall}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161616] hover:bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-[11px] font-bold transition-all cursor-pointer shadow-sm group"
            title="Simulate incoming WebRTC carrier call"
          >
            <Radio className="w-3 h-3 text-[#00f2ff] animate-pulse group-hover:scale-110 transition-transform" />
            <span>Simulate Inbound Call</span>
          </button>
        )}

        {/* Quick Toggle Manager / Salesperson Pill */}
        <div className="hidden md:flex bg-[#161616] rounded-full p-1 border border-white/5 items-center">
          <button
            onClick={() => {
              const mgr = allUsers.find((u) => u.role === 'manager');
              if (mgr) onSwitchUser(mgr);
            }}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
              currentUser.role === 'manager'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_8px_rgba(0,242,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            MANAGER
          </button>
          <button
            onClick={() => {
              const rep = allUsers.find((u) => u.role === 'salesperson');
              if (rep) onSwitchUser(rep);
            }}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
              currentUser.role === 'salesperson'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_8px_rgba(0,242,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SALES REP
          </button>
        </div>

        {/* Active Call Live Status Banner in Header */}
        {activeCallLeadName && (
          <div
            onClick={onOpenCallingDrawer}
            className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] text-xs font-semibold animate-pulse"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Active Call: {activeCallLeadName}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Switch Specific User, Notifications, User Profile */}
      <div className="flex items-center gap-4">
        {/* Switch Persona Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] border border-white/10 text-xs font-semibold text-gray-200 transition-all cursor-pointer"
          >
            {currentUser.role === 'manager' ? (
              <Shield className="w-3.5 h-3.5 text-[#00f2ff]" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-[#00f2ff]" />
            )}
            <span>Switch User</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {/* Role Switcher Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#121212] border border-white/10 rounded-lg shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Select Team Persona
              </div>
              <div className="space-y-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30'
                        : 'text-gray-300 hover:bg-[#161616]'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold flex items-center gap-1.5 text-white">
                        {u.name}
                        {u.role === 'manager' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 border border-purple-400/30">
                            Manager
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500">{u.email}</div>
                    </div>
                    {u.id === currentUser.id && <Check className="w-4 h-4 text-[#00f2ff]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-gray-400 hover:text-white bg-[#161616] hover:bg-[#1f1f1f] border border-white/10 rounded-lg transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00f2ff] text-black font-black text-[9px] rounded-full flex items-center justify-center shadow-[0_0_6px_#00f2ff]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121212] border border-white/10 rounded-lg shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#00f2ff]" /> Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[10px] text-[#00f2ff] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 mt-1">
                {userNotifs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  userNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-2.5 rounded-md transition-colors cursor-pointer text-xs ${
                        !n.read ? 'bg-[#161616]' : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Avatar & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="hidden lg:block text-right">
            <div className="text-xs font-bold text-white leading-none">{currentUser.name}</div>
            <div className="text-[10px] text-gray-500 mt-0.5 capitalize">{currentUser.role}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00f2ff]/20 border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] font-bold text-xs">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-[#161616] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

