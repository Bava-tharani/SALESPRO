import React, { useEffect, useState } from 'react';
import { Lead, User } from '../types';
import {
  PhoneIncoming,
  PhoneOff,
  PhoneForwarded,
  Sparkles,
  Building2,
  Phone,
  UserCheck,
  ShieldCheck,
  Zap,
  Flame
} from 'lucide-react';
import { audioSynth, displayPhoneNumber } from '../services/telephonyProvider';

interface Props {
  incomingLead: Lead;
  availableSalespeople: User[];
  onAccept: (lead: Lead) => void;
  onDecline: (lead: Lead) => void;
  onForward: (lead: Lead, targetSalespersonId: string) => void;
}

export const IncomingCallModal: React.FC<Props> = ({
  incomingLead,
  availableSalespeople,
  onAccept,
  onDecline,
  onForward
}) => {
  const [showForwardDropdown, setShowForwardDropdown] = useState(false);
  const [ringCount, setRingCount] = useState(0);

  // Play incoming ringtone pulse every 3 seconds
  useEffect(() => {
    const ringInterval = setInterval(() => {
      audioSynth.playRingPulse();
      setRingCount((c) => c + 1);
    }, 2800);

    // Initial ring
    audioSynth.playRingPulse();

    return () => clearInterval(ringInterval);
  }, []);

  const aiScore = incomingLead.aiAnalysis?.score || 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121212] border-2 border-[#00f2ff]/60 rounded-xl shadow-[0_0_50px_rgba(0,242,255,0.25)] overflow-hidden">
        {/* Animated Top Pulse Banner */}
        <div className="bg-gradient-to-r from-[#00f2ff]/20 via-[#00f2ff]/30 to-[#00f2ff]/20 px-6 py-3 border-b border-[#00f2ff]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00f2ff]"></span>
            </span>
            <span className="text-xs font-black text-[#00f2ff] uppercase tracking-widest flex items-center gap-1.5">
              <PhoneIncoming className="w-4 h-4 animate-bounce" /> INCOMING WEBRTC CARRIER CALL
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-gray-400 bg-black/50 px-2 py-0.5 rounded border border-white/10">
            Ringing • Ring #{ringCount + 1}
          </span>
        </div>

        {/* Prospect Identification Card */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-black/50 border-2 border-[#00f2ff] flex items-center justify-center text-[#00f2ff] font-extrabold text-2xl shadow-[0_0_20px_rgba(0,242,255,0.3)] shrink-0">
              {incomingLead.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white truncate">{incomingLead.name}</h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                    incomingLead.priority === 'High'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-white/5 text-gray-300 border-white/10'
                  }`}
                >
                  {incomingLead.priority} Priority
                </span>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{incomingLead.company || 'Direct Contact'}</span>
              </div>

              <div className="text-xs text-[#00f2ff] font-mono flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3 h-3 text-[#00f2ff]" />
                {displayPhoneNumber(incomingLead.phone)}
              </div>
            </div>
          </div>

          {/* AI Intelligence Match Pill */}
          <div className="p-3.5 rounded-lg bg-[#161616] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" /> CRM Matched Profile
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
                  AI Lead Score: {aiScore}/100
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {incomingLead.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 italic line-clamp-2 bg-black/40 p-2 rounded border border-white/5">
              "{incomingLead.notes || 'Inbound inquiry from website pricing form.'}"
            </p>

            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
              <span>Buying Intent: <strong className="text-white">{incomingLead.aiAnalysis?.buyingIntent || 'High'}</strong></span>
              <span>Trunk: <strong className="text-[#00f2ff] font-mono">SIP-Direct-Mumbai</strong></span>
            </div>
          </div>

          {/* Forward Dropdown if selected */}
          {showForwardDropdown && (
            <div className="p-3.5 rounded-lg bg-black/60 border border-white/10 space-y-2 animate-fadeIn">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Select Online Sales Representative to Forward:
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
                {availableSalespeople.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => onForward(incomingLead, sp.id)}
                    className="flex items-center justify-between p-2 rounded bg-[#161616] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 border border-white/5 text-left text-xs transition-all cursor-pointer"
                  >
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#00f2ff]" /> {sp.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{sp.phone || 'Available'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-5 border-t border-white/5 bg-[#121212] flex items-center justify-between gap-3">
          {/* Decline Button */}
          <button
            onClick={() => onDecline(incomingLead)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" /> Decline
          </button>

          {/* Forward Button */}
          <button
            onClick={() => setShowForwardDropdown(!showForwardDropdown)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <PhoneForwarded className="w-4 h-4 text-amber-400" /> Forward
          </button>

          {/* Accept Button */}
          <button
            onClick={() => onAccept(incomingLead)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all cursor-pointer"
          >
            <PhoneIncoming className="w-4 h-4 animate-pulse" /> Accept Call
          </button>
        </div>
      </div>
    </div>
  );
};
