import { useState } from "react";
import ReportEmergency from "./ReportEmergency.jsx";
import TrackEmergency from "./TrackEmergency.jsx";

export default function CitizenHome() {
  const [page, setPage] = useState("home");

if (page === "report") {
  return <ReportEmergency goBack={() => setPage("home")} />;
}

 if (page === "track") {
  return <TrackEmergency goBack={() => setPage("home")} />;
}

 return (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/20 rounded-3xl p-10 shadow-2xl">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-cyan-400 mb-3">
          🚑 AEGIS
        </h1>

        <h2 className="text-xl text-white font-semibold">
          Citizen Emergency Portal
        </h2>

        <p className="text-slate-400 mt-3">
          Emergency Assistance Available 24/7
        </p>
      </div>

      <div className="space-y-4">

        <button
          onClick={() => setPage("report")}
          className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg transition-all"
        >
          Report Emergency
        </button>

        <button
          onClick={() => setPage("track")}
          className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg transition-all"
        >
          Track Emergency
        </button>

      </div>

    </div>
  </div>
);
}