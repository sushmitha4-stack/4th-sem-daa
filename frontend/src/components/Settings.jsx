import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, RefreshCcw, ShieldCheck } from 'lucide-react';

export default function Settings({ settings = {}, onUpdateSettings = null, onResetSystem = null }) {
  const [trafficWeight, setTrafficWeight] = useState(settings.trafficWeight || 1.5);
  const [dispatchAlgorithm, setDispatchAlgorithm] = useState(settings.dispatchAlgorithm || "Hungarian");
  const [maxResponseTimer, setMaxResponseTimer] = useState(settings.maxResponseTimer || 15);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!onUpdateSettings) return;
    setSaving(true);
    await onUpdateSettings({
      trafficWeight: parseFloat(trafficWeight),
      dispatchAlgorithm,
      maxResponseTimer: parseInt(maxResponseTimer)
    });
    setSaving(false);
  };

  const handleReset = async () => {
    if (!onResetSystem || !window.confirm("Are you sure you want to re-seed the system graph and clear current logs?")) return;
    setResetting(true);
    await onResetSystem();
    setResetting(false);
    alert("System database reset completed.");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">System Settings</h2>
        <p className="text-xs text-slate-400 font-mono">Configure algorithm coefficients, matching parameters, and database state operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Settings Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <SettingsIcon size={16} className="text-cyan-400" /> Operational Parameters
          </h3>

          <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
            {/* Traffic weight index */}
            <div className="space-y-1.5">
              <label className="text-slate-400 block uppercase tracking-wider">Default Traffic Weight Exponent</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="3.0"
                value={trafficWeight}
                onChange={(e) => setTrafficWeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              />
              <p className="text-[9px] text-slate-500 leading-relaxed">
                Modulates Dijkstra route computation penalties based on live road density updates. Higher means heavier traffic avoidances.
              </p>
            </div>

            {/* Matching algorithm dropdown */}
            <div className="space-y-1.5">
              <label className="text-slate-400 block uppercase tracking-wider">Global Dispatching Algorithm</label>
              <select
                value={dispatchAlgorithm}
                onChange={(e) => setDispatchAlgorithm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Hungarian">Hungarian Algorithm (Optimizes global wait times)</option>
                <option value="Greedy">Greedy Selection (Matches closest local units)</option>
              </select>
            </div>

            {/* Max response time SLA */}
            <div className="space-y-1.5">
              <label className="text-slate-400 block uppercase tracking-wider">Target SLA Max Response Time (mins)</label>
              <input
                type="number"
                value={maxResponseTimer}
                onChange={(e) => setMaxResponseTimer(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            >
              {saving ? "Saving..." : "Save Parameters"}
            </button>
          </form>
        </div>

        {/* Database seed reset Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold uppercase text-rose-500 tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Database size={16} /> Data State & Seeding overrides
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Reseed database entries to original state. Toggling this triggers the clear-down of session emergencies, resets hospital ICU beds availability, and repositions the standby ambulances back to original Bangalore hubs (RVCE, Majestic, Hebbal, Koramangala, etc.).
          </p>

          <div className="pt-2">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
            >
              <RefreshCcw size={14} className={resetting ? 'animate-spin' : ''} />
              {resetting ? "Resetting System..." : "Force Reseed Database"}
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-[10px] font-mono text-slate-500 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck size={12} className="text-emerald-400" /> State integrity verify:
            </div>
            <div>• Database: Dual MongoDB/JSON Fallback</div>
            <div>• Grid Coordinate Seed: Bangalore City Intersections</div>
            <div>• Map Rendering: Interactive Vector Canvas</div>
          </div>
        </div>

      </div>

    </div>
  );
}
