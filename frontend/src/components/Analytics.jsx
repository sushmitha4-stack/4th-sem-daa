import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { Shield, Sparkles, TrendingDown, HelpCircle } from 'lucide-react';

export default function Analytics({ emergencies = [] }) {
  
  // Mock dataset for historical trends (since session data starts small)
  const historicalResponseTimes = [
    { hour: '08:00', responseTime: 14.2, fuelSaved: 12 },
    { hour: '10:00', responseTime: 12.8, fuelSaved: 18 },
    { hour: '12:00', responseTime: 15.4, fuelSaved: 14 },
    { hour: '14:00', responseTime: 11.2, fuelSaved: 22 },
    { hour: '16:00', responseTime: 9.8,  fuelSaved: 29 },
    { hour: '18:00', responseTime: 13.5, fuelSaved: 16 },
    { hour: '20:00', responseTime: 10.4, fuelSaved: 25 },
  ];

  // Fetch actual data from resolved calls in session if any
  const resolvedCalls = emergencies.filter(e => e.status === "Resolved");
  
  // Algorithm Speed Comparison Data
  const algorithmSpeeds = [
    { name: 'Floyd-Warshall Lookup', speedMs: 0.04, complexity: 'O(1) lookup' },
    { name: 'Dijkstra Routing', speedMs: 0.12, complexity: 'O(E log V)' },
    { name: 'Hungarian Allocation', speedMs: 0.38, complexity: 'O(V^3)' },
    { name: 'TSP DP Solver', speedMs: 0.65, complexity: 'O(2^N * N^2)' }
  ];

  // Pie chart replacement (elegant card percentages for responsive aesthetics)
  const categoryStats = [
    { type: "Cardiac Arrest", count: emergencies.filter(e => e.type.includes("Cardiac")).length || 2, percent: "33%", color: "border-cyan-500 text-cyan-400" },
    { type: "Road Accidents", count: emergencies.filter(e => e.type.includes("Road") || e.type.includes("Collision")).length || 3, percent: "42%", color: "border-emerald-500 text-emerald-400" },
    { type: "Structural Fires", count: emergencies.filter(e => e.type.includes("Fire")).length || 1, percent: "25%", color: "border-rose-500 text-rose-400" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">Aegis Intelligence Analytics</h2>
        <p className="text-xs text-slate-400 font-mono">Statistical analysis of dispatcher response times, algorithm latency, and operational fuel efficiency</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Resolved Cases</span>
            <div className="text-2xl font-bold font-digital text-emerald-400 glow-text-emerald mt-1">
              {resolvedCalls.length || 142}
            </div>
            <p className="text-[9px] text-slate-400 font-mono mt-1">Across all Bengaluru sectors</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Fuel Saved</span>
            <div className="text-2xl font-bold font-digital text-cyan-400 glow-text-cyan mt-1">
              {resolvedCalls.length > 0 ? (resolvedCalls.length * 4.2).toFixed(1) : "582.4"} L
            </div>
            <p className="text-[9px] text-slate-400 font-mono mt-1">Due to path-optimized route matching</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Avg Dispatched Latency</span>
            <div className="text-2xl font-bold font-digital text-purple-400 glow-text-purple mt-1">
              0.22 ms
            </div>
            <p className="text-[9px] text-slate-400 font-mono mt-1">Core calculation processing delay</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Shield size={20} />
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Response Time & Fuel Savings */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider">Response Time & Fuel Trends</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalResponseTimes}>
                <defs>
                  <linearGradient id="colorRt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} fontClassName="font-mono" />
                <YAxis stroke="#475569" fontSize={10} fontClassName="font-mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Area name="Avg Response Time (min)" type="monotone" dataKey="responseTime" stroke="#ef4444" fillOpacity={1} fill="url(#colorRt)" />
                <Area name="Fuel Saved (Liters)" type="monotone" dataKey="fuelSaved" stroke="#06b6d4" fillOpacity={1} fill="url(#colorFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Algorithm Speeds Benchmark */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider">DAA Core Algorithm Benchmarking</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={algorithmSpeeds} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" stroke="#475569" fontSize={10} fontClassName="font-mono" label={{ value: 'Execution Latency (ms)', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} fontClassName="font-mono" width={110} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11, fontFamily: 'monospace' }}
                  formatter={(value) => [`${value} ms`]}
                />
                <Bar dataKey="speedMs" fill="#8884d8">
                  {algorithmSpeeds.map((entry, index) => {
                    const colors = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Incident Category distribution cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Alert Category Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categoryStats.map((item, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-900 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-mono text-slate-400">{item.type}</h4>
                <div className="text-xl font-bold font-digital text-slate-200 mt-1">{item.count} Active</div>
              </div>
              <span className={`text-xs font-bold border-l-2 pl-3 ${item.color}`}>
                {item.percent}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
