/**
 * Floyd-Warshall All-Pairs Shortest Path Algorithm
 * Computes shortest path matrix and next-hop matrix for all node pairs.
 */
export function runFloydWarshall(adjList, nodesCount = 10) {
  // Initialize distance and next matrix
  const dist = Array.from({ length: nodesCount }, () => Array(nodesCount).fill(Infinity));
  const next = Array.from({ length: nodesCount }, () => Array(nodesCount).fill(null));
  const steps = [];

  for (let i = 0; i < nodesCount; i++) {
    dist[i][i] = 0;
    adjList[i].forEach(neighbor => {
      dist[i][neighbor.node] = neighbor.weight;
      next[i][neighbor.node] = neighbor.node;
    });
  }

  steps.push({
    message: "Initialized Floyd-Warshall adjacency matrix weights.",
    matrixSummary: getMatrixSummary(dist)
  });

  // Floyd-Warshall DP updates
  for (let k = 0; k < nodesCount; k++) {
    let updateCount = 0;
    for (let i = 0; i < nodesCount; i++) {
      for (let j = 0; j < nodesCount; j++) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
            updateCount++;
          }
        }
      }
    }
    steps.push({
      message: `Completed iteration with intermediate node k = ${k} (${NODES_NAME_LOOKUP[k]}). ${updateCount} path weights relaxed.`,
      matrixSummary: getMatrixSummary(dist)
    });
  }

  return {
    dist,
    next,
    steps
  };
}

// Map node indices to names for clean log rendering
const NODES_NAME_LOOKUP = [
  "RVCE", "Majestic", "Yeshwanthpur", "Hebbal", "Indiranagar",
  "Koramangala", "Whitefield", "Marathahalli", "Jayanagar", "Electronic City"
];

function getMatrixSummary(dist) {
  // Provide basic summary stats of current matrix state (e.g. number of reachable paths)
  let reachable = 0;
  let total = 0;
  for (let i = 0; i < dist.length; i++) {
    for (let j = 0; j < dist.length; j++) {
      if (dist[i][j] !== Infinity && i !== j) reachable++;
      total++;
    }
  }
  return { reachable, total };
}

/**
 * Reconstructs the shortest path from start to end using the Floyd-Warshall next-hop matrix.
 */
export function reconstructPathFW(start, end, next) {
  if (next[start][end] === null) return [];
  const path = [start];
  while (start !== end) {
    start = next[start][end];
    if (start === null) return []; // Detect loop or disjoint graph
    path.push(start);
  }
  return path;
}
