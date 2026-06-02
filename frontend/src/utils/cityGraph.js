export const NODES = [
  { id: 0, name: "RV College of Engineering (RVCE)", x: 150, y: 480, type: "hub" },
  { id: 1, name: "Majestic (City Center)", x: 400, y: 320, type: "hub" },
  { id: 2, name: "Yeshwanthpur", x: 280, y: 180, type: "intersection" },
  { id: 3, name: "Hebbal", x: 500, y: 100, type: "hub" },
  { id: 4, name: "Indiranagar", x: 620, y: 300, type: "intersection" },
  { id: 5, name: "Koramangala", x: 580, y: 480, type: "hub" },
  { id: 6, name: "Whitefield", x: 880, y: 280, type: "hub" },
  { id: 7, name: "Marathahalli", x: 740, y: 380, type: "intersection" },
  { id: 8, name: "Jayanagar", x: 420, y: 520, type: "intersection" },
  { id: 9, name: "Electronic City", x: 780, y: 600, type: "hub" }
];

export const EDGES = [
  { source: 0, target: 1, distance: 12, baseTraffic: 1.5 },
  { source: 0, target: 2, distance: 14, baseTraffic: 1.1 },
  { source: 0, target: 8, distance: 10, baseTraffic: 1.3 },
  { source: 1, target: 2, distance: 6,  baseTraffic: 1.8 },
  { source: 1, target: 3, distance: 10, baseTraffic: 1.6 },
  { source: 1, target: 4, distance: 7,  baseTraffic: 2.0 },
  { source: 1, target: 8, distance: 8,  baseTraffic: 1.7 },
  { source: 2, target: 3, distance: 8,  baseTraffic: 1.2 },
  { source: 3, target: 4, distance: 12, baseTraffic: 1.4 },
  { source: 4, target: 5, distance: 5,  baseTraffic: 1.9 },
  { source: 4, target: 7, distance: 8,  baseTraffic: 1.8 },
  { source: 5, target: 8, distance: 6,  baseTraffic: 1.5 },
  { source: 5, target: 7, distance: 7,  baseTraffic: 1.6 },
  { source: 5, target: 9, distance: 15, baseTraffic: 1.4 },
  { source: 7, target: 6, distance: 6,  baseTraffic: 1.7 },
  { source: 7, target: 9, distance: 18, baseTraffic: 1.3 },
  { source: 6, target: 9, distance: 22, baseTraffic: 1.2 }
];
