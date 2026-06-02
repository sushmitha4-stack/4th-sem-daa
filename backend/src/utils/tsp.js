/**
 * TSP Solver using Dynamic Programming with Bitmasking.
 * Solves the Travelling Salesman Problem on a subset of nodes.
 * Uses the Floyd-Warshall distance matrix for all-pairs shortest paths.
 */
export function runTSP(selectedNodes, distMatrix) {
  const n = selectedNodes.length;
  if (n === 0) return { path: [], distance: 0 };
  if (n === 1) return { path: [selectedNodes[0], selectedNodes[0]], distance: 0 };

  // Map selected node IDs to indices 0..n-1
  // We designate selectedNodes[0] as the starting node (depot)
  const memo = Array.from({ length: 1 << n }, () => Array(n).fill(-1));
  const parent = Array.from({ length: 1 << n }, () => Array(n).fill(-1));

  // dp(mask, u) - mask represents visited set of selected nodes, u is current index in selectedNodes
  function solve(mask, u) {
    // If all nodes visited, return distance back to starting node selectedNodes[0]
    if (mask === (1 << n) - 1) {
      const fromNode = selectedNodes[u];
      const toNode = selectedNodes[0];
      return distMatrix[fromNode][toNode];
    }

    if (memo[mask][u] !== -1) return memo[mask][u];

    let minCost = Infinity;
    let bestNext = -1;

    for (let nextIdx = 0; nextIdx < n; nextIdx++) {
      if ((mask & (1 << nextIdx)) === 0) { // If nextIdx is not visited
        const cost = distMatrix[selectedNodes[u]][selectedNodes[nextIdx]] + solve(mask | (1 << nextIdx), nextIdx);
        if (cost < minCost) {
          minCost = cost;
          bestNext = nextIdx;
        }
      }
    }

    parent[mask][u] = bestNext;
    return memo[mask][u] = minCost;
  }

  // Start TSP from selectedNodes[0], mask = 1 (meaning node 0 visited)
  const totalCost = solve(1, 0);

  // Reconstruct path
  const pathIndices = [0];
  let mask = 1;
  let curr = 0;
  
  while (true) {
    const nextIdx = parent[mask][curr];
    if (nextIdx === -1) break;
    pathIndices.push(nextIdx);
    mask |= (1 << nextIdx);
    curr = nextIdx;
  }
  
  pathIndices.push(0); // Return to start

  const path = pathIndices.map(idx => selectedNodes[idx]);

  return {
    path, // Sequence of original node IDs
    distance: totalCost,
    stepsCount: (1 << n) * n // Complexity indicator for UI
  };
}
