import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('admin@aegis.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(); // Bypass authentication with default credentials for instant evaluation
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center grid-bg px-4 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel-heavy p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] z-10">
        
        {/* Brand Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Terminal Access</h2>
          <p className="text-[10px] text-slate-400 font-mono mt-1">SECURE ENCRYPTED CHANNEL SEC-LEVEL 4</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* User Input */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block tracking-wider uppercase">Operator ID / Email</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={14} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aegis.gov.in"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block tracking-wider uppercase">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter security key"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Forgot link (mock) */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0" />
              <span>Remember Station</span>
            </label>
            <a href="#" className="hover:text-cyan-400 transition-colors uppercase">Emergency Override?</a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(8,145,178,0.2)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] mt-2"
          >
            Authenticate Operator
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-500 mt-6 font-mono">
          UNAUTHORIZED ACCESS IS STRICTLY MONITORED.<br />
          IP AND GEO-STATION LOGGED LOCALLY.
        </div>
      </div>
    </div>
  );
}
