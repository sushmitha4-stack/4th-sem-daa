import React from 'react';
import { AlertCircle, Ambulance, Activity, ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';
import MapView from './MapView.jsx';

export default function Dashboard({ 
  nodes = [], 
  edges = [], 
  emergencies = [], 
  ambulances = [], 
  hospitals = [],
  blockedEdges = [],
  highlightedRoute = [],
  trafficMultipliers = {},
  onNavigateTo = null 
}) {
  
  // Computations
  const activeEmergencies = emergencies.filter(e => e.status !== "Resolved");
  const idleAmbulances = ambulances.filter(a => a.status === "Idle");
  
  const totalIcuBeds = hospitals.reduce((sum, h) => sum + h.icuBedsMax, 0);
  const availableIcuBeds = hospitals.reduce((sum, h) => sum + h.icuBedsAvailable, 0);
  const icuOccupancyRate = totalIcuBeds > 0 
    ? (((totalIcuBeds - availableIcuBeds) / totalIcuBeds) * 100).toFixed(0) 
    : 0;

  const resolvedCases = emergencies.filter(e => e.status === "Resolved");
  const avgResponseTime = resolvedCases.length > 0
    ? (resolvedCases.reduce((sum, e) => sum + e.responseTime, 0) / resolvedCases.length).toFixed(1)
    : "10.2";

  // AI Insights Engine
  const getAIRecommendations = () => {
    const recs = [];
    if (activeEmergencies.some(e => e.status === "Pending")) {
      recs.push({
        type: "warning",
        message: "Unassigned emergency calls detected in the queue.",
        actionLabel: "Execute Matching Optimizer",
        route: "allocation"
      });
    }
    if (availableIcuBeds / totalIcuBeds < 0.25) {
      recs.push({
        type: "danger",
        message: `Critical ICU Bed Shortage: City capacity at ${100 - icuOccupancyRate}% occupancy.`,
        actionLabel: "Audit Bed Allocation",
        route: "hospitals"
      });
    }
    const trafficKeys = Object.keys(trafficMultipliers);
    const heavyTrafficCount = trafficKeys.filter(k => trafficMultipliers[k] >= 2.0).length;
    if (heavyTrafficCount > 0) {
      recs.push({
        type: "info",
        message: `${heavyTrafficCount} road corridors displaying high congestion multipliers.`,
        actionLabel: "Review Traffic Routing",
        route: "routing"
      });
    }
    if (blockedEdges.length > 0) {
      recs.push({
        type: "warning",
        message: `${blockedEdges.length} roads severed due to active disaster zones. Connectivity check required.`,
        actionLabel: "Analyze Network Islands",
        route: "disaster"
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: "success",
        message: "All systems nominal. Routing and allocation loads balanced.",
        actionLabel: "View Analytics",
        route: "analytics"
      });
    }
    return recs;
  };
  console.log("ROUTE PASSED TO MAP:", highlightedRoute);

  return (
    <div className="space-y-6">
      
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">Aegis Operations telemetry</h2>
          <p className="text-xs text-slate-400 font-mono">Real-time resource matching, Dijkstra routing, and incident response tracking</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigateTo('emergencies')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 animate-pulse"
          >
            Report Incident
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Emergencies", val: activeEmergencies.length, sub: `${emergencies.filter(e => e.status === 'Pending').length} Pending Dispatch`, icon: <AlertCircle className="text-rose-500" />, trend: "+2 hrs" },
          { title: "Ambulances Standby", val: `${idleAmbulances.length} / ${ambulances.length}`, sub: `${ambulances.filter(a => a.status === 'En-Route').length} Dispatch Active`, icon: <Ambulance className="text-cyan-400" />, trend: "94% Batt" },
          { title: "ICU Bed Occupancy", val: `${icuOccupancyRate}%`, sub: `${availableIcuBeds} / ${totalIcuBeds} beds free`, icon: <Activity className="text-emerald-500" />, trend: "Steady" },
          { title: "Avg Response Time", val: `${avgResponseTime}m`, sub: "SLA target: <15 mins", icon: <TrendingUp className="text-purple-400" />, trend: "-1.2m" }
        ].map((card, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-900 flex items-start justify-between shadow-lg relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{card.title}</span>
              <div className="text-2xl font-bold font-digital text-slate-100">{card.val}</div>
              <div className="text-[10px] text-slate-400 font-mono">{card.sub}</div>
            </div>
            <div className="flex flex-col items-end justify-between h-full gap-4">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
                {card.icon}
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Map & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: GIS Map Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Tactical Incident Map</h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span> Live Simulation Stream
            </span>
          
          </div>
          <MapView
  nodes={nodes}
  edges={edges}
  emergencies={emergencies}
  ambulances={ambulances}
  hospitals={hospitals}
  blockedEdges={blockedEdges}
  trafficMultipliers={trafficMultipliers}
  highlightPath={highlightedRoute}
  highlightPathType="dijkstra"
/>
        </div>

        {/* Right Panel: AI Insights & System Log */}
        <div className="space-y-6">
          
          {/* AI Decision Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={16} /> AI Decision Insights
              </h3>
              <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1 rounded font-mono">AUTONOMOUS</span>
            </div>

            <div className="space-y-3">
              {getAIRecommendations().map((rec, idx) => {
                let borderTheme = "border-amber-500/20 bg-amber-500/5 text-amber-300";
                if (rec.type === "danger") borderTheme = "border-red-500/20 bg-red-500/5 text-red-300";
                else if (rec.type === "success") borderTheme = "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
                else if (rec.type === "info") borderTheme = "border-cyan-500/20 bg-cyan-500/5 text-cyan-300";

                return (
                  <div key={idx} className={`p-3 rounded-lg border text-[11px] space-y-2 ${borderTheme}`}>
                    <p className="leading-relaxed font-sans">{rec.message}</p>
                    {onNavigateTo && (
                      <button 
                        onClick={() => onNavigateTo(rec.route)}
                        className="text-[9px] uppercase font-mono font-bold hover:underline block text-slate-100 tracking-wider"
                      >
                        {rec.actionLabel} &rarr;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 space-y-3 h-[255px] overflow-hidden flex flex-col shadow-xl">
            <h3 className="text-xs font-bold uppercase text-slate-300 tracking-widest border-b border-slate-800 pb-2 flex items-center gap-1.5">
              Telemetry Dispatch Log
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[9px] text-slate-400 pr-1">
              {emergencies.slice().reverse().map((e, idx) => {
                let statusLabel = `Incident Created [${e.severity}] Node ${e.nodeId}`;
                let colorClass = "text-slate-500";

                if (e.status === "En-Route") {
                  statusLabel = `Dispatched Ambulance ${e.assignedAmbulanceId} to Node ${e.nodeId}`;
                  colorClass = "text-cyan-400";
                } else if (e.status === "Resolved") {
                  statusLabel = `Resolved case #${e.id} in ${e.responseTime}m at Hospital ${e.assignedHospitalId}`;
                  colorClass = "text-emerald-500";
                }

                return (
                  <div key={idx} className="flex gap-2 items-start border-l border-slate-800 pl-2 py-0.5">
                    <span className="text-slate-600 shrink-0">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    <span className={colorClass}>{statusLabel}</span>
                  </div>
                );
              })}
              {emergencies.length === 0 && (
                <div className="text-slate-600 py-10 text-center">No recent dispatches logged.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
