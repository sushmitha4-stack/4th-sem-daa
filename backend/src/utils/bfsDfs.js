/**
 * BFS and DFS Traversal Algorithms
 * Used in Disaster Management to verify area connectivity and identify isolated zones.
 */

// Run DFS to find all connected components
export function runDFSComponents(adjList, nodesCount = 10) {
  const visited = Array(nodesCount).fill(false);
  const components = [];

  function dfs(u, component) {
    visited[u] = true;
    component.push(u);
    adjList[u].forEach(neighbor => {
      if (!visited[neighbor.node]) {
        dfs(neighbor.node, component);
      }
    });
  }

  for (let i = 0; i < nodesCount; i++) {
    if (!visited[i]) {
      const component = [];
      dfs(i, component);
      components.push(component);
    }
  }

  // A node is isolated if it's not connected to the main hub (Majestic - Node 1)
  // Let's find the component containing Majestic (Node 1)
  const mainHubComponent = components.find(comp => comp.includes(1)) || [];
  const isolatedNodes = [];
  
  for (let i = 0; i < nodesCount; i++) {
    if (!mainHubComponent.includes(i)) {
      isolatedNodes.push(i);
    }
  }

  return {
    components,
    isolatedNodes,
    isConnected: components.length === 1
  };
}

// Run BFS starting from Majestic (Node 1) to find shortest hop counts
export function runBFSTraversal(adjList, startNode = 1, nodesCount = 10) {
  const visited = Array(nodesCount).fill(false);
  const queue = [startNode];
  const traversalOrder = [];
  const distances = Array(nodesCount).fill(Infinity); // Hop distances

  visited[startNode] = true;
  distances[startNode] = 0;

  while (queue.length > 0) {
    const u = queue.shift();
    traversalOrder.push(u);

    adjList[u].forEach(neighbor => {
      const v = neighbor.node;
      if (!visited[v]) {
        visited[v] = true;
        distances[v] = distances[u] + 1;
        queue.push(v);
      }
    });
  }

  return {
    traversalOrder,
    hopDistances: distances
  };
}
