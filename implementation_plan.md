# Implementation Plan - AI Smart Emergency Routing and Resource Allocation Platform

The **AI Smart Emergency Routing and Resource Allocation Platform** is a modern, enterprise-grade, startup-style intelligent SaaS platform designed to optimize critical emergency services. It uses six classical Design and Analysis of Algorithms (DAA) concepts to solve real-world emergency dispatching, routing, resource pairing, and disaster containment challenges.

---

## User Review Required

> [!IMPORTANT]
> **No Database Setup Hurdles**: To ensure the platform runs instantly out-of-the-box without requiring a pre-installed MongoDB database, we will implement a dual-mode database service. It will connect to MongoDB if configured, but gracefully fall back to an in-memory/file-based persistence store if MongoDB is unavailable.
> 
> **Interactive Map Strategy**: We will build a high-fidelity, interactive SVG and Canvas-based GIS dashboard map of Bangalore's key medical hubs and intersections. This allows us to draw dynamic glowing paths, simulate ambulance movements in real-time, overlay pulsing fire/flood zones, and control map styling (cyberpunk dark-theme/glassmorphism) completely. It functions 100% reliably without requiring external Mapbox/Google API keys, which often break or require configuration.

---

## Open Questions
- **No open questions**: The requirements are fully detailed, and the proposed hybrid database + vector map strategy ensures immediate, error-free local setup.

---

## Proposed Changes

We will create a monorepo structure with a Node/Express backend and a React (Vite) frontend.

```
/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration and DB connections
│   │   ├── controllers/     # Route logic for emergencies, resource allocation, routes
│   │   ├── models/          # MongoDB / Mock Schema definitions
│   │   ├── routes/          # Express API route endpoints
│   │   ├── utils/           # DAA Algorithm Implementations (Dijkstra, Floyd-Warshall, TSP, Hungarian, Prim, BFS/DFS)
│   │   └── server.js        # Main Express entry point
│   ├── package.json
│   └── database.json        # File fallback DB for offline execution
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── EmergencyMonitor.jsx
│   │   │   ├── RouteOptimizer.jsx
│   │   │   ├── HospitalAllocation.jsx
│   │   │   ├── DisasterResponse.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Auth.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind directives and custom animations
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── vite.config.js
├── package.json             # Root workspace script launcher
└── README.md
```

### Component Breakdown

---

### 1. DAA Algorithm Implementations (`backend/src/utils/`)

These utility files will house clean, well-commented JS implementations of the six DAA algorithms.

#### Dijkstra's Algorithm (`dijkstra.js`)
- **Use Case**: Real-time traffic-aware routing. Finds the shortest path from an ambulance's current location to an emergency, and then to a hospital.
- **Dynamic Elements**: Nodes represent city hubs, edges represent roads. Road weights are modified in real-time by traffic congestion factors (e.g., weight = distance * traffic_factor).
- **Output**: Shortest distance, array of nodes in the path, and execution step details.

#### Floyd-Warshall Algorithm (`floydWarshall.js`)
- **Use Case**: All-pairs shortest path pre-computation. Computes the distance matrix between all pairs of hubs. Useful for instant lookup of distances when performing global resources assignment.
- **Output**: 2D distance matrix and routing table (next-hop) for the entire city.

#### Travelling Salesman Problem (`tsp.js`)
- **Use Case**: Optimizing multi-stop routes. For instance, when a disaster response unit needs to visit multiple minor emergency locations to drop supplies or assess damage and then return to base.
- **Implementation**: Dynamic programming with bitmasking (or memoized branch-and-bound for up to 15 nodes) to guarantee the absolute shortest tour.
- **Output**: The optimal sequence of nodes to visit, total distance, and time complexity.

#### Assignment Problem (`assignment.js`)
- **Use Case**: Pairing the $N$ active emergencies with the $M$ closest and most suitable ambulances/hospitals.
- **Implementation**: Hungarian Algorithm (Kuhn-Munkres) to find the minimum-cost perfect matching on a bipartite graph. The cost function combines physical distance, emergency severity vs. ambulance equipment (ALS/BLS), and hospital ICU availability.
- **Output**: Pairings (Emergency $i \to$ Ambulance $j$, Emergency $i \to$ Hospital $k$) that minimize the global response time.

#### Prim’s Algorithm (`prim.js`)
- **Use Case**: Minimum Emergency Communication Network (MECN). In disaster mode, creates a minimum spanning tree connecting all major emergency stations, hospitals, and command shelters to establish a temporary emergency fiber-optic or radio network with the minimum cabling cost.
- **Output**: Minimum Spanning Tree edges, total connection cost, and visualization coordinates.

#### BFS/DFS Graph Traversal (`bfsDfs.js`)
- **Use Case**: Disaster Containment & Isolation Check.
  - **DFS**: Detects connected components of the city grid. Checks if any parts of the city are entirely cut off (isolated) by flooded or blocked roads.
  - **BFS**: Finds the level-order traversal of rescue zones, determining the layer-by-layer expansion of help from dispatch centers.
- **Output**: Isolated locations list, alternative routing bridges, reachable nodes count.

---

### 2. Node/Express Backend (`backend/`)

Provides REST APIs for dashboard statistics, active emergencies, real-time allocations, pathfinding runs, and simulated updates.

- **Models**:
  - `Emergency`: Status (Pending, Dispatched, Resolved), Severity (Critical, High, Medium, Low), Coordinates, Node location, Type (Cardiac, Accident, Fire, Flood, etc.), Priority score.
  - `Ambulance`: Status (Idle, En-Route, Busy), Type (ALS - Advanced Life Support, BLS - Basic Life Support), Current Node, Speed.
  - `Hospital`: ICU Beds Available, Total Capacity, Coordinates, Node location, Contact info.
  - `CityGraph`: Nodes (names, x-y coordinates) and edges (distance, base traffic, active blockages).

- **Endpoints**:
  - `GET /api/dashboard`: Summary stats (response time, fuel saved, active count, hospital load).
  - `GET/POST /api/emergencies`: Fetch all or report a new emergency. Triggers real-time allocation algorithms.
  - `POST /api/routing/dijkstra`: Dynamic shortest path between two points.
  - `GET /api/routing/floyd-warshall`: All-pairs distance grid.
  - `POST /api/routing/tsp`: Computes optimal multi-stop tour for selected points.
  - `POST /api/routing/prim`: Computes minimum communication grid.
  - `POST /api/routing/disaster-status`: Runs BFS/DFS to check node accessibility after blockages are added.
  - `POST /api/allocations/optimize`: Re-runs the Hungarian assignment globally.

---

### 3. React Frontend (`frontend/`)

A high-tech, futuristic dashboard designed with premium glassmorphism.

#### Dashboard & Interactive Map View (`MapView.jsx`)
- Canvas & SVG-based vector rendering of Bangalore's key hubs.
- Visual elements:
  - Glowing grid lines for road connections.
  - Pulsing red rings for emergencies (sized by severity).
  - Cyan dots for ambulances moving along calculated routes.
  - Glowing green nodes for hospitals.
  - Orange/Red shaded polygons indicating fire/flood disaster zones.
  - Animated dash arrays representing the active paths (Dijkstra/TSP/Prim).

#### Modules/Pages:
1. **Landing Page**: Immersive, dark cybernetic entrance showing platform features and live dispatch simulation stats.
2. **Auth (Login/Register)**: Glassmorphic panel with modern inputs and transitions.
3. **Emergency Monitor**: Real-time ticker of incoming calls, automated severity classification (using mock NLP), and manual dispatch selectors.
4. **Smart Route Optimization Page**: User selects Start and End nodes, drags a slider to simulate traffic, and watches Dijkstra run step-by-step with details on execution speed and weights.
5. **Hospital Allocation Page**: Shows the Assignment Problem matrix. Displays how the Hungarian algorithm matches patients to hospitals based on ICU capacity and distance.
6. **Disaster Mode Panel**: Allows placing flood/fire blockages on roads. Instantly runs BFS/DFS to highlight isolated sectors in glowing orange dashes and lists alternative bridges. Draws the Prim's MST communication grid.
7. **Analytics**: Sleek Recharts analytics charts displaying historical response times, fuel saved, lives saved, and algorithm execution efficiency comparisons.

---

## Verification Plan

### Automated Verification
We will run tests and start scripts:
- Backend verification: `npm run test` or check backend APIs using a verification script.
- Frontend build verification: Run `npm run build` inside the frontend folder to verify Vite bundling compiles perfectly without TS or JSX errors.

### Manual Verification
- We will start both the frontend and backend servers.
- We will use the browser tool to open `http://localhost:5173` (or the Vite dev port) and manually navigate all pages (Landing, Login, Dashboard, Route Optimizer, Disaster Mode, Analytics) to ensure the maps render beautifully, the routes compute in under 10ms, and animations run smoothly at 60 FPS.
