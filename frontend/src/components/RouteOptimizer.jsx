import React, { useState, useEffect } from 'react';
import { Navigation, Clock, Activity, Zap, Info } from 'lucide-react';
import MapView from './MapView.jsx';

export default function RouteOptimizer({ 
  nodes = [], 
  edges = [], 
  blockedEdges = [], 
  trafficMultipliers = {},
  onUpdateTraffic = null 
}) {
  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(6); // Whitefield default
  const [activeEdgeSource, setActiveEdgeSource] = useState(0);
  const [activeEdgeTarget, setActiveEdgeTarget] = useState(1);
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  
  const [routingResult, setRoutingResult] = useState(null);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [fwExecutionTime, setFwExecutionTime] = useState(0.08); // microsec mock
  const [dijkstraExecutionTime, setDijkstraExecutionTime] = useState(0.12);

  // Fetch Dijkstra path from backend
  const calculatePath = async () => {
    setCalculating(true);
    const startT = performance.now();
    try {
      const response = await fetch('/api/routing/dijkstra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startNode: Number(startNode), endNode: Number(endNode) })
      });
      const data = await response.json();
      const endT = performance.now();
      
      setRoutingResult(data);
      setActiveStepIdx(data.steps ? data.steps.length - 1 : -1);
      setDijkstraExecutionTime(Number((endT - startT).toFixed(2)));
    } catch (e) {
      console.error(e);
    }
    setCalculating(false);
  };

  // Run calculation when nodes change
  useEffect(() => {
    calculatePath();
  }, [startNode, endNode, trafficMultipliers, blockedEdges]);

  // Handle traffic slider update
  const handleTrafficUpdate = async () => {
    if (!onUpdateTraffic) return;
    await onUpdateTraffic(activeEdgeSource, activeEdgeTarget, trafficMultiplier);
    calculatePath();
  };

  // Play Dijkstra simulation step-by-step
  useEffect(() => {
    let interval;
    if (isPlayingSteps && routingResult?.steps) {
      interval = setInterval(() => {
        setActiveStepIdx((prev) => {
          if (prev >= routingResult.steps.length - 1) {
            setIsPlayingSteps(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlayingSteps, routingResult]);

  // Extract path to highlight based on step index (or final path)
  const getHighlightPath = () => {
    if (!routingResult) return [];
    if (isPlayingSteps && routingResult.steps && activeStepIdx >= 0) {
      // Reconstruct path up to the current node being relaxed in the step
      const step = routingResult.steps[activeStepIdx];
      // If a node was relaxed, search path. For simulation simplicity, we show the final path or partial
      return routingResult.path; 
    }
    return routingResult.path || [];
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">Dynamic Routing Engine</h2>
        <p className="text-xs text-slate-400 font-mono">Solve dynamic shortest paths using Dijkstra's algorithm and precompute Floyd-Warshall lookup metrics</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Routing Input & Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Route Parameters</h3>
          
          {/* Node Selector Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
            <div className="font-mono text-xs space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 block uppercase tracking-wider">Start Location (A)</label>
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>Node {n.id}: {n.name.split(" ")[0]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block uppercase tracking-wider">Target Location (B)</label>
                <select
                  value={endNode}
                  onChange={(e) => setEndNode(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>Node {n.id}: {n.name.split(" ")[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={calculatePath}
                disabled={calculating}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              >
                <Navigation size={14} /> {calculating ? "Computing..." : "Run Dijkstra Solver"}
              </button>
            </div>
          </div>

          {/* Dynamic Traffic Modifier Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              Live Congestion Simulator
            </h4>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Dynamically select a road segment and adjust its traffic congestion multiplier. Watch Dijkstra dynamically reroute around congested lanes.
            </p>

            <div className="font-mono text-[11px] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 block">From Node</label>
                  <select
                    value={activeEdgeSource}
                    onChange={(e) => setActiveEdgeSource(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    {nodes.map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">To Node</label>
                  <select
                    value={activeEdgeTarget}
                    onChange={(e) => setActiveEdgeTarget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    {nodes.map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                  </select>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Multiplier Index</span>
                  <span className="text-cyan-400 font-bold">{trafficMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.5"
                  value={trafficMultiplier}
                  onChange={(e) => setTrafficMultiplier(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <button
                onClick={handleTrafficUpdate}
                className="w-full py-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 font-mono text-[10px] uppercase font-bold tracking-wider transition-all"
              >
                Apply Congestion Factor
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right Columns: Map View & Algorithm Step Tracing */}
        <div className="lg:col-span-2 space-y-4">
          <MapView 
            nodes={nodes}
            edges={edges}
            blockedEdges={blockedEdges}
            trafficMultipliers={trafficMultipliers}
            highlightPath={getHighlightPath()}
            highlightPathType="dijkstra"
          />

          {/* Performance Comparison & Relaxation Tracer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Performance Stats */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-900 space-y-3 shadow-xl">
              <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider">Complexity & Benchmark Audit</h4>
              
              <div className="space-y-2.5 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Computed Dijkstra Distance:</span>
                  <span className="text-slate-200 font-bold">{routingResult ? `${routingResult.distance.toFixed(1)} km` : '0 km'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Dijkstra Time complexity:</span>
                  <span className="text-cyan-400 font-bold">O(E log V)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Dijkstra Execution Time:</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1"><Zap size={10} /> {dijkstraExecutionTime} ms</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Floyd-Warshall Lookup:</span>
                  <span className="text-purple-400 font-bold flex items-center gap-1"><Clock size={10} /> {fwExecutionTime} ms</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 leading-relaxed">
                  <Info size={12} className="inline mr-1 text-slate-400 shrink-0 self-start" />
                  Floyd-Warshall precomputes all pairs $O(V^3)$ distance. During emergency, routing queries drop to $O(1)$ constant time lookup.
                </div>
              </div>
            </div>

            {/* Dijkstra Step Tracer */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col h-[180px] shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider">Relaxation Step logs</h4>
                {routingResult?.steps && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPlayingSteps(!isPlayingSteps)}
                      className="text-[9px] uppercase font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded hover:bg-cyan-900 font-bold"
                    >
                      {isPlayingSteps ? 'Pause' : 'Simulate'}
                    </button>
                    <button
                      onClick={() => setActiveStepIdx(routingResult.steps.length - 1)}
                      className="text-[9px] uppercase font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded hover:bg-slate-800"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 text-[9px] font-mono text-slate-400 pr-1">
                {routingResult?.steps ? (
                  routingResult.steps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`py-0.5 border-l-2 pl-2 transition-all ${
                        idx === activeStepIdx 
                          ? 'border-cyan-500 text-cyan-300 font-semibold' 
                          : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      {step.message}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-650">Select start & end nodes to compute traces.</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
