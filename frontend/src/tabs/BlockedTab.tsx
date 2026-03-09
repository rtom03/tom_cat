import { useState } from "react";

export default function BlockedCompaniesTab() {
  const [companies, setCompanies] = useState([
    { id: 1, name: "Acme Corp", reason: "Spam recruiter", date: "2026-01-10" },
    {
      id: 2,
      name: "TechGiant Inc",
      reason: "Unresponsive after interview",
      date: "2026-02-03",
    },
    {
      id: 3,
      name: "Startup XYZ",
      reason: "Misleading job description",
      date: "2026-02-21",
    },
  ]);
  const [newCompany, setNewCompany] = useState("");
  const [newReason, setNewReason] = useState("");

  const remove = (id) =>
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  const add = () => {
    if (!newCompany.trim()) return;
    setCompanies((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newCompany.trim(),
        reason: newReason.trim() || "Manually blocked",
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewCompany("");
    setNewReason("");
  };

  const inputCls =
    "bg-[#0d0d0d] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-[#555] transition-colors";

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Blocked Companies</h2>

      <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-4 mb-4 space-y-2">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
          Block a company
        </div>
        <input
          className={`${inputCls} w-full`}
          placeholder="Company name..."
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <input
          className={`${inputCls} w-full`}
          placeholder="Reason (optional)..."
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          className="w-full bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-sm font-semibold py-2 rounded transition-colors"
        >
          Block Company
        </button>
      </div>

      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">
        {companies.length} blocked
      </div>
      <div className="space-y-2">
        {companies.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-8">
            No blocked companies.
          </p>
        )}
        {companies.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-3 group hover:border-[#3a2a2a] transition-colors"
          >
            <div>
              <div className="text-sm font-semibold text-white">{c.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.reason}</div>
              <div className="text-xs text-gray-600 mt-0.5">{c.date}</div>
            </div>
            <button
              onClick={() => remove(c.id)}
              className="text-gray-700 hover:text-red-400 transition-colors text-xl leading-none ml-4 group-hover:text-gray-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
