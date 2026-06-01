import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { setMongoMode } from './models/dataRepository.js';

// Route Imports
import routingRoutes from './routes/routingRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Bind API Routes
app.use('/api/routing', routingRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/allocations', allocationRoutes);

// Health check and root route
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start DB connection and Express Server
async function startServer(port = PORT) {
  const isMongoConnected = await connectDB();
  setMongoMode(isMongoConnected);

  const server = app.listen(port, () => {
    console.log(`🚀 AI Smart Emergency Dispatch Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

startServer();
