import express from 'express';
import { routingController } from '../controllers/routingController.js';

const router = express.Router();

router.post('/dijkstra', routingController.getDijkstraPath);
router.get('/floyd-warshall', routingController.getFloydWarshallMatrix);
router.post('/tsp', routingController.getTSPRoute);
router.get('/prim-mst', routingController.getPrimMST);
router.get('/disaster-status', routingController.getDisasterStatus);

export default router;
