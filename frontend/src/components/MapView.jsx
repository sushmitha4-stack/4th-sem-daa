import React, { useState } from 'react';

export default function MapView({ 
  nodes = [], 
  edges = [], 
  emergencies = [], 
  ambulances = [], 
  hospitals = [],
  blockedEdges = [], 
  trafficMultipliers = {},
  highlightPath = [], 
  highlightPathType = 'dijkstra', // 'dijkstra', 'tsp', 'prim'
  primMSTEdges = [],
  bfsIsolatedNodes = [],
  onNodeClick = null,
  onEdgeClick = null,
  disasterMode = false,
  disasterZones = [
    { name: "Hebbal Water Logging", nodeId: 3, radius: 45, type: "flood" },
    { name: "Indiranagar Fire Alert", nodeId: 4, radius: 35, type: "fire" }
  ]
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Helper: check if road is blocked
  const isEdgeBlocked = (src, dest) => {
    return blockedEdges.some(b => 
      (b.source === src && b.target === dest) ||
      (b.source === dest && b.target === src)
    );
  };

  // Helper: get traffic multiplier
  const getTrafficFactor = (src, dest) => {
    const key = `${src}-${dest}`;
    const reverseKey = `${dest}-${src}`;
    return trafficMultipliers[key] || trafficMultipliers[reverseKey] || 1.0;
  };

  // Check if edge is in Prim's MST
  const isEdgeInMST = (src, dest) => {
    return primMSTEdges.some(edge => 
      (edge.source === src && edge.target === dest) ||
      (edge.source === dest && edge.target === src)
    );
  };

  // Check if edge is part of the highlighted route (Dijkstra / TSP path)
  const isEdgeInHighlightPath = (src, dest) => {
    if (!highlightPath || highlightPath.length < 2) return false;
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const u = highlightPath[i];
      const v = highlightPath[i + 1];
      if ((u === src && v === dest) || (u === dest && v === src)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden grid-bg shadow-2xl">
      {/* HUD Header Overlay */}
      <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 rounded-lg border border-cyan-500/20 pointer-events-none">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Tactical GIS Display</h4>
        <p className="text-[10px] text-slate-400 font-mono">Bangalore Grid v4.12 • Simulation Live</p>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-10 glass-panel px-3 py-2 rounded-lg text-[10px] font-mono space-y-1 bg-slate-950/90 max-w-[200px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
          <span className="text-slate-300">Ambulance Hub / Stn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Hospital (ICU Capable)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
          <span className="text-slate-300">Incident Area</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-red-600 inline-block"></span>
          <span className="text-slate-400">Blocked Route</span>
        </div>
        {disasterMode && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/10 border border-rose-500/30 inline-block"></span>
            <span className="text-rose-400">Disaster Containment</span>
          </div>
        )}
      </div>

      {/* Tooltip Overlay */}
      {hoveredNode && (
        <div 
          className="absolute z-20 glass-panel px-3 py-2 rounded-lg text-xs pointer-events-none font-mono max-w-[240px] border border-cyan-500/40 shadow-lg"
          style={{ left: `${hoveredNode.x + 15}px`, top: `${hoveredNode.y - 15}px` }}
        >
          <div className="font-semibold text-cyan-400">{hoveredNode.name}</div>
          <div className="text-[10px] text-slate-300 mt-1">ID: Node {hoveredNode.id}</div>
          {hospitals.some(h => h.nodeId === hoveredNode.id) && (
            <div className="text-[10px] text-emerald-400 mt-0.5">
              🏥 Hospital Capacity: {hospitals.find(h => h.nodeId === hoveredNode.id).icuBedsAvailable} ICU beds
            </div>
          )}
          {emergencies.some(e => e.nodeId === hoveredNode.id && e.status !== 'Resolved') && (
            <div className="text-[10px] text-red-400 mt-0.5">
              ⚠️ Active Call: {emergencies.find(e => e.nodeId === hoveredNode.id && e.status !== 'Resolved').type}
            </div>
          )}
          {bfsIsolatedNodes.includes(hoveredNode.id) && (
            <div className="text-[10px] text-amber-500 font-bold mt-0.5">
              ⚠️ ROUTE SEVERED (Isolated Node)
            </div>
          )}
        </div>
      )}

      {hoveredEdge && (
        <div 
          className="absolute z-20 glass-panel px-3 py-2 rounded-lg text-xs pointer-events-none font-mono border border-slate-700"
          style={{ left: `${(hoveredEdge.source.x + hoveredEdge.target.x) / 2 + 10}px`, top: `${(hoveredEdge.source.y + hoveredEdge.target.y) / 2 - 10}px` }}
        >
          <div className="text-cyan-300 font-bold">{hoveredEdge.source.name.split(" ")[0]} ⇄ {hoveredEdge.target.name.split(" ")[0]}</div>
          <div className="text-[10px] text-slate-300 mt-1">Base Dist: {hoveredEdge.distance} km</div>
          <div className="text-[10px] text-slate-400">Traffic Congestion: {hoveredEdge.traffic}x</div>
          <div className="text-[10px] text-cyan-400 font-bold mt-0.5">Weight Metric: {hoveredEdge.weight.toFixed(1)} min</div>
          {hoveredEdge.isBlocked && <div className="text-[10px] text-red-500 font-bold mt-0.5">⚠️ COLLAPSED ROAD</div>}
        </div>
      )}

      {/* SVG Canvas Map */}
      <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        
        {/* DISASTER ZONE BOUNDARIES */}
        {disasterMode && disasterZones.map((zone, idx) => {
          const centerNode = nodes.find(n => n.id === zone.nodeId);
          if (!centerNode) return null;
          return (
            <g key={`disaster-zone-${idx}`}>
              <circle
                cx={centerNode.x}
                cy={centerNode.y}
                r={zone.radius * 2}
                fill={zone.type === "flood" ? "rgba(14, 116, 144, 0.15)" : "rgba(244, 63, 94, 0.15)"}
                stroke={zone.type === "flood" ? "rgba(34, 211, 238, 0.3)" : "rgba(251, 113, 133, 0.3)"}
                strokeWidth="1.5"
                className="animate-pulse-slow"
              />
              <text
                x={centerNode.x - zone.radius}
                y={centerNode.y + zone.radius * 2 + 12}
                fill={zone.type === "flood" ? "#22d3ee" : "#fda4af"}
                fontSize="9"
                fontWeight="bold"
                className="font-mono tracking-wider opacity-60"
              >
                {zone.name}
              </text>
            </g>
          );
        })}

        {/* ROAD NETWORKS (EDGES) */}
        {edges.map((edge, idx) => {
          const srcNode = nodes.find(n => n.id === edge.source);
          const destNode = nodes.find(n => n.id === edge.target);
          if (!srcNode || !destNode) return null;

          const isBlocked = isEdgeBlocked(edge.source, edge.target);
          const traffic = getTrafficFactor(edge.source, edge.target);
          const calculatedWeight = edge.distance * edge.baseTraffic * traffic;
          
          // Determine edge color based on status
          let strokeColor = "rgba(148, 163, 184, 0.25)"; // Normal Slate-400/25%
          let strokeWidth = "2.5";
          let classNames = "";

          // Blocked
          if (isBlocked) {
            strokeColor = "rgba(225, 29, 72, 0.4)"; // Rose-600/40
            strokeWidth = "2.5";
            classNames = "stroke-dasharray";
          }
          // Highlight paths
          else if (highlightPathType === 'prim' && isEdgeInMST(edge.source, edge.target)) {
            strokeColor = "rgba(168, 85, 247, 0.8)"; // Prim purple
            strokeWidth = "3.5";
            classNames = "animate-dash-slow";
          } 
          else if (isEdgeInHighlightPath(edge.source, edge.target)) {
            if (highlightPathType === 'dijkstra') {
              strokeColor = "rgba(6, 182, 212, 0.9)"; // Dijkstra Cyan
              classNames = "animate-dash";
            } else if (highlightPathType === 'tsp') {
              strokeColor = "rgba(217, 70, 239, 0.9)"; // TSP Magenta
              classNames = "animate-dash";
            }
            strokeWidth = "4";
          }
          // Heavy traffic (if not highlighted)
          else if (traffic >= 2.0) {
            strokeColor = "rgba(234, 179, 8, 0.5)"; // Amber-500
          } else if (traffic > 1.3) {
            strokeColor = "rgba(249, 115, 22, 0.4)"; // Orange-500
          }

          return (
            <line
              key={`edge-${idx}`}
              x1={srcNode.x}
              y1={srcNode.y}
              x2={destNode.x}
              y2={destNode.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={isBlocked ? "6, 6" : undefined}
              className={`transition-all duration-300 ${classNames}`}
              onClick={() => onEdgeClick && onEdgeClick(edge.source, edge.target)}
              onMouseEnter={() => setHoveredEdge({
                source: srcNode,
                target: destNode,
                distance: edge.distance,
                traffic,
                weight: calculatedWeight,
                isBlocked
              })}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: onEdgeClick ? 'pointer' : 'default' }}
            />
          );
        })}

        {/* CABLE MST LINE OVERLAYS FOR PRIM'S */}
        {highlightPathType === 'prim' && primMSTEdges.map((edge, idx) => {
          const srcNode = nodes.find(n => n.id === edge.source);
          const destNode = nodes.find(n => n.id === edge.target);
          if (!srcNode || !destNode) return null;
          return (
            <line
              key={`prim-overlay-${idx}`}
              x1={srcNode.x}
              y1={srcNode.y}
              x2={destNode.x}
              y2={destNode.y}
              stroke="#a855f7" // Purple
              strokeWidth="4"
              strokeDasharray="8, 4"
              className="animate-dash"
            />
          );
        })}

        {/* CONNECTIVITY OVERLAY BFS/DFS SHADING */}
        {disasterMode && nodes.map((node) => {
          const isIsolated = bfsIsolatedNodes.includes(node.id);
          if (isIsolated) {
            return (
              <circle
                key={`isolate-glow-${node.id}`}
                cx={node.x}
                cy={node.y}
                r="18"
                fill="none"
                stroke="rgba(245, 158, 11, 0.6)"
                strokeWidth="1.5"
                className="animate-ping-slow"
              />
            );
          }
          return null;
        })}

        {/* ACTIVE INCIDENT PULSING OVERLAYS */}
        {emergencies.filter(e => e.status !== 'Resolved').map((emergency) => {
          const node = nodes.find(n => n.id === emergency.nodeId);
          if (!node) return null;
          
          let color = "#ef4444"; // Red for Critical
          let pulseClass = "animate-ping";
          if (emergency.severity === "High") color = "#f97316"; // Orange
          else if (emergency.severity === "Medium") color = "#eab308"; // Yellow

          return (
            <g key={`incident-glow-${emergency.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill="none"
                stroke={color}
                strokeWidth="1"
                className={pulseClass}
                style={{ opacity: 0.5 }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="12"
                fill="none"
                stroke={color}
                strokeWidth="2"
                className="animate-pulse"
              />
            </g>
          );
        })}

        {/* ROAD NODE DOTS */}
        {nodes.map((node) => {
          const isHospital = hospitals.some(h => h.nodeId === node.id);
          const isActiveIncident = emergencies.some(e => e.nodeId === node.id && e.status !== 'Resolved');
          const isIsolated = bfsIsolatedNodes.includes(node.id);

          let nodeColor = "#64748b"; // default Gray
          let nodeRadius = "6";
          let borderStroke = "rgba(15, 23, 42, 0.8)";
          let borderSize = "2";

          if (isHospital) {
            nodeColor = "#10b981"; // Hospital Green
            nodeRadius = "9";
            borderStroke = "#047857";
            borderSize = "3";
          } else if (isActiveIncident) {
            nodeColor = "#ef4444"; // Emergency Red
            nodeRadius = "8";
            borderStroke = "#991b1b";
            borderSize = "2";
          } else if (isIsolated) {
            nodeColor = "#f59e0b"; // Isolated Amber
            nodeRadius = "7";
            borderStroke = "#78350f";
            borderSize = "3";
          } else if (node.type === "hub") {
            nodeColor = "#06b6d4"; // Dispatch Hub Cyan
            nodeRadius = "8";
            borderStroke = "#0891b2";
            borderSize = "2";
          }

          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={nodeColor}
                stroke={borderStroke}
                strokeWidth={borderSize}
                className="transition-transform duration-300 hover:scale-150 cursor-pointer"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick && onNodeClick(node.id)}
              />
              {/* Node ID label inside hubs */}
              {(node.type === 'hub' || isHospital) && (
                <text
                  x={node.x}
                  y={node.y + 4}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none font-mono"
                >
                  {isHospital ? 'H' : node.id}
                </text>
              )}
              {/* Location Label Above */}
              <text
                x={node.x}
                y={node.y - 12}
                fill={isIsolated ? "#f59e0b" : (isHospital ? "#34d399" : (node.type === 'hub' ? "#22d3ee" : "#94a3b8"))}
                fontSize="9"
                fontWeight={isHospital || node.type === 'hub' ? "bold" : "normal"}
                textAnchor="middle"
                className="pointer-events-none font-mono tracking-wide bg-slate-950 px-1 py-0.5 rounded opacity-80"
              >
                {node.name.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* AMBULANCE REAL-TIME DISPATCH MARKERS */}
        {ambulances.map((amb) => {
          const currNode = nodes.find(n => n.id === amb.currentNode);
          if (!currNode) return null;

          // If ambulance is en-route, we can offset it slightly towards its target to simulate motion
          let renderX = currNode.x;
          let renderY = currNode.y;
          
          if (amb.status === "En-Route" && amb.targetNode !== null) {
            const target = nodes.find(n => n.id === amb.targetNode);
            if (target) {
              // Interpolate 30% of the way to show movement
              renderX = currNode.x + (target.x - currNode.x) * 0.35;
              renderY = currNode.y + (target.y - currNode.y) * 0.35;
            }
          }

          return (
            <g key={`ambulance-${amb.id}`} className="transition-all duration-1000">
              {/* Outer pulsing ring for en-route ambulances */}
              {amb.status === "En-Route" && (
                <circle
                  cx={renderX}
                  cy={renderY + 8}
                  r="14"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}
              {/* Ambulance vehicle tag */}
              <g transform={`translate(${renderX - 10}, ${renderY + 4})`}>
                <rect
                  width="20"
                  height="10"
                  rx="2"
                  fill={amb.status === "Idle" ? "#0f766e" : "#0284c7"} // dark green vs cyan
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {/* Red cross representation */}
                <rect x="8" y="2" width="4" height="6" fill="#ffffff" />
                <rect x="6" y="4" width="8" height="2" fill="#ffffff" />
                <rect x="8" y="2" width="4" height="6" fill="#ef4444" />
                <rect x="6" y="4" width="8" height="2" fill="#ef4444" />
                {/* Siren light */}
                {amb.status === "En-Route" && (
                  <circle
                    cx="4"
                    cy="0"
                    r="3"
                    fill="#3b82f6"
                    className="animate-pulse"
                  />
                )}
              </g>
              {/* Label */}
              <text
                x={renderX}
                y={renderY + 19}
                fill="#e2e8f0"
                fontSize="7"
                textAnchor="middle"
                className="font-mono bg-slate-900 pointer-events-none"
              >
                {amb.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
