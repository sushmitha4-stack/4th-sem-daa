import { NODES, EDGES, getAdjacencyList } from '../utils/cityGraph.js';
import { runDijkstra } from '../utils/dijkstra.js';
import { runFloydWarshall, reconstructPathFW } from '../utils/floydWarshall.js';
import { runTSP } from '../utils/tsp.js';
import { runPrim } from '../utils/prim.js';
import { runDFSComponents, runBFSTraversal } from '../utils/bfsDfs.js';
import Repository from '../models/dataRepository.js';

async function getActiveGraphData() {
  const blockedEdges = await Repository.getBlockedEdges();
  const trafficMultipliers = await Repository.getTrafficMultipliers();
  const adjList = getAdjacencyList(EDGES, trafficMultipliers, blockedEdges);
  return { adjList, blockedEdges, trafficMultipliers };
}

export const routingController = {
  // Dijkstra path optimization
  async getDijkstraPath(req, res) {
    try {
      const { startNode, endNode } = req.body;
      if (startNode === undefined || endNode === undefined) {
        return res.status(400).json({ error: "Missing startNode or endNode" });
      }

      const { adjList } = await getActiveGraphData();
      const result = runDijkstra(adjList, Number(startNode), Number(endNode), NODES.length);
      
      res.json({
        startNode: Number(startNode),
        endNode: Number(endNode),
        path: result.path,
        weight: result.weight,
        distance: result.distance,
        steps: result.steps
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Floyd Warshall lookup
  async getFloydWarshallMatrix(req, res) {
    try {
      const { adjList } = await getActiveGraphData();
      const result = runFloydWarshall(adjList, NODES.length);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // TSP multi-stop routing
  async getTSPRoute(req, res) {
    try {
      const { selectedNodes } = req.body; // e.g. [1, 4, 7, 5]
      if (!selectedNodes || !Array.isArray(selectedNodes) || selectedNodes.length < 2) {
        return res.status(400).json({ error: "Provide at least 2 selectedNodes for TSP" });
      }

      const { adjList } = await getActiveGraphData();
      const fw = runFloydWarshall(adjList, NODES.length);
      const result = runTSP(selectedNodes.map(Number), fw.dist);
      
      // Expand the TSP tour nodes to show full paths between consecutive stops
      const fullPath = [];
      for (let i = 0; i < result.path.length - 1; i++) {
        const pathSegment = reconstructPathFW(result.path[i], result.path[i + 1], fw.next);
        if (i === 0) {
          fullPath.push(...pathSegment);
        } else {
          fullPath.push(...pathSegment.slice(1)); // avoid double-adding overlapping node
        }
      }

      res.json({
        tour: result.path,
        fullPath,
        distance: result.distance,
        complexity: result.stepsCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Prim's MST communications tree
  async getPrimMST(req, res) {
    try {
      const { blockedEdges } = await getActiveGraphData();
      // Filter out blocked edges for communications line as well (cables can't cross destroyed bridges)
      const activeEdges = EDGES.filter(edge => 
        !blockedEdges.some(b => 
          (b.source === edge.source && b.target === edge.target) ||
          (b.source === edge.target && b.target === edge.source)
        )
      );

      const result = runPrim(NODES, activeEdges);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // BFS / DFS connectivity check
  async getDisasterStatus(req, res) {
    try {
      const { adjList, blockedEdges } = await getActiveGraphData();
      
      // DFS diagnostic
      const dfsResult = runDFSComponents(adjList, NODES.length);
      
      // BFS traversal starting at Majestic (City Hub 1)
      const bfsResult = runBFSTraversal(adjList, 1, NODES.length);

      res.json({
        blockedEdges,
        isConnected: dfsResult.isConnected,
        components: dfsResult.components,
        isolatedNodes: dfsResult.isolatedNodes,
        bfsTraversalOrder: bfsResult.traversalOrder,
        hopDistancesFromHub: bfsResult.hopDistancesFromHub
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
