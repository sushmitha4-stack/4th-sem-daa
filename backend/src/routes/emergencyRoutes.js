import express from 'express';
import { emergencyController } from '../controllers/emergencyController.js';

const router = express.Router();

router.get('/', emergencyController.getEmergencies);
router.post('/report', emergencyController.reportEmergency);
router.put('/:id/resolve', emergencyController.resolveEmergency);

export default router;
