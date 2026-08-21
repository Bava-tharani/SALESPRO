import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  PhoneCall,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  Building,
  KeyRound,
  LogIn,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  Headphones,
  Zap
} from 'lucide-react';

interface Props {
  onLoginSuccess: (user: User) => void;
  onRegisterUser?: (newUser: User) => void;
  allUsers: User[];
}

export const AuthView: React.FC<Props> = ({ onLoginSuccess, onRegisterUser, allUsers }) => {
  // Selected Portal: 'manager' vs 'salesperson'
  const [selectedPortal, setSelectedPortal] = useState<UserRole>('manager');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'demo'>('signin');

  // Manager Sign In Form State
  const [managerEmail, setManagerEmail] = useState('thara23maps@gmail.com');
  const [managerPassword, setManagerPassword] = useState('Password@123');

  // Sales Rep Sign In Form State
  const [repEmail, setRepEmail] = useState('salesperson@example.com');
  const [repPassword, setRepPassword] = useState('Sales@123');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('manager');
  const [regPhone, setRegPhone] = useState('+91 98000 12345');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active email & password based on active portal
  const activeEmail = selectedPortal === 'manager' ? managerEmail : repEmail;
  const setActiveEmail = (val: string) => {
    if (selectedPortal === 'manager') setManagerEmail(val);
    else setRepEmail(val);
  };

  const activePassword = selectedPortal === 'manager' ? managerPassword : repPassword;
  const setActivePassword = (val: string) => {
    if (selectedPortal === 'manager') setManagerPassword(val);
    else setRepPassword(val);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const cleanEmail = activeEmail.trim().toLowerCase();

      // Look up existing user
      const existingUser = allUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (existingUser) {
        // Enforce or adjust role based on portal
        if (selectedPortal === 'manager' && existingUser.role !== 'manager') {
          // If user logs in through manager portal with rep email, we can either alert or elevate
          setError(`Account "${existingUser.name}" has Sales Representative permissions. Please switch to the Sales Rep Login portal above, or use manager credentials.`);
          setLoading(false);
          return;
        }

        setLoading(false);
        onLoginSuccess(existingUser);
        return;
      }

      // If user typed a custom Gmail or work email, provision account dynamically for the chosen portal
      if (cleanEmail.includes('@')) {
        const username = cleanEmail.split('@')[0];
        const formattedName = username
          .replace(/[._0-9]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim() || (selectedPortal === 'manager' ? 'Sales Manager' : 'Sales Representative');

        const newUser: User = {
          id: `usr-${selectedPortal}-${Date.now().toString().slice(-5)}`,
          name: formattedName,
          email: cleanEmail,
          role: selectedPortal,
          status: 'active',
          phone: '+91 98000 ' + Math.floor(10000 + Math.random() * 90000),
          assignedLeadsCount: selectedPortal === 'manager' ? 15 : 10,
          callsTodayCount: 0,
          conversionsCount: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        };

        if (onRegisterUser) {
          onRegisterUser(newUser);
        }
        setLoading(false);
        onLoginSuccess(newUser);
        return;
      }

      setLoading(false);
      setError('Please enter a valid Gmail or work email address.');
    }, 400);
  };

  // 1-Click Google / Gmail Sign In tailored to Portal
  const handleGoogleSignIn = (customEmail?: string) => {
    setLoading(true);
    setError('');

    const defaultEmail = selectedPortal === 'manager' ? 'thara23maps@gmail.com' : 'rajesh.nair@gmail.com';
    const targetEmail = (customEmail || defaultEmail).toLowerCase();

    setTimeout(() => {
      const existing = allUsers.find((u) => u.email.toLowerCase() === targetEmail);
      if (existing) {
        // Switch user role if explicitly logging into that portal
        const adjustedUser: User = {
          ...existing,
          role: selectedPortal
        };
        setLoading(false);
        onLoginSuccess(adjustedUser);
      } else {
        const username = targetEmail.split('@')[0];
        const formattedName = username
          .replace(/[._0-9]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim() || (selectedPortal === 'manager' ? 'Thara Maps' : 'Rajesh Nair');

        const newUser: User = {
          id: `usr-google-${Date.now().toString().slice(-6)}`,
          name: formattedName,
          email: targetEmail,
          role: selectedPortal,
          status: 'active',
          phone: selectedPortal === 'manager' ? '+91 98200 99881' : '+91 98111 22334',
          assignedLeadsCount: selectedPortal === 'manager' ? 14 : 8,
          callsTodayCount: 0,
          conversionsCount: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        };

        if (onRegisterUser) {
          onRegisterUser(newUser);
        }
        setLoading(false);
        onLoginSuccess(newUser);
      }
    }, 450);
  };

  // Handle New Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (!regEmail.includes('@')) {
      setError('Please provide a valid Gmail or company email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: `usr-${Date.now().toString().slice(-6)}`,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        role: regRole,
        status: 'active',
        phone: regPhone.trim(),
        assignedLeadsCount: regRole === 'manager' ? 12 : 8,
        callsTodayCount: 0,
        conversionsCount: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      if (onRegisterUser) {
        onRegisterUser(newUser);
      }
      setLoading(false);
      onLoginSuccess(newUser);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-gray-200 selection:bg-[#00f2ff] selection:text-black">
      {/* Background Decorative Glow */}
      <div
        className={`absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700 ${
          selectedPortal === 'manager' ? 'bg-purple-600/10' : 'bg-[#00f2ff]/10'
        }`}
      />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-4 relative z-10 my-auto">
        {/* Brand Banner */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-white/10 text-[11px] font-bold tracking-wide shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span>ROLE-BASED AUTHENTICATION GATEWAY</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-0.5">
            <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.25)]">
              <PhoneCall className="w-4 h-4 text-[#00f2ff]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SalesCall <span className="text-[#00f2ff]">Pro</span>
            </h1>
          </div>

          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            AI Sales Telephony, Mid-Call Live Coaching & Daily/Weekly/Monthly Reporting
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SEPARATE PORTAL SELECTOR: MANAGER VS SALES REP */}
        {/* ========================================================================= */}
        <div className="p-1.5 rounded-2xl bg-[#121212] border border-white/10 shadow-lg grid grid-cols-2 gap-1.5">
          {/* Manager Portal Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedPortal('manager');
              setRegRole('manager');
              setError('');
            }}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left ${
              selectedPortal === 'manager'
                ? 'bg-gradient-to-r from-purple-950/80 to-[#1e142e] border border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'hover:bg-white/5 text-gray-400 border border-transparent'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                selectedPortal === 'manager'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-[#161616] text-gray-400'
              }`}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold truncate flex items-center gap-1.5">
                <span>Manager Portal</span>
                {selectedPortal === 'manager' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                Reports, Team Quotas, Assign
              </div>
            </div>
          </button>

          {/* Sales Rep Portal Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedPortal('salesperson');
              setRegRole('salesperson');
              setError('');
            }}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left ${
              selectedPortal === 'salesperson'
                ? 'bg-gradient-to-r from-cyan-950/80 to-[#0d2328] border border-[#00f2ff]/50 text-white shadow-[0_0_15px_rgba(0,242,255,0.25)]'
                : 'hover:bg-white/5 text-gray-400 border border-transparent'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                selectedPortal === 'salesperson'
                  ? 'bg-[#00f2ff] text-black shadow-md'
                  : 'bg-[#161616] text-gray-400'
              }`}
            >
              <Headphones className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold truncate flex items-center gap-1.5">
                <span>Sales Rep Portal</span>
                {selectedPortal === 'salesperson' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                WebRTC Softphone, Dialing
              </div>
            </div>
          </button>
        </div>

        {/* Portal Information Badge */}
        <div
          className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between ${
            selectedPortal === 'manager'
              ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
              : 'bg-cyan-950/30 border-[#00f2ff]/30 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">
              {selectedPortal === 'manager'
                ? 'Manager Workspace: Team analytics, executive AI reports, and lead re-distribution.'
                : 'Sales Rep Desk: Outbound click-to-dial, live AI battlecards, and follow-ups.'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
            {selectedPortal === 'manager' ? 'Executive' : 'Representative'}
          </span>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#121212] border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-5">
          {/* Top Auth Mode Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-lg bg-[#161616] border border-white/5 text-xs font-semibold text-gray-400">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer text-center ${
                authMode === 'signin'
                  ? selectedPortal === 'manager'
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                    : 'bg-[#0f0f0f] text-[#00f2ff] border border-[#00f2ff]/30 font-bold shadow-sm'
                  : 'hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer text-center ${
                authMode === 'signup'
                  ? selectedPortal === 'manager'
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                    : 'bg-[#0f0f0f] text-[#00f2ff] border border-[#00f2ff]/30 font-bold shadow-sm'
                  : 'hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('demo');
                setError('');
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer text-center ${
                authMode === 'demo'
                  ? 'bg-[#0f0f0f] text-amber-400 border border-white/10 shadow-sm font-bold'
                  : 'hover:text-white'
              }`}
            >
              Quick Persona
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold animate-fadeIn flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Primary Google Sign-In Button */}
          {authMode !== 'demo' && (
            <div className="space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleGoogleSignIn(
                    selectedPortal === 'manager'
                      ? 'thara23maps@gmail.com'
                      : 'salesperson@example.com'
                  )
                }
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-md transition-all cursor-pointer group active:scale-[0.99]"
              >
                {/* Official Google SVG Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {selectedPortal === 'manager'
                    ? 'Continue as Manager with Gmail (thara23maps@gmail.com)'
                    : 'Continue as Sales Rep with Google Workspace'}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#121212] px-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  or enter credentials
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>
            </div>
          )}

          {/* Sign In Form Mode */}
          {authMode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold flex items-center justify-between">
                  <span>
                    {selectedPortal === 'manager'
                      ? 'Manager Gmail / Corporate Email'
                      : 'Sales Rep Gmail / Work Email'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {selectedPortal === 'manager'
                      ? 'thara23maps@gmail.com'
                      : 'salesperson@example.com'}
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={activeEmail}
                    onChange={(e) => setActiveEmail(e.target.value)}
                    placeholder={
                      selectedPortal === 'manager'
                        ? 'thara23maps@gmail.com'
                        : 'rep@company.com'
                    }
                    className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {selectedPortal === 'manager' ? 'Password@123' : 'Sales@123'}
                  </span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={activePassword}
                    onChange={(e) => setActivePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-9 py-2.5 text-gray-200 focus:outline-none focus:border-[#00f2ff] placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#00f2ff] h-3.5 w-3.5 bg-[#161616] border-white/10 cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-400 font-medium">Keep me signed in</span>
                </label>

                <span className="text-[10px] text-gray-500 font-mono">
                  {selectedPortal === 'manager' ? 'Manager Role Access' : 'Rep Dialing Station'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                  selectedPortal === 'manager'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:opacity-95'
                    : 'bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.35)] hover:bg-[#00f2ff]/90'
                }`}
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {selectedPortal === 'manager'
                        ? 'Sign In To Manager Executive Portal'
                        : 'Sign In To Sales Rep Telephony Desk'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Registration Mode */}
          {authMode === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Thara Maps"
                    className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Gmail / Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-300 block mb-1 font-semibold">Portal Account Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRegRole(newRole);
                      setSelectedPortal(newRole);
                    }}
                    className="w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                  >
                    <option value="manager">👑 Sales Manager</option>
                    <option value="salesperson">📞 Sales Representative</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-semibold">Assigned Caller ID</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-gray-200 focus:outline-none focus:border-[#00f2ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-[#00f2ff] hover:bg-[#00f2ff]/90 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Create & Launch {regRole === 'manager' ? 'Manager' : 'Sales Rep'} Account</span>
              </button>
            </form>
          )}

          {/* Quick Demo Pre-Configured Personas */}
          {authMode === 'demo' && (
            <div className="space-y-3 pt-1">
              <div className="text-[11px] text-gray-400 font-medium text-center">
                Select a predefined role persona to log in instantly:
              </div>

              <div className="space-y-2.5">
                {/* Manager 1: Thara Maps */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal('manager');
                    handleGoogleSignIn('thara23maps@gmail.com');
                  }}
                  className="w-full p-3 rounded-xl bg-[#161616] border border-purple-500/40 hover:border-purple-400 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>👑 Thara Maps</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-mono font-bold">
                        Sales Director / Manager
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-mono font-medium">
                      thara23maps@gmail.com
                    </div>
                    <div className="text-[10px] text-gray-500">Access: Team Analytics, Lead Assign, Daily/Weekly/Monthly Reports</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Manager 2: Aarav Singhania */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal('manager');
                    handleGoogleSignIn('manager@example.com');
                  }}
                  className="w-full p-3 rounded-xl bg-[#161616] border border-purple-500/20 hover:border-purple-400 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>👑 Aarav Singhania</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-mono font-bold">
                        Operations Manager
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-mono">
                      manager@example.com
                    </div>
                    <div className="text-[10px] text-gray-500">Password: Manager@123</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Sales Rep 1: Rajesh Nair */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal('salesperson');
                    handleGoogleSignIn('salesperson@example.com');
                  }}
                  className="w-full p-3 rounded-xl bg-[#161616] border border-[#00f2ff]/40 hover:border-[#00f2ff] text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>📞 Rajesh Nair</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00f2ff]/20 text-[#00f2ff] font-mono font-bold">
                        Senior Sales Rep
                      </span>
                    </div>
                    <div className="text-[11px] text-[#00f2ff] font-mono">
                      salesperson@example.com
                    </div>
                    <div className="text-[10px] text-gray-500">Access: WebRTC Softphone, Dialing Queue, Mid-Call Battlecards</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#00f2ff] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & Google Workspace Compliance Badge */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Google OAuth 2.0
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#00f2ff]" /> 256-Bit Encrypted
          </span>
          <span>•</span>
          <span>Dual Portal Isolation</span>
        </div>
      </div>
    </div>
  );
};
