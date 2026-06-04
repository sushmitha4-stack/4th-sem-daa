import { useState } from "react";

export default function ReportEmergency({ goBack }) {
  const [formData, setFormData] = useState({
  name: "",
  phone: "",
  type: "",
  severity: "",
  victims: "",
  location: "",
  notes: "",
  nodeId: ""
});

const [referenceId, setReferenceId] = useState(null);

  return (

  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

    <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10">

      <button
        onClick={goBack}
      className="mb-4 px-4 py-2 bg-slate-700 text-white rounded"
    >
      ← Back
    </button>

    <h1 className="text-3xl font-bold text-red-400 mb-6">
        {referenceId && (
  <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
    <p className="text-green-400 font-bold">
      Emergency Submitted Successfully
    </p>

    <p className="text-white mt-2">
      Reference ID:
    </p>

    <div className="flex items-center justify-between mt-2 bg-slate-800 p-3 rounded">
      <span className="text-cyan-400 font-mono">
        {referenceId}
      </span>

      <button
        onClick={() => navigator.clipboard.writeText(referenceId)}
        className="px-3 py-1 bg-cyan-600 rounded text-white"
      >
        Copy
      </button>
    </div>
  </div>
)}
  🚨 Report Emergency
</h1>

      <input
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />

      <br /><br />

      <input
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
        type="text"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) =>
          setFormData({ ...formData, phone: e.target.value })
        }
      />

      <br /><br />

      <select
  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
  value={formData.type}
  onChange={(e) =>
    setFormData({ ...formData, type: e.target.value })
  }
>
        <option value="">Select Emergency Type</option>
        <option value="Medical">Medical Emergency</option>
        <option value="Accident">Road Accident</option>
        <option value="Fire">Fire Incident</option>
        <option value="Flood">Flood</option>
        <option value="Collapse">Building Collapse</option>
        <option value="Other">Other</option>
      </select>

      <br /><br />

      <select
  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
  value={formData.severity}
  onChange={(e) =>
    setFormData({ ...formData, severity: e.target.value })
  }
>
        <option value="">Select Severity</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>

      <br /><br />

    <input
  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
  type="number"
  placeholder="Number of Victims"
  value={formData.victims}
  onChange={(e) =>
    setFormData({ ...formData, victims: e.target.value })
  }
/>

      <br /><br />

     <select
  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
  value={formData.nodeId}
  onChange={(e) =>
    setFormData({
      ...formData,
      nodeId: Number(e.target.value)
    })
  }
>
  <option value="">Select Area</option>
  <option value="0">RV College of Engineering</option>
  <option value="1">Majestic</option>
  <option value="2">Yeshwanthpur</option>
  <option value="3">Hebbal</option>
  <option value="4">Indiranagar</option>
  <option value="5">Electronic City</option>
  <option value="6">Whitefield</option>
  <option value="7">Koramangala</option>
  <option value="8">Jayanagar</option>
  <option value="9">Airport Zone</option>
</select>

      <br /><br />

      <textarea
  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-4"
  placeholder="Additional Notes"
        value={formData.notes}
        onChange={(e) =>
          setFormData({ ...formData, notes: e.target.value })
        }
      />

      <br /><br />

     <button
  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg transition-all duration-300"
  onClick={async () => {
   try {

  const nodeNames = {
    0: "RV College of Engineering",
    1: "Majestic",
    2: "Yeshwanthpur",
    3: "Hebbal",
    4: "Indiranagar",
    5: "Electronic City",
    6: "Whitefield",
    7: "Koramangala",
    8: "Jayanagar",
    9: "Airport Zone"
  };

  console.log("FORM DATA BEFORE SEND:", {
  ...formData,
  location: nodeNames[formData.nodeId]
});

  const response = await fetch(
        "/api/emergencies/report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
  ...formData,
  location: nodeNames[formData.nodeId]
})
        }
      );

      const data = await response.json();

console.log(data);
setReferenceId(data.emergency.id);
    } catch (error) {
      console.error(error);
      alert("Failed to submit emergency");
    }
  }}
>
  Submit Emergency
</button>
    </div>
    </div>
  );
}