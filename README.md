# Aegis Command - AI Smart Emergency Routing & Resource Allocation Platform

Aegis Command is an enterprise-grade, startup-style intelligent operations platform designed to optimize emergency dispatching, routing, resource pairing, and network resilience. Using classical Design and Analysis of Algorithms (DAA) concepts, it simulates and manages emergency logistics in Bangalore.

---

## 🚀 Key Features

1. **Autonomous Emergency Dashboard**: Monitors active alerts, hospital loads, standby ambulances, and displays live telemetry tickers.
2. **Dynamic Route Optimization**: Dijkstra-based real-time path calculations with interactive congestion parameters.
3. **Hungarian Bipartite Allocator**: A Kuhn-Munkres matching matrix interface pairing calls with ambulances to minimize global travel cost.
4. **Disaster Management Containment**: DFS connectivity analysis to flag isolated zones, and BFS level-order diagnostics.
5. **Prim's Spanning Network**: Spans a minimum communication fiber line connecting all active hubs with minimal cost.
6. **Telemetry Analytics**: Recharts-based telemetry charts tracking response times, fuel saved, and algorithm speeds.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Recharts, SVG Vector GIS Map.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose) with a built-in local JSON file persistence fallback if MongoDB is offline.

---

## 🧬 DAA Algorithms Integration

| Algorithm | Role in Aegis | Complexity |
| :--- | :--- | :--- |
| **Dijkstra's Algorithm** | Real-time traffic-aware routing from ambulance to patient, then to hospital. | $O(E \log V)$ |
| **Floyd-Warshall** | Precomputes all-pairs shortest paths for instant $O(1)$ dispatch lookups. | $O(V^3)$ |
| **Hungarian Algorithm** | Bipartite matching optimization of pending calls to standby vehicles. | $O(V^3)$ |
| **Travelling Salesman (TSP)** | Dynamic Programming multi-stop path planning for delivery trucks. | $O(2^N N^2)$ |
| **Prim's Algorithm** | Builds a Minimum Spanning Tree communications backup network. | $O(V^2)$ |
| **BFS & DFS** | Connectivity scan to isolate cut-off sectors (DFS) and log hop-distances (BFS). | $O(V + E)$ |

---

## 📂 Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # DB setup
│   │   ├── controllers/     # API handlers
│   │   ├── models/          # Repositories
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # DAA Algorithms
│   │   └── server.js        # Server entry
│   ├── package.json
│   └── database.json        # Fallback database
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── utils/           # Helper scripts
│   │   ├── App.jsx          # UI root
│   │   ├── main.jsx         # Bootloader
│   │   └── index.css        # Styles & animations
│   ├── package.json
│   ├── tailwind.config.js
│   ├── index.html
│   └── vite.config.js
├── start-platform.bat       # One-click Windows launcher
└── README.md
```

---

## ⚡ Quick Start Instructions

### Prerequisites
- Node.js (v16.x or higher)
- npm (v7.x or higher)
- *Optional*: MongoDB (connected automatically if running locally)

### Installation
1. Open a terminal in the root directory.
2. Install all dependencies for both directories:
   ```bash
   npm run install-all
   ```

### Running Locally
- **Windows**: Double-click `start-platform.bat` at the root of the project.
- **Other OS**: Run the following command in the root terminal:
   ```bash
   npm run dev
   ```

The application will launch on:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
