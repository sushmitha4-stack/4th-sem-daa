import React from 'react';
import { Activity, ShieldAlert, Navigation, Layers } from 'lucide-react';

export default function LandingPage({ onEnter }) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center grid-bg px-4 overflow-hidden">
      
      {/* Background Neon Glow Polygons */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl text-center space-y-6 z-10 select-none">
        
        {/* Header Badging */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase animate-pulse">
          <ShieldAlert size={14} /> Next-Gen Emergency Ops
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 bg-clip-text text-transparent uppercase">
          AEGIS COMMAND PLATFORM
        </h1>
        
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
          An AI-powered emergency routing & resource allocation engine integrating Floyd-Warshall, Hungarian Bipartite Matching, and Dijkstra's pathfinding to optimize critical emergency dispatches in Bangalore.
        </p>

        {/* Action Button */}
        <div className="pt-4">
          <button 
            onClick={onEnter}
            className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white tracking-wide uppercase transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)]"
          >
            Launch Terminal
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5 ml-2">→</span>
          </button>
        </div>

        {/* Live Counters / Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-12">
          {[
            { value: "0.2ms", label: "Lookup Latency", color: "text-cyan-400" },
            { value: "12.4 min", label: "Avg Dispatch ETA", color: "text-emerald-400" },
            { value: "148 km", label: "Fiber Cabling Saved", color: "text-purple-400" },
            { value: "98.7%", label: "Platform SLA", color: "text-cyan-400" }
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
              <div className={`text-xl font-bold font-digital ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Algorithms grid */}
        <div className="pt-12">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-6 font-semibold">Powering Algorithms (DAA Integration)</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { title: "Global Resource Matching", desc: "Hungarian Assignment matching active alerts to best responding ambulances based on distance, crew training, and ICU capacity.", icon: <Activity className="text-emerald-400" size={18} /> },
              { title: "Dynamic Routing Engine", desc: "Dijkstra with real-time weights and Floyd-Warshall matrices for sub-millisecond route optimization across congested roads.", icon: <Navigation className="text-cyan-400" size={18} /> },
              { title: "Disaster Grid Traversal", desc: "BFS/DFS for zone connectivity checking and isolated island locator. Prim's MST for network communication restoration.", icon: <Layers className="text-purple-400" size={18} /> }
            ].map((alg, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-slate-900 flex gap-4">
                <div className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 self-start">
                  {alg.icon}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">{alg.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{alg.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-[10px] text-slate-500 font-mono">
        © 2026 Aegis Systems Ltd. Developed for Intelligent City Networks.
      </div>
    </div>
  );
}
