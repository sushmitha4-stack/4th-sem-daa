import Repository from '../models/dataRepository.js';
import { runFloydWarshall } from '../utils/floydWarshall.js';
import { runDijkstra } from "../utils/dijkstra.js";
import { EDGES, getAdjacencyList, NODES } from '../utils/cityGraph.js';

export const emergencyController = {
  // Get all emergencies
  async getEmergencies(req, res) {
    try {
      const list = await Repository.getEmergencies();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Report a new emergency (with AI priority ranking and nearest ambulance assignment)
  async reportEmergency(req, res) {
    try {
      const {
  type,
  severity,
  nodeId,
  name,
  phone,
  victims,
  location,
  notes
} = req.body;
      if (!type || !severity || nodeId === undefined) {
        return res.status(400).json({ error: "Missing type, severity, or nodeId" });
      }

      // 1. Priority score computation (AI Priority ranking)
      let severityWeight = 2.0;
      if (severity === "Critical") severityWeight = 10.0;
      else if (severity === "High") severityWeight = 7.5;
      else if (severity === "Medium") severityWeight = 5.0;
      else if (severity === "Low") severityWeight = 2.5;

      const priority = Math.min(
  Number((severityWeight + Math.random() * 0.5).toFixed(1)),
  10
);

      // 2. Fetch current resources
      const ambulances = await Repository.getAmbulances();
      const hospitals = await Repository.getHospitals();
      const blockedEdges = await Repository.getBlockedEdges();
      const trafficMultipliers = await Repository.getTrafficMultipliers();
      const adjList = getAdjacencyList(EDGES, trafficMultipliers, blockedEdges);

      // Precompute Floyd Warshall distances to find nearest resources
      const fw = runFloydWarshall(adjList, NODES.length);

      // Find nearest Idle ambulance
      let bestAmbulance = null;
      let minAmbDist = Infinity;
      
      ambulances.forEach(amb => {
        if (amb.status === "Idle") {
          const dist = fw.dist[amb.currentNode][nodeId];
          if (dist < minAmbDist) {
            minAmbDist = dist;
            bestAmbulance = amb;
          }
        }
      });

      // Find nearest Hospital with ICU beds available
      let bestHospital = null;
      let minHospDist = Infinity;

      hospitals.forEach(hosp => {
        if (hosp.icuBedsAvailable > 0) {
          const dist = fw.dist[nodeId][hosp.nodeId];
          if (dist < minHospDist) {
            minHospDist = dist;
            bestHospital = hosp;
          }
        }
      });

      // 3. Prepare emergency record
      const emergencyData = {
  type,
  severity,
  nodeId: Number(nodeId),

  // Citizen Details
  name,
  phone,
  victims,
  location,
  notes,

  // Emergency System Data
  priority,
  status: "Pending",
  assignedAmbulanceId: null,
  assignedHospitalId: null,
  timestamp: new Date().toISOString()
};

      if (bestAmbulance && bestHospital) {
        console.log(
  "AMBULANCE NODE:",
  bestAmbulance.currentNode
);

console.log(
  "EMERGENCY NODE:",
  Number(nodeId)
);

console.log(
  "HOSPITAL NODE:",
  bestHospital.nodeId
);
        const ambulanceRoute = runDijkstra(
         
  adjList,
  bestAmbulance.currentNode,
  Number(nodeId),
  NODES.length
);
console.log(
  "AMBULANCE ROUTE:",
  ambulanceRoute
);

const hospitalRoute = runDijkstra(
  adjList,
  Number(nodeId),
  bestHospital.nodeId,
  NODES.length
);
        emergencyData.status = "En-Route";
        emergencyData.assignedAmbulanceId = bestAmbulance.id;
        emergencyData.assignedHospitalId = bestHospital.id;
        emergencyData.ambulanceRoute = ambulanceRoute.path;
emergencyData.hospitalRoute = hospitalRoute.path;

emergencyData.ambulanceDistance = ambulanceRoute.distance;
emergencyData.hospitalDistance = hospitalRoute.distance;

        // Dispatch ambulance
        await Repository.updateAmbulance(bestAmbulance.id, {
          status: "En-Route",
          targetNode: Number(nodeId)
        });

        // Deduct bed
        await Repository.updateHospital(bestHospital.id, {
          icuBedsAvailable: bestHospital.icuBedsAvailable - 1
        });
      }

      const created = await Repository.createEmergency(emergencyData);
      
      res.status(201).json({
        message: emergencyData.assignedAmbulanceId 
          ? `Emergency reported and resource assigned! Dispatched ${bestAmbulance.name} and allocated bed at ${bestHospital.name}.`
          : `Emergency reported but put on hold (no idle ambulances or ICU beds available).`,
        emergency: created
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Resolve emergency case (re-allocate resources, update stats)
  async resolveEmergency(req, res) {
    try {
      const { id } = req.params;
      const emergencies = await Repository.getEmergencies();
      const emergency = emergencies.find(e => String(e.id) === String(id));

      if (!emergency) {
        return res.status(404).json({ error: "Emergency not found" });
      }

      if (emergency.status === "Resolved") {
        return res.status(400).json({ error: "Emergency is already resolved" });
      }

      // Calculate response time (simulation)
      const start = new Date(emergency.timestamp).getTime();
      const diffMin = ((Date.now() - start) / 60000);
      const simulatedResponseTime = Math.max(3.5, Number((diffMin + 4 + Math.random() * 3).toFixed(1))); // realistically scaled

      // Updates
      const updates = {
        status: "Resolved",
        responseTime: simulatedResponseTime
      };

      await Repository.updateEmergency(id, updates);

      // Release ambulance if it was assigned
      if (emergency.assignedAmbulanceId !== null && emergency.assignedAmbulanceId !== undefined) {
        const ambulances = await Repository.getAmbulances();
        const amb = ambulances.find(a => String(a.id) === String(emergency.assignedAmbulanceId));
        if (amb) {
          // Relocate ambulance to the hospital node (representing it finished dropping patient off)
          const hospId = emergency.assignedHospitalId;
          const hospitals = await Repository.getHospitals();
          const hosp = hospitals.find(h => String(h.id) === String(hospId));
          const finalNode = hosp ? hosp.nodeId : emergency.nodeId;

          await Repository.updateAmbulance(emergency.assignedAmbulanceId, {
            status: "Idle",
            currentNode: finalNode,
            targetNode: null,
            battery: Math.max(40, amb.battery - 8) // battery drainage
          });
        }
      }

      res.json({
        message: `Emergency resolved. Response time: ${simulatedResponseTime} mins. Responding vehicle has returned to standby.`,
        responseTime: simulatedResponseTime
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
