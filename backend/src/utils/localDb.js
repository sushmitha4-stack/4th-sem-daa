import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../../database.json');

// Base Bangalore Data Seed
import { NODES } from './cityGraph.js';

const DEFAULT_HOSPITALS = [
  { id: 0, name: "RVCE Medical Health Center", nodeId: 0, icuBedsMax: 10, icuBedsAvailable: 8, coordinates: { x: 150, y: 480 } },
  { id: 1, name: "Narayana Health HSR", nodeId: 5, icuBedsMax: 50, icuBedsAvailable: 12, coordinates: { x: 580, y: 480 } },
  { id: 2, name: "Manipal Hospital Whitefield", nodeId: 6, icuBedsMax: 100, icuBedsAvailable: 24, coordinates: { x: 880, y: 280 } },
  { id: 3, name: "Columbia Asia Hebbal", nodeId: 3, icuBedsMax: 60, icuBedsAvailable: 15, coordinates: { x: 500, y: 100 } },
  { id: 4, name: "Fortis Hospital Jayanagar", nodeId: 8, icuBedsMax: 40, icuBedsAvailable: 6, coordinates: { x: 420, y: 520 } },
  { id: 5, name: "Bowring & Lady Curzon Hospital", nodeId: 1, icuBedsMax: 80, icuBedsAvailable: 4, coordinates: { x: 400, y: 320 } }
];

const DEFAULT_AMBULANCES = [
  { id: 0, name: "Rescuer-A1 (ALS)", type: "ALS", status: "Idle", currentNode: 0, targetNode: null, speed: 50, battery: 98 },
  { id: 1, name: "Rescuer-B2 (BLS)", type: "BLS", status: "Idle", currentNode: 1, targetNode: null, speed: 45, battery: 100 },
  { id: 2, name: "Rescuer-A3 (ALS)", type: "ALS", status: "Idle", currentNode: 3, targetNode: null, speed: 55, battery: 85 },
  { id: 3, name: "Rescuer-B4 (BLS)", type: "BLS", status: "Idle", currentNode: 5, targetNode: null, speed: 40, battery: 92 },
  { id: 4, name: "Rescuer-B5 (BLS)", type: "BLS", status: "Idle", currentNode: 8, targetNode: null, speed: 42, battery: 78 }
];

const DEFAULT_EMERGENCIES = [
  { id: 101, type: "Cardiac Arrest", severity: "Critical", status: "Resolved", nodeId: 0, timestamp: new Date(Date.now() - 3600000).toISOString(), assignedAmbulanceId: 0, assignedHospitalId: 0, priority: 9.8, responseTime: 8.5 },
  { id: 102, type: "Highway Collision", severity: "Critical", status: "En-Route", nodeId: 7, timestamp: new Date().toISOString(), assignedAmbulanceId: 3, assignedHospitalId: 2, priority: 9.5, responseTime: null },
  { id: 103, type: "Warehouse Fire", severity: "High", status: "Pending", nodeId: 4, timestamp: new Date().toISOString(), assignedAmbulanceId: null, assignedHospitalId: null, priority: 7.6, responseTime: null }
];

const DEFAULT_STATE = {
  emergencies: DEFAULT_EMERGENCIES,
  ambulances: DEFAULT_AMBULANCES,
  hospitals: DEFAULT_HOSPITALS,
  blockedEdges: [],
  trafficMultipliers: {},
  settings: {
    trafficWeight: 1.5,
    dispatchAlgorithm: "Hungarian",
    maxResponseTimer: 15
  }
};

class LocalDb {
  constructor() {
    this.data = { ...DEFAULT_STATE };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (error) {
      console.error("Failed to load local DB, using default state", error);
      this.data = { ...DEFAULT_STATE };
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error("Failed to save local DB", error);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  set(collection, items) {
    this.data[collection] = items;
    this.save();
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    if (!item.id && item._id) item.id = item._id;
    if (!item.id) item.id = Date.now();
    this.data[collection].push(item);
    this.save();
    return item;
  }

  updateById(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(item => String(item.id) === String(id));
    if (index !== -1) {
      this.data[collection][index] = { ...this.data[collection][index], ...updates };
      this.save();
      return this.data[collection][index];
    }
    return null;
  }

  deleteById(collection, id) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => String(item.id) !== String(id));
    this.save();
    return this.data[collection].length < initialLen;
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
    return true;
  }
}

export const localDb = new LocalDb();
export default localDb;
