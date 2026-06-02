import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, Power, Info, HelpCircle, Network } from 'lucide-react';
import MapView from './MapView.jsx';

export default function DisasterResponse({ 
  nodes = [], 
  edges = [], 
  emergencies = [], 
  ambulances = [], 
  hospitals = [],
  blockedEdges = [],
  trafficMultipliers = {},
  onToggleBlockage = null 
}) {
  const [activeTab, setActiveTab] = useState('bfs-dfs'); // 'bfs-dfs' or 'prim'
  const [disasterStatus, setDisasterStatus] = useState({
    isConnected: true,
    components: [[0,1,2,3,4,5,6,7,8,9]],
    isolatedNodes: []
  });
  
  const [primMST, setPrimMST] = useState({
    mstEdges: [],
    totalCost: 0
  });

  const [calculating, setCalculating] = useState(false);
  const [activeEdgeSource, setActiveEdgeSource] = useState(0);
  const [activeEdgeTarget, setActiveEdgeTarget] = useState(1);

  // Fetch BFS/DFS disaster diagnostics
  const fetchDiagnostics = async () => {
    setCalculating(true);
    try {
      // 1. BFS/DFS Connectivity Check
      const response = await fetch('/api/routing/disaster-status');
      const data = await response.json();
      setDisasterStatus(data);

      // 2. Prim's MST Spanning Tree
      const primResponse = await fetch('/api/routing/prim-mst');
      const primData = await primResponse.json();
      setPrimMST(primData);
    } catch (e) {
      console.error("Failed to load connectivity details", e);
    }
    setCalculating(false);
  };

  // Run on load and whenever blockedEdges changes
  useEffect(() => {
    fetchDiagnostics();
  }, [blockedEdges]);

  // Handle manual blockage toggle
  const handleToggleBlock = async () => {
    if (!onToggleBlockage) return;
    await onToggleBlockage(activeEdgeSource, activeEdgeTarget);
    fetchDiagnostics();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase text-slate-100 tracking-wider">Disaster Containment Hub</h2>
          <p className="text-xs text-slate-400 font-mono">Manage flood/fire road blocks. Diagnostic connectivity scans using BFS/DFS and Prim's Minimum Spanning Tree.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/60 p-1 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('bfs-dfs')}
            className={`px-3 py-1 text-xs uppercase font-mono rounded ${
              activeTab === 'bfs-dfs' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            BFS/DFS Islands
          </button>
          <button
            onClick={() => setActiveTab('prim')}
            className={`px-3 py-1 text-xs uppercase font-mono rounded ${
              activeTab === 'prim' ? 'bg-purple-600 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Prim's MST Network
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Disaster controls & indicators */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-slate-300 tracking-wider">Control Controls</h3>

          {/* Toggle Blockages Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase text-rose-500 tracking-wider flex items-center gap-1.5">
              Collapse Road Link
            </h4>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Block a road path to simulate natural hazards like flash flooding. Roads can be toggled by clicking them on the map or selecting nodes below.
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

              <button
                onClick={handleToggleBlock}
                className="w-full py-2 rounded bg-rose-950/20 border border-rose-500/30 hover:bg-rose-900/40 text-rose-400 font-mono text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Power size={12} /> Toggle Road Collapse
              </button>
            </div>
          </div>

          {/* Connected Components Ticker / Spanning Tree Stats */}
          {activeTab === 'bfs-dfs' ? (
            <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                Connectivity Telemetry
              </h4>
              
              <div className="space-y-2.5 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Graph Connected:</span>
                  <span className={disasterStatus.isConnected ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                    {disasterStatus.isConnected ? "CONNECTED" : "SEVERED"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Connected Zones (DFS):</span>
                  <span className="text-slate-200 font-bold">{disasterStatus.components?.length || 1} regions</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Isolated Areas (Unreachable):</span>
                  <span className="text-rose-400 font-bold">{disasterStatus.isolatedNodes?.length || 0} hubs</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                MST Fiber Telemetry
              </h4>

              <div className="space-y-2.5 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>MST Total Length:</span>
                  <span className="text-purple-400 font-bold">{primMST.totalCost?.toFixed(1) || 0} km</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span>Cabling Links Built:</span>
                  <span className="text-slate-200 font-bold">{primMST.mstEdges?.length || 0} spans</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-900 pt-2">
                  <Network size={12} className="inline mr-1 text-purple-400" />
                  Using Prim's algorithm to design a Spanning Tree connecting all hubs with the minimal total fiber length.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Map & Diagnostic logs */}
        <div className="lg:col-span-2 space-y-4">
          <MapView 
            nodes={nodes}
            edges={edges}
            emergencies={emergencies}
            ambulances={ambulances}
            hospitals={hospitals}
            blockedEdges={blockedEdges}
            trafficMultipliers={trafficMultipliers}
            highlightPath={[]}
            highlightPathType={activeTab === 'prim' ? 'prim' : 'dijkstra'}
            primMSTEdges={activeTab === 'prim' ? primMST.mstEdges : []}
            bfsIsolatedNodes={disasterStatus.isolatedNodes || []}
            onEdgeClick={onToggleBlockage}
            disasterMode={true}
          />

          {/* Diagnostic Console Logs */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl h-[160px] overflow-hidden flex flex-col">
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider border-b border-slate-800 pb-2">
              Diagnostic Core Console Logs
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pt-2 text-[10px] font-mono text-slate-400 pr-1">
              {activeTab === 'bfs-dfs' ? (
                <>
                  <div className="text-slate-500">DFS Component Analysis initialized...</div>
                  {disasterStatus.components?.map((comp, idx) => (
                    <div key={idx} className="text-cyan-400">
                      ▷ Sub-network {idx + 1}: [{comp.map(nId => nodes.find(n => n.id === nId)?.name.split(" ")[0]).join(", ")}]
                    </div>
                  ))}
                  {disasterStatus.isolatedNodes?.length > 0 ? (
                    <div className="text-red-500 font-bold">
                      🚨 HAZARD DETECTED: Isolated islands: [{disasterStatus.isolatedNodes.map(nId => nodes.find(n => n.id === nId)?.name.split(" ")[0]).join(", ")}]
                    </div>
                  ) : (
                    <div className="text-emerald-500">✓ Graph is fully connected. All medical centers are reachable from City Center.</div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-slate-500">Prim's MST cabling sequence tracker...</div>
                  {primMST.steps?.filter(s => s.addedEdge).map((step, idx) => (
                    <div key={idx} className="text-purple-400">
                      ▷ {step.message}
                    </div>
                  ))}
                  <div className="text-emerald-500 font-bold">✓ Spanning tree locked. Minimum communications network computed.</div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
