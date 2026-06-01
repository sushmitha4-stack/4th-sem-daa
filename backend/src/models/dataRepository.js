import mongoose from 'mongoose';
import localDb from '../utils/localDb.js';

// Define Mongoose Schemas for MongoDB mode
const EmergencySchema = new mongoose.Schema({
  type: String,
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
  status: { type: String, enum: ['Pending', 'En-Route', 'Resolved', 'Cancelled'], default: 'Pending' },
  nodeId: Number,
  timestamp: { type: Date, default: Date.now },
  assignedAmbulanceId: Number,
  assignedHospitalId: Number,
  priority: Number,
  responseTime: Number
});

const AmbulanceSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['ALS', 'BLS'] },
  status: { type: String, enum: ['Idle', 'En-Route', 'Busy'], default: 'Idle' },
  currentNode: Number,
  targetNode: Number,
  speed: Number,
  battery: Number
});

const HospitalSchema = new mongoose.Schema({
  name: String,
  nodeId: Number,
  icuBedsMax: Number,
  icuBedsAvailable: Number,
  coordinates: { x: Number, y: Number }
});

let MongooseEmergency, MongooseAmbulance, MongooseHospital;
let isMongo = false;

try {
  MongooseEmergency = mongoose.model('Emergency', EmergencySchema);
  MongooseAmbulance = mongoose.model('Ambulance', AmbulanceSchema);
  MongooseHospital = mongoose.model('Hospital', HospitalSchema);
} catch (e) {
  // Model might be compiled already
}

export function setMongoMode(active) {
  isMongo = active;
  console.log(`Repository Mode: ${isMongo ? 'MongoDB Active' : 'Local JSON Fallback Active'}`);
}

export const Repository = {
  // --- emergencies ---
  async getEmergencies() {
    if (isMongo && mongoose.connection.readyState === 1) {
      return await MongooseEmergency.find().lean();
    }
    return localDb.get('emergencies');
  },

  async createEmergency(data) {
    if (isMongo && mongoose.connection.readyState === 1) {
      const doc = await MongooseEmergency.create(data);
      return doc.toObject();
    }
    return localDb.insert('emergencies', {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'Pending',
      assignedAmbulanceId: null,
      assignedHospitalId: null,
      ...data
    });
  },

  async updateEmergency(id, updates) {
    if (isMongo && mongoose.connection.readyState === 1) {
      const doc = await MongooseEmergency.findByIdAndUpdate(id, updates, { new: true }).lean();
      return doc;
    }
    return localDb.updateById('emergencies', id, updates);
  },

  // --- ambulances ---
  async getAmbulances() {
    if (isMongo && mongoose.connection.readyState === 1) {
      return await MongooseAmbulance.find().lean();
    }
    return localDb.get('ambulances');
  },

  async updateAmbulance(id, updates) {
    if (isMongo && mongoose.connection.readyState === 1) {
      const doc = await MongooseAmbulance.findOneAndUpdate({ id }, updates, { new: true }).lean();
      return doc;
    }
    return localDb.updateById('ambulances', id, updates);
  },

  // --- hospitals ---
  async getHospitals() {
    if (isMongo && mongoose.connection.readyState === 1) {
      return await MongooseHospital.find().lean();
    }
    return localDb.get('hospitals');
  },

  async updateHospital(id, updates) {
    if (isMongo && mongoose.connection.readyState === 1) {
      const doc = await MongooseHospital.findOneAndUpdate({ id }, updates, { new: true }).lean();
      return doc;
    }
    return localDb.updateById('hospitals', id, updates);
  },

  // --- blocked edges (Disaster Mode) ---
  async getBlockedEdges() {
    return localDb.get('blockedEdges');
  },

  async saveBlockedEdges(edges) {
    localDb.set('blockedEdges', edges);
    return edges;
  },

  // --- traffic multipliers ---
  async getTrafficMultipliers() {
    return localDb.get('trafficMultipliers');
  },

  async saveTrafficMultipliers(multipliers) {
    localDb.set('trafficMultipliers', multipliers);
    return multipliers;
  },

  // --- settings ---
  async getSettings() {
    return localDb.data.settings || { trafficWeight: 1.5, dispatchAlgorithm: "Hungarian", maxResponseTimer: 15 };
  },

  async saveSettings(settings) {
    localDb.data.settings = settings;
    localDb.save();
    return settings;
  },

  // --- reset ---
  async resetAll() {
    if (isMongo && mongoose.connection.readyState === 1) {
      await MongooseEmergency.deleteMany({});
      await MongooseAmbulance.deleteMany({});
      await MongooseHospital.deleteMany({});
      // Seed default Mongo collections
      const defaultData = localDb.data;
      await MongooseEmergency.insertMany(defaultData.emergencies);
      await MongooseAmbulance.insertMany(defaultData.ambulances);
      await MongooseHospital.insertMany(defaultData.hospitals);
    }
    localDb.reset();
    return true;
  }
};
export default Repository;
