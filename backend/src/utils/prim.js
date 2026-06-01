/**
 * Prim's Minimum Spanning Tree Algorithm
 * Computes the Minimum Spanning Tree of the communications network.
 * Returns MST edges, total cabling cost, and step-by-step selection logs.
 */
export function runPrim(nodes, edges) {
  const n = nodes.length;
  if (n === 0) return { mstEdges: [], totalCost: 0, steps: [] };

  const inMST = Array(n).fill(false);
  const key = Array(n).fill(Infinity);
  const parent = Array(n).fill(-1);
  const steps = [];

  key[0] = 0; // Start with first node

  steps.push({
    message: `Initialized Prim's MST starting at node 0 (${nodes[0].name}).`,
    inMST: [...inMST],
    key: [...key]
  });

  for (let i = 0; i < n; i++) {
    // Find node with min key value that is not in MST
    let u = -1;
    let minKey = Infinity;
    for (let j = 0; j < n; j++) {
      if (!inMST[j] && key[j] < minKey) {
        minKey = key[j];
        u = j;
      }
    }

    if (u === -1) {
      steps.push({
        message: `Graph is disconnected; some nodes remain unconnected.`,
        inMST: [...inMST],
        key: [...key]
      });
      break; // Disconnected graph
    }

    inMST[u] = true;
    
    if (parent[u] !== -1) {
      steps.push({
        message: `Added node ${u} (${nodes[u].name}) to MST via edge ${parent[u]} - ${u} with weight ${minKey.toFixed(1)} km.`,
        inMST: [...inMST],
        key: [...key],
        addedEdge: { source: parent[u], target: u, weight: minKey }
      });
    } else {
      steps.push({
        message: `Added root node ${u} (${nodes[u].name}) to MST.`,
        inMST: [...inMST],
        key: [...key]
      });
    }

    // Update keys and parents of adjacent vertices of u
    // Find all edges connected to u
    edges.forEach(edge => {
      let v = -1;
      let weight = edge.distance; // Use pure geographical distance for cabling cost

      if (edge.source === u) v = edge.target;
      else if (edge.target === u) v = edge.source;

      if (v !== -1 && !inMST[v] && weight < key[v]) {
        const oldKey = key[v];
        key[v] = weight;
        parent[v] = u;
        
        steps.push({
          message: `Relaxing neighbor node ${v} (${nodes[v].name}). Updated MST cost link from ${oldKey === Infinity ? 'Infinity' : oldKey.toFixed(1)} to ${weight.toFixed(1)} km`,
          inMST: [...inMST],
          key: [...key]
        });
      }
    });
  }

  // Gather MST edges
  const mstEdges = [];
  let totalCost = 0;
  for (let i = 1; i < n; i++) {
    if (parent[i] !== -1) {
      const edgeWeight = key[i];
      mstEdges.push({
        source: parent[i],
        target: i,
        weight: edgeWeight
      });
      totalCost += edgeWeight;
    }
  }

  return {
    mstEdges,
    totalCost,
    steps
  };
}
