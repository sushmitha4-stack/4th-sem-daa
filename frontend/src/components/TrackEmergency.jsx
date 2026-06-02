import { useState } from "react";

export default function TrackEmergency({ goBack }) {
  const [referenceId, setReferenceId] = useState("");
  const [emergency, setEmergency] = useState(null);

  const handleTrack = async () => {
    try {
      const response = await fetch("/api/emergencies");
      const data = await response.json();

      const found = data.find(
        (e) => String(e.id) === String(referenceId)
      );

      if (!found) {
        alert("Emergency ID not found");
        return;
      }

      setEmergency(found);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch emergency details");
    }
  };

return (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

    <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10">

      <button
      onClick={goBack}
      className="mb-4 px-4 py-2 bg-slate-700 text-white rounded"
    >
      ← Back
    </button>

   <h1 className="text-3xl font-bold text-cyan-400 mb-6">
  🔍 Track Emergency
</h1>

     <input
  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
  type="text"
  placeholder="Enter Reference ID"
  value={referenceId}
  onChange={(e) => setReferenceId(e.target.value)}
/>

      <br />
      <br />

      <button
  onClick={handleTrack}
  className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg transition-all duration-300"
>
  Track Emergency
</button>

      {emergency && (
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
  Emergency Details
</h2>

          <p><strong>ID:</strong> {emergency.id}</p>
          <p><strong>Status:</strong> {emergency.status}</p>
          <p><strong>Type:</strong> {emergency.type}</p>
          <p><strong>Severity:</strong> {emergency.severity}</p>
          <p><strong>Victims:</strong> {emergency.victims}</p>
          <p><strong>Location:</strong> {emergency.location}</p>
          <p><strong>Assigned Ambulance:</strong> {emergency.assignedAmbulanceId}</p>
          <p><strong>Assigned Hospital:</strong> {emergency.assignedHospitalId}</p>
        </div>
      )}
    </div>
    </div>
  );
}