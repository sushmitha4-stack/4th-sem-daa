import Repository from '../models/dataRepository.js';
import { runHungarian } from '../utils/assignment.js';
import { runFloydWarshall } from '../utils/floydWarshall.js';
import { EDGES, getAdjacencyList, NODES } from '../utils/cityGraph.js';

export const allocationController = {
  // Get all ambulances
  async getAmbulances(req, res) {
    try {
      const list = await Repository.getAmbulances();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get all hospitals
  async getHospitals(req, res) {
    try {
      const list = await Repository.getHospitals();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Solve bipartite assignment of idle ambulances to pending emergencies using the Hungarian Algorithm
  async optimizeAllocations(req, res) {
    try {
      const emergencies = await Repository.getEmergencies();
      const ambulances = await Repository.getAmbulances();
      const hospitals = await Repository.getHospitals();
      const blockedEdges = await Repository.getBlockedEdges();
      const trafficMultipliers = await Repository.getTrafficMultipliers();

      // Filter active (pending) emergencies and idle ambulances
      const pendingCalls = emergencies.filter(e => e.status === "Pending");
      const idleAmbulances = ambulances.filter(a => a.status === "Idle");

      if (pendingCalls.length === 0 || idleAmbulances.length === 0) {
        return res.json({
          message: "No global matching needed. Pending emergencies: " + pendingCalls.length + ", Standby ambulances: " + idleAmbulances.length,
          assignments: []
        });
      }

      // Compute Floyd-Warshall distance matrix for node calculations
      const adjList = getAdjacencyList(EDGES, trafficMultipliers, blockedEdges);
      const fw = runFloydWarshall(adjList, NODES.length);

      // Build Cost Matrix: Row = Ambulance, Col = Emergency
      // Cost = distance(ambulance, emergency) + equipment mismatch penalty
      const costMatrix = [];
      for (let i = 0; i < idleAmbulances.length; i++) {
        const amb = idleAmbulances[i];
        const row = [];
        for (let j = 0; j < pendingCalls.length; j++) {
          const emergency = pendingCalls[j];
          let dist = fw.dist[amb.currentNode][emergency.nodeId];
          
          if (dist === Infinity) dist = 99999; // unreachable

          // Priority/Equipment penalty:
          // Critical emergency assigned to BLS ambulance incurs a penalty of 50 units
          let penalty = 0;
          if (emergency.severity === "Critical" && amb.type === "BLS") {
            penalty += 50;
          }
          if (emergency.severity === "High" && amb.type === "BLS") {
            penalty += 20;
          }

          row.push(dist + penalty);
        }
        costMatrix.push(row);
      }

      // Run Hungarian matching
      const matches = runHungarian(costMatrix);
      const matchedResults = [];

      for (let k = 0; k < matches.length; k++) {
        const { row, col, cost } = matches[k];
        const amb = idleAmbulances[row];
        const emergency = pendingCalls[col];

        // Find closest hospital with beds for this emergency
        let nearestHospital = null;
        let minHospDist = Infinity;
        
        hospitals.forEach(h => {
          if (h.icuBedsAvailable > 0) {
            const hDist = fw.dist[emergency.nodeId][h.nodeId];
            if (hDist < minHospDist) {
              minHospDist = hDist;
              nearestHospital = h;
            }
          }
        });

        if (nearestHospital) {
          // Perform dispatch updates in DB
          await Repository.updateEmergency(emergency.id, {
            status: "En-Route",
            assignedAmbulanceId: amb.id,
            assignedHospitalId: nearestHospital.id
          });

          await Repository.updateAmbulance(amb.id, {
            status: "En-Route",
            targetNode: emergency.nodeId
          });

          await Repository.updateHospital(nearestHospital.id, {
            icuBedsAvailable: nearestHospital.icuBedsAvailable - 1
          });

          matchedResults.push({
            emergencyId: emergency.id,
            emergencyType: emergency.type,
            ambulanceName: amb.name,
            hospitalName: nearestHospital.name,
            routingCost: Number(cost.toFixed(2))
          });
        }
      }

      res.json({
        message: `Successfully executed Hungarian matching. Dispatched ${matchedResults.length} ambulances.`,
        assignments: matchedResults
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update Settings
  async getSettings(req, res) {
    try {
      const s = await Repository.getSettings();
      res.json(s);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateSettings(req, res) {
    try {
      const saved = await Repository.saveSettings(req.body);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Toggle Road blockages (Disaster Mode)
  async toggleRoadBlockage(req, res) {
    try {
      const { source, target } = req.body;
      if (source === undefined || target === undefined) {
        return res.status(400).json({ error: "Missing source or target" });
      }

      let blocked = await Repository.getBlockedEdges();
      const existingIdx = blocked.findIndex(b => 
        (b.source === Number(source) && b.target === Number(target)) ||
        (b.source === Number(target) && b.target === Number(source))
      );

      if (existingIdx !== -1) {
        // Unblock
        blocked.splice(existingIdx, 1);
      } else {
        // Block
        blocked.push({ source: Number(source), target: Number(target) });
      }

      await Repository.saveBlockedEdges(blocked);
      res.json({ message: "Road blockages updated successfully", blockedEdges: blocked });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update edge traffic multiplier
  async updateTraffic(req, res) {
    try {
      const { source, target, multiplier } = req.body;
      if (source === undefined || target === undefined || multiplier === undefined) {
        return res.status(400).json({ error: "Missing source, target, or multiplier" });
      }

      const traffic = await Repository.getTrafficMultipliers();
      const key = `${source}-${target}`;
      traffic[key] = Number(multiplier);

      await Repository.saveTrafficMultipliers(traffic);
      res.json({ message: "Traffic congestion index updated.", trafficMultipliers: traffic });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Reset/Seed system defaults
  async resetSystem(req, res) {
    try {
      await Repository.resetAll();
      res.json({ message: "System re-initialized and seeded with default Bangalore map coordinates." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
