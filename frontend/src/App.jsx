import React, { useState, useEffect } from 'react';
import { 
  Shield, LayoutDashboard as DashboardIcon, AlertCircle, Navigation, 
  Settings as SettingsIcon, LogOut, BarChart3, HelpCircle, Layers, Grid
} from 'lucide-react';

// Subcomponents
import LandingPage from './components/LandingPage.jsx';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import EmergencyMonitor from './components/EmergencyMonitor.jsx';
import RouteOptimizer from './components/RouteOptimizer.jsx';
import HospitalAllocation from './components/HospitalAllocation.jsx';
import DisasterResponse from './components/DisasterResponse.jsx';
import Analytics from './components/Analytics.jsx';
import Settings from './components/Settings.jsx';

// Import Static Nodes/Edges representation
import { NODES, EDGES } from './utils/cityGraph.js';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing', 'login', 'dashboard'
  const [subPage, setSubPage] = useState('overview'); // 'overview', 'emergencies', 'routing', 'allocation', 'disaster', 'analytics', 'settings'
  
  // Data States
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [blockedEdges, setBlockedEdges] = useState([]);
  const [trafficMultipliers, setTrafficMultipliers] = useState({});
  const [settings, setSettings] = useState({ trafficWeight: 1.5, dispatchAlgorithm: "Hungarian", maxResponseTimer: 15 });

  // Load telemetry data from express backend APIs
  const fetchAllData = async () => {
    try {
      const emergenciesRes = await fetch('/api/emergencies');
      const emergenciesData = await emergenciesRes.json();
      setEmergencies(emergenciesData);

      const ambulancesRes = await fetch('/api/allocations/ambulances');
      const ambulancesData = await ambulancesRes.json();
      setAmbulances(ambulancesData);

      const hospitalsRes = await fetch('/api/allocations/hospitals');
      const hospitalsData = await hospitalsRes.json();
      setHospitals(hospitalsData);

      const statusRes = await fetch('/api/routing/disaster-status');
      const statusData = await statusRes.json();
      setBlockedEdges(statusData.blockedEdges || []);
      setTrafficMultipliers(statusData.trafficMultipliers || {});

      const settingsRes = await fetch('/api/allocations/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
    } catch (err) {
      console.warn("Express backend offline. Running in simulation client-only mode.");
    }
  };

  // Poll server for updates every 3 seconds when in dashboard
  useEffect(() => {
    if (page === 'dashboard') {
      fetchAllData();
      const interval = setInterval(fetchAllData, 3000);
      return () => clearInterval(interval);
    }
  }, [page]);

  // Report new Emergency
  const handleReportEmergency = async (formData) => {
    try {
      const response = await fetch('/api/emergencies/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert(data.message);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve Emergency
  const handleResolveEmergency = async (id) => {
    try {
      const response = await fetch(`/api/emergencies/${id}/resolve`, {
        method: 'PUT'
      });
      const data = await response.json();
      alert(data.message);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Run Global Hungarian Bipartite Dispatch Matching
  const handleRunGlobalMatching = async () => {
    try {
      const response = await fetch('/api/allocations/optimize', {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.message);
      fetchAllData();
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Toggle road blockages (Disaster Mode)
  const handleToggleBlockage = async (source, target) => {
    try {
      await fetch('/api/allocations/road-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, target })
      });
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Update edge traffic multiplier
  const handleUpdateTraffic = async (source, target, multiplier) => {
    try {
      await fetch('/api/allocations/traffic-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, target, multiplier })
      });
      fetchAllData();
      alert("Traffic congestion factor updated.");
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleUpdateSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/allocations/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await response.json();
      setSettings(data);
      alert("System preferences saved.");
    } catch (e) {
      console.error(e);
    }
  };

  // Reset System State
  const handleResetSystem = async () => {
    try {
      await fetch('/api/allocations/reset', { method: 'POST' });
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Landing Page handler
  if (page === 'landing') {
    return <LandingPage onEnter={() => setPage('login')} />;
  }

  // Auth/Login page handler
  if (page === 'login') {
    return <Auth onLogin={() => setPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100 font-sans">
      
      {/* SIDE NAVIGATION BAR */}
      <aside className="w-full lg:w-64 glass-panel border-r border-slate-900 flex flex-col shrink-0">
        {/* Brand logo */}
        <div className="p-6 border-b border-slate-900 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-200">AEGIS COMMAND</h1>
            <p className="text-[9px] text-slate-500 font-mono">v4.12 ADMIN TERMINAL</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 text-xs font-mono">
          {[
            { id: 'overview', label: 'Dashboard Control', icon: <Grid size={15} /> },
            { id: 'emergencies', label: 'Incident Dispatcher', icon: <AlertCircle size={15} /> },
            { id: 'routing', label: 'Dijkstra Routing', icon: <Navigation size={15} /> },
            { id: 'allocation', label: 'Hungarian Allocator', icon: <Layers size={15} /> },
            { id: 'disaster', label: 'Disaster Mode', icon: <AlertCircle size={15} className="text-rose-500" /> },
            { id: 'analytics', label: 'Operational Statistics', icon: <BarChart3 size={15} /> },
            { id: 'settings', label: 'Platform Settings', icon: <SettingsIcon size={15} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSubPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all uppercase tracking-wider ${
                subPage === item.id 
                  ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-900 space-y-4">
          <div className="text-[10px] font-mono text-slate-500 leading-normal">
            Station Status: <span className="text-emerald-400 font-bold">ONLINE</span><br />
            DB Interface: <span className="text-cyan-400 font-semibold">Active Fallback</span>
          </div>
          <button
            onClick={() => {
              setPage('landing');
              setSubPage('overview');
            }}
            className="w-full py-2.5 rounded-xl border border-slate-900 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-mono text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={13} />
            <span>Lock Terminal</span>
          </button>
        </div>
      </aside>

      {/* PRIMARY VIEWER PORTAL */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto h-screen relative">
        {/* Glow blur background layer */}
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        {subPage === 'overview' && (
          <Dashboard 
            nodes={NODES}
            edges={EDGES}
            emergencies={emergencies}
            ambulances={ambulances}
            hospitals={hospitals}
            blockedEdges={blockedEdges}
            trafficMultipliers={trafficMultipliers}
            onNavigateTo={setSubPage}
          />
        )}
        
        {subPage === 'emergencies' && (
          <EmergencyMonitor 
            nodes={NODES}
            emergencies={emergencies}
            ambulances={ambulances}
            hospitals={hospitals}
            onReportEmergency={handleReportEmergency}
            onResolveEmergency={handleResolveEmergency}
            onRunGlobalMatching={handleRunGlobalMatching}
          />
        )}

        {subPage === 'routing' && (
          <RouteOptimizer 
            nodes={NODES}
            edges={EDGES}
            blockedEdges={blockedEdges}
            trafficMultipliers={trafficMultipliers}
            onUpdateTraffic={handleUpdateTraffic}
          />
        )}

        {subPage === 'allocation' && (
          <HospitalAllocation 
            emergencies={emergencies}
            ambulances={ambulances}
            hospitals={hospitals}
            onRunGlobalMatching={handleRunGlobalMatching}
          />
        )}

        {subPage === 'disaster' && (
          <DisasterResponse 
            nodes={NODES}
            edges={EDGES}
            emergencies={emergencies}
            ambulances={ambulances}
            hospitals={hospitals}
            blockedEdges={blockedEdges}
            trafficMultipliers={trafficMultipliers}
            onToggleBlockage={handleToggleBlockage}
          />
        )}

        {subPage === 'analytics' && (
          <Analytics emergencies={emergencies} />
        )}

        {subPage === 'settings' && (
          <Settings 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSystem={handleResetSystem}
          />
        )}
      </main>

    </div>
  );
}
