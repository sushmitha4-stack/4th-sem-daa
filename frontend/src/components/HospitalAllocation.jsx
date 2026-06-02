import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Award, Grid, RefreshCcw } from 'lucide-react';

export default function HospitalAllocation({ 
  emergencies = [], 
  ambulances = [], 
  hospitals = [],
  onRunGlobalMatching = null
}) {
  const [allocationLogs, setAllocationLogs] = useState([]);
  const [running, setRunning] = useState(false);

  // Active pending emergencies and standby ambulances
  const pendingCalls = emergencies.filter(e => e.status === "Pending");
  const idleAmbulances = ambulances.filter(a => a.status === "Idle");

  const runOptimizer = async () => {
    if (!onRunGlobalMatching) return;
    setRunning(true);
    const data = await onRunGlobalMatching();
    if (data?.assignments) {
      setAllocationLogs(data.assignments);
    }
    setRunning(false);
  };

  // Mock static matrix visualization for presentation if none is pending
  const getDemoMatrix = () => {
    // Rows: Ambulances (A1, A3, B4)
    // Cols: Emergencies (Trauma, Cardiac, Burn)
    const rows = [
      { name: "Rescuer-A1 (ALS)", nodeId: 0, costs: [10.5, 45.2, 18.0], matchedColIdx: 0 },
      { name: "Rescuer-A3 (ALS)", nodeId: 3, costs: [25.0, 12.4, 30.5], matchedColIdx: 1 },
      { name: "Rescuer-B4 (BLS)", nodeId: 5, costs: [18.2, 50.0, 8.4], matchedColIdx: 2 }
    ];
    const cols = ["Trauma Call Node 7", "Cardiac Call Node 0", "Burn Call Node 4"];
    return { rows, cols };
  };

  const demoData = getDemoMatrix();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">Hungarian Bipartite Allocator</h2>
          <p className="text-xs text-slate-400 font-mono">Minimizes global travel and mismatch costs using the Hungarian assignment algorithm</p>
        </div>
        <button
          onClick={runOptimizer}
          disabled={running}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        >
          <RefreshCcw size={14} className={running ? 'animate-spin' : ''} />
          {running ? "Optimizing..." : "Recalculate Matches"}
        </button>
      </div>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Cost Matrix & Allocation Matrix Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Dynamic Cost Matrix Ledger</h3>
            <span className="text-[10px] text-slate-400 font-mono">Row: Vehicles • Col: Alerts</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl overflow-x-auto">
            
            {/* If actual pending alerts exist, render active matching matrix, else show demo grid */}
            {pendingCalls.length > 0 && idleAmbulances.length > 0 ? (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5">Ambulance</th>
                    {pendingCalls.map((c, idx) => (
                      <th key={c.id} className="py-2.5 px-3 text-center">
                        Call #{c.id}<br />
                        <span className="text-[8px] text-slate-500">Node {c.nodeId}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {idleAmbulances.map((amb, rIdx) => (
                    <tr key={amb.id} className="border-b border-slate-900/60 hover:bg-slate-900/10">
                      <td className="py-3 font-semibold text-slate-200">{amb.name}</td>
                      {pendingCalls.map((c, cIdx) => {
                        // Calculate mock cost
                        const dist = Math.abs(amb.currentNode - c.nodeId) * 3 + 2; // base approx
                        const mismatchPenalty = (c.severity === "Critical" && amb.type === "BLS") ? 50 : 0;
                        const totalCost = dist + mismatchPenalty;

                        // Check if this row-col is matched in logs
                        const isMatched = allocationLogs.some(log => 
                          log.ambulanceName === amb.name && log.emergencyId === c.id
                        );

                        return (
                          <td 
                            key={c.id} 
                            className={`py-3 px-3 text-center transition-all ${
                              isMatched 
                                ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold' 
                                : 'text-slate-400'
                            }`}
                          >
                            {totalCost.toFixed(1)}
                            {mismatchPenalty > 0 && <span className="block text-[8px] text-red-500">+50 Mismatch</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>
                <div className="flex justify-between items-center text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-4 border border-amber-500/20 bg-amber-500/5 px-3 py-2 rounded-lg">
                  <span>ℹ️ System Standby: Displaying Simulation Matrix (No active queue match needed)</span>
                </div>
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5">Standby Vehicle</th>
                      {demoData.cols.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3 text-center">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {demoData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-900/60">
                        <td className="py-3 font-semibold text-slate-200">{row.name}</td>
                        {row.costs.map((cost, cIdx) => {
                          const isMatched = row.matchedColIdx === cIdx;
                          return (
                            <td 
                              key={cIdx} 
                              className={`py-3 px-3 text-center transition-all ${
                                isMatched 
                                  ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold' 
                                  : 'text-slate-400'
                              }`}
                            >
                              {cost.toFixed(1)} min
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Col: Active Allocations Summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Active Match Assignments</h3>

          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4 min-h-[300px]">
            {allocationLogs.length > 0 ? (
              <div className="space-y-3">
                {allocationLogs.map((log, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-xs font-mono space-y-2">
                    <div className="flex justify-between items-center text-slate-200 border-b border-slate-800 pb-1.5 font-bold">
                      <span>ALERT ID #{log.emergencyId}</span>
                      <span className="text-cyan-400">Cost: {log.routingCost}</span>
                    </div>
                    <div className="space-y-1 text-slate-400 text-[10px]">
                      <div>🚨 Case Type: <strong className="text-white">{log.emergencyType}</strong></div>
                      <div>🚒 Dispatched: <strong className="text-white">{log.ambulanceName}</strong></div>
                      <div>🏥 Admission: <strong className="text-white">{log.hospitalName}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-center text-slate-500 font-mono text-xs p-4">
                <Grid size={32} className="text-slate-700 mb-3 animate-pulse" />
                No global dispatches matched in last run.<br />
                <span className="text-[10px] text-slate-600 mt-2">
                  Report multiple emergencies and click 'Recalculate Matches' to test Kuhn-Munkres execution.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
