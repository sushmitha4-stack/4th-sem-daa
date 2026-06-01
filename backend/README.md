# Backend

This folder contains the Express API server for Aegis Command.

## Purpose
The backend handles emergency routing logic, resource matching, and algorithm processing. It provides endpoints for the frontend to query dispatch details and calculate optimized routes.

## Run locally
From the `backend` folder:
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev` — start the server with `nodemon`
- `npm start` — start the server with `node`

## Main files
- `src/server.js` — app entry point
- `src/routes/` — Express routes
- `src/controllers/` — request handling and API logic
- `src/utils/` — algorithm utilities for routing, matching, and graph operations
- `src/models/dataRepository.js` — data persistence logic
