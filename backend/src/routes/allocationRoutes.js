import express from 'express';
import { allocationController } from '../controllers/allocationController.js';

const router = express.Router();

router.get('/ambulances', allocationController.getAmbulances);
router.get('/hospitals', allocationController.getHospitals);
router.post('/optimize', allocationController.optimizeAllocations);
router.get('/settings', allocationController.getSettings);
router.put('/settings', allocationController.updateSettings);
router.post('/road-block', allocationController.toggleRoadBlockage);
router.post('/traffic-update', allocationController.updateTraffic);
router.post('/reset', allocationController.resetSystem);

export default router;
