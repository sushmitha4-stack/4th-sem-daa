/**
 * Dijkstra's Shortest Path Algorithm
 * Finds the shortest path between startNode and endNode.
 * Incorporates dynamic traffic weights and outputs step-by-step logs.
 */
export function runDijkstra(adjList, startNode, endNode, nodesCount = 10) {
  const dist = Array(nodesCount).fill(Infinity);
  const prev = Array(nodesCount).fill(null);
  const visited = Array(nodesCount).fill(false);
  const steps = []; // For dashboard algorithm tracing

  dist[startNode] = 0;
  
  steps.push({
    message: `Initialized starting node ${startNode} with distance 0, others with Infinity.`,
    dist: [...dist],
    currentNode: null,
    visited: [...visited]
  });

  for (let i = 0; i < nodesCount; i++) {
    // Find node with minimum distance among unvisited
    let u = -1;
    let minD = Infinity;
    for (let j = 0; j < nodesCount; j++) {
      if (!visited[j] && dist[j] < minD) {
        minD = dist[j];
        u = j;
      }
    }

    if (u === -1 || dist[u] === Infinity) {
      steps.push({
        message: `Unreachable nodes remaining or search complete.`,
        dist: [...dist],
        currentNode: null,
        visited: [...visited]
      });
      break;
    }

    visited[u] = true;
    steps.push({
      message: `Selected node ${u} with minimum distance ${dist[u].toFixed(2)} for relaxation.`,
      dist: [...dist],
      currentNode: u,
      visited: [...visited]
    });

    if (u === endNode) {
      steps.push({
        message: `Destination node ${endNode} reached!`,
        dist: [...dist],
        currentNode: u,
        visited: [...visited]
      });
      break;
    }

    // Relax neighbors
    adjList[u].forEach(neighbor => {
      const v = neighbor.node;
      const weight = neighbor.weight; // distance * traffic_multiplier * baseTraffic
      
      if (!visited[v] && dist[u] + weight < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + weight;
        prev[v] = u;
        
        steps.push({
          message: `Relaxing edge ${u} -> ${v}. Updated distance from ${oldDist === Infinity ? 'Infinity' : oldDist.toFixed(2)} to ${dist[v].toFixed(2)}`,
          dist: [...dist],
          currentNode: u,
          visited: [...visited]
        });
      }
    });
  }

  // Reconstruct path
  const path = [];
  let curr = endNode;
  if (dist[endNode] !== Infinity || startNode === endNode) {
    while (curr !== null) {
      path.unshift(curr);
      curr = prev[curr];
    }
  }

  return {
    path,
    weight: dist[endNode],
    distance: path.length > 0 ? calculateActualDistance(path, adjList) : 0,
    steps
  };
}

function calculateActualDistance(path, adjList) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const edge = adjList[u].find(n => n.node === v);
    if (edge) {
      totalDistance += edge.distance;
    }
  }
  return totalDistance;
}
