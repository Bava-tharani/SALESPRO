import React, { useState } from 'react';
import { User, TelephonyConfig, TelephonyProviderType, ComplianceJurisdiction } from '../types';
import {
  User as UserIcon,
  Lock,
  Bell,
  CheckCircle2,
  Save,
  Shield,
  PhoneCall,
  Radio,
  Sparkles,
  Volume2,
  Mic,
  ShieldCheck,
  Server
} from 'lucide-react';
import { DEFAULT_TELEPHONY_CONFIG } from '../services/telephonyProvider';

interface Props {
  currentUser: User;
  onUpdateProfile: (updated: Partial<User>) => void;
}

export const SettingsView: React.FC<Props> = ({ currentUser, onUpdateProfile }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98000 00000');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifFollowUps, setNotifFollowUps] = useState(true);
  const [notifNewLeads, setNotifNewLeads] = useState(true);
  const [notifAssignments, setNotifAssignments] = useState(true);

  // Telephony Config State
  const [telephonyConfig, setTelephonyConfig] = useState<TelephonyConfig>(() => {
    const saved = localStorage.getItem('salescall_telephony_config');
    return saved ? JSON.parse(saved) : DEFAULT_TELEPHONY_CONFIG;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      phone
    });
    localStorage.setItem('salescall_telephony_config', JSON.stringify(telephonyConfig));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          System Settings & Telephony Gateway
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure profile details, WebRTC softphone carrier gateways, real-time STT models, and regulatory compliance.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Settings, profile, and telephony configurations updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <UserIcon className="w-4 h-4 text-[#00f2ff]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Assigned Outbound Caller ID</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Assigned Role</label>
              <div className="px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-gray-300 capitalize font-medium flex items-center justify-between">
                <span>{currentUser.role}</span>
                <Shield className="w-3.5 h-3.5 text-[#00f2ff]" />
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3 Telephony Gateway & Softphone Configuration */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#00f2ff]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Telephony Gateway & WebRTC Softphone
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
              Phase 3 Softphone Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Telephony Provider Interface</label>
              <select
                value={telephonyConfig.defaultProvider}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    defaultProvider: e.target.value as TelephonyProviderType
                  })
                }
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                <option value="webrtc">Native WebRTC In-Browser Softphone</option>
                <option value="twilio">Twilio Voice SDK Gateway</option>
                <option value="plivo">Plivo WebRTC Trunk</option>
                <option value="agora">Agora RTC Cloud Softphone</option>
                <option value="sip">SIP PBX Direct Gateway</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Real-Time STT Engine Vendor</label>
              <select
                value={telephonyConfig.sttVendor}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    sttVendor: e.target.value as any
                  })
                }
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                <option value="deepgram">Deepgram Nova-2 (Dual-Channel 48kHz)</option>
                <option value="openai">OpenAI Realtime Whisper</option>
                <option value="assemblyai">AssemblyAI Streaming Speech</option>
                <option value="browser_webspeech">Browser Web Speech API</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Primary Carrier SIP Trunk</label>
              <input
                type="text"
                value={telephonyConfig.primaryTrunk}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    primaryTrunk: e.target.value
                  })
                }
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Regulatory Compliance Jurisdiction</label>
              <select
                value={telephonyConfig.jurisdiction}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    jurisdiction: e.target.value as ComplianceJurisdiction
                  })
                }
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              >
                <option value="IN-TRAI">India (TRAI / DoT Telecom Regulations)</option>
                <option value="EU-GDPR">European Union (GDPR Article 6 Consent)</option>
                <option value="US-Two-Party">United States (Two-Party Consent - CA/FL/MA)</option>
                <option value="US-One-Party">United States (Federal One-Party Consent)</option>
              </select>
            </div>
          </div>

          {/* Telephony Audio & Compliance Toggles */}
          <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={telephonyConfig.dualChannelAudio}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    dualChannelAudio: e.target.checked
                  })
                }
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">
                Dual-Channel Audio Recording (Channel 0 Rep / Channel 1 Customer isolated audio streams)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={telephonyConfig.autoConsentDisclaimer}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    autoConsentDisclaimer: e.target.checked
                  })
                }
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">
                Automated Voice Compliance Consent announcement on call pick-up
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={telephonyConfig.dtmfToneAudio}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    dtmfToneAudio: e.target.checked
                  })
                }
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">
                Audible Web Audio DTMF tone synthesizer feedback on keypress
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={telephonyConfig.holdMusicAudio}
                onChange={(e) =>
                  setTelephonyConfig({
                    ...telephonyConfig,
                    holdMusicAudio: e.target.checked
                  })
                }
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">
                Synthesized Ambient Hold Music loop during active call hold
              </span>
            </label>
          </div>
        </div>

        {/* Password Security Card */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Security & Password</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
              />
            </div>
          </div>
        </div>

        {/* Notifications Preferences */}
        <div className="p-5 rounded-lg bg-[#121212] border border-white/5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Notification Alerts</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifFollowUps}
                onChange={(e) => setNotifFollowUps(e.target.checked)}
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">Follow-up due alerts and 15-minute reminders</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifNewLeads}
                onChange={(e) => setNotifNewLeads(e.target.checked)}
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">New high-priority lead arrival notifications</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifAssignments}
                onChange={(e) => setNotifAssignments(e.target.checked)}
                className="rounded accent-[#00f2ff] h-4 w-4 bg-[#161616] border-white/10 cursor-pointer"
              />
              <span className="text-gray-300 font-medium">Manager lead assignment & re-assignment alerts</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-extrabold rounded-lg shadow-[0_0_12px_rgba(0,242,255,0.3)] text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> SAVE ALL CONFIGURATIONS
          </button>
        </div>
      </form>
    </div>
  );
};
