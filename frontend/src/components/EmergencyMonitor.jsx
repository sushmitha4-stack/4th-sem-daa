import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, Plus, CheckCircle, RefreshCcw } from 'lucide-react';

export default function EmergencyMonitor({ 
  nodes = [], 
  emergencies = [], 
  ambulances = [], 
  hospitals = [], 
  onReportEmergency = null, 
  onResolveEmergency = null,
  onRunGlobalMatching = null
}) {
  const [type, setType] = useState('Cardiac Arrest');
  const [severity, setSeverity] = useState('Critical');
  const [nodeId, setNodeId] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onReportEmergency) return;
    setSubmitting(true);
    await onReportEmergency({ type, severity, nodeId: Number(nodeId) });
    setSubmitting(false);
  };

  // Sort emergencies: Active first, ordered by priority score descending, then resolved
  const sortedEmergencies = [...emergencies].sort((a, b) => {
    if (a.status !== "Resolved" && b.status === "Resolved") return -1;
    if (a.status === "Resolved" && b.status !== "Resolved") return 1;
    if (a.status !== "Resolved" && b.status !== "Resolved") {
      return b.priority - a.priority; // higher priority first
    }
    return new Date(b.timestamp) - new Date(a.timestamp); // newest resolved first
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">Emergency Dispatch Control</h2>
        <p className="text-xs text-slate-400 font-mono">Report new medical alerts, manage queue priority ranking, and resolve dispatches</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Dispatch Logging Terminal */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Report New Alert</h3>
          
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 block uppercase tracking-wider">Incident Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                >
                  <option value="Cardiac Arrest">Cardiac Arrest (ALS Essential)</option>
                  <option value="Severe Stroke">Severe Stroke (ALS Essential)</option>
                  <option value="Road Accident">Road Collision / Trauma</option>
                  <option value="Factory Fire">Warehouse / Factory Fire</option>
                  <option value="Building Collapse">Building Structural Failure</option>
                  <option value="General Medical Emergency">General Medical Assistance</option>
                </select>
              </div>

              {/* Severity Select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 block uppercase tracking-wider">Severity Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Critical', 'High', 'Medium', 'Low'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`py-2 rounded-lg border font-bold uppercase transition-all ${
                        severity === s 
                          ? (s === 'Critical' ? 'bg-red-500/20 border-red-500 text-red-400' 
                             : s === 'High' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                             : s === 'Medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                             : 'bg-slate-500/20 border-slate-500 text-slate-400')
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Node Select */}
              <div className="space-y-1.5">
                <label className="text-slate-400 block uppercase tracking-wider">Location Node (Bangalore Grid)</label>
                <select
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                >
                  {nodes.map(node => (
                    <option key={node.id} value={node.id}>
                      Node {node.id}: {node.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(225,29,72,0.2)] hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> {submitting ? "Processing..." : "Log Alert & Dispatch"}
              </button>
            </form>
          </div>

          {/* Global Match Optimizer Trigger */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              Hungarian Matching Engine
            </h4>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              If multiple incidents are pending and multiple ambulances are on standby, run the global Hungarian Bipartite matching algorithm to optimize global response times.
            </p>
            <button
              onClick={onRunGlobalMatching}
              className="w-full py-2 rounded-lg bg-cyan-950 border border-cyan-500/30 hover:bg-cyan-900/50 text-cyan-400 font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCcw size={14} /> Run Global Match Optimizer
            </button>
          </div>
        </div>

        {/* Right Col: Active Live Incident Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Dynamic Priority Queue</h3>
            <span className="text-[10px] font-mono text-slate-400">Total Registered Cases: {emergencies.length}</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {sortedEmergencies.map((e, idx) => {
              const locationNode = nodes.find(n => n.id === e.nodeId);
              const assignedAmbulance = ambulances.find(a => String(a.id) === String(e.assignedAmbulanceId));
              const assignedHospital = hospitals.find(h => String(h.id) === String(e.assignedHospitalId));
              
              let severityBadge = "bg-red-500/10 border-red-500/30 text-red-400";
              let cardBorder = "border-slate-900";
              let glowTag = "";

              if (e.severity === "High") severityBadge = "bg-orange-500/10 border-orange-500/30 text-orange-400";
              else if (e.severity === "Medium") severityBadge = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
              else if (e.severity === "Low") severityBadge = "bg-slate-500/10 border-slate-500/30 text-slate-400";

              if (e.status === "Pending") {
                cardBorder = "border-amber-500/40";
                glowTag = "shadow-[0_0_8px_rgba(245,158,11,0.1)]";
              } else if (e.status === "En-Route") {
                cardBorder = "border-cyan-500/40";
                glowTag = "shadow-[0_0_8px_rgba(6,182,212,0.15)]";
              }

              return (
                <div 
                  key={e.id} 
                  className={`glass-panel p-5 rounded-2xl border ${cardBorder} ${glowTag} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-digital font-bold text-slate-100">CASE #{e.id}</span>
                      <span className={`text-[9px] font-mono border px-2 py-0.5 rounded ${severityBadge}`}>
                        {e.severity}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                        e.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : e.status === 'En-Route' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {e.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{e.type}</h4>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-400 pt-1">
                      <div>📍 Area: {locationNode ? locationNode.name : `Node ${e.nodeId}`}</div>
                      <div>⏰ Registered: {new Date(e.timestamp).toLocaleTimeString()}</div>
                      <div>🧬 AI Priority Score: <span className="text-cyan-400 font-bold">{e.priority} / 10</span></div>
                      {e.status === "Resolved" && (
                        <div className="text-emerald-400 font-semibold">⚡ Responded in: {e.responseTime} min</div>
                      )}
                    </div>

                    {/* Resources Dispatched Block */}
                    {e.status === "En-Route" && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-cyan-500/25 flex justify-between items-center gap-4 text-[10px] font-mono text-cyan-300">
                        <div>🚒 Responding: <strong className="text-white">{assignedAmbulance ? assignedAmbulance.name : 'Unit'}</strong></div>
                        <div>🏥 Dest: <strong className="text-white">{assignedHospital ? assignedHospital.name : 'Clinic'}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Operational Override Buttons */}
                  <div className="shrink-0 self-end sm:self-center">
                    {e.status === "En-Route" && (
                      <button
                        onClick={() => onResolveEmergency && onResolveEmergency(e.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      >
                        <CheckCircle size={14} /> Resolve Case
                      </button>
                    )}
                    {e.status === "Pending" && (
                      <div className="text-[10px] font-mono text-amber-500 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/5 animate-pulse">
                        <Clock size={12} /> Awaiting Vehicle
                      </div>
                    )}
                    {e.status === "Resolved" && (
                      <div className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5">
                        ✓ Case Handled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {emergencies.length === 0 && (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                No active or historical emergencies logged in this session.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
