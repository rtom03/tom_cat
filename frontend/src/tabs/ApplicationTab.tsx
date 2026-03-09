import { useState } from "react";
import ApplicationsTable from "../components/AppsTable";

// ── Applications Tab ────────────────────────────────────────────────────────
export default function ApplicationsTab() {
  const [searchCompany, setSearchCompany] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [forValue, setForValue] = useState("Steven Zhang (high5-steven)");
  const [byValue, setByValue] = useState("All Bidders");
  const [remoteValue, setRemoteValue] = useState("All");

  const inputCls =
    "w-full bg-[#0d0d0d] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-[#555] transition-colors";
  const selectCls =
    "flex-1 bg-[#0d0d0d] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#555] transition-colors";

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Applications</h2>

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
          🔍
        </span>
        <input
          className={`${inputCls} pl-8`}
          type="text"
          placeholder="Search by company..."
          value={searchCompany}
          onChange={(e) => setSearchCompany(e.target.value)}
        />
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
          🔍
        </span>
        <input
          className={`${inputCls} pl-8`}
          type="text"
          placeholder="Search by keyword..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-sm text-gray-400 w-10 shrink-0">From</span>
        <input
          className="flex-1 min-w-[140px] bg-[#0d0d0d] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#555] [color-scheme:dark]"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <span className="text-sm text-gray-400 w-5 shrink-0">To</span>
        <input
          className="flex-1 min-w-[140px] bg-[#0d0d0d] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#555] [color-scheme:dark]"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-sm text-gray-400 w-10 shrink-0">For</span>
        <select
          className={selectCls}
          value={forValue}
          onChange={(e) => setForValue(e.target.value)}
        >
          <option>Steven Zhang (high5-steven)</option>
          <option>John Doe (high2-john)</option>
          <option>Jane Smith (high3-jane)</option>
        </select>
        <span className="text-sm text-gray-400 w-5 shrink-0">By</span>
        <select
          className={selectCls}
          value={byValue}
          onChange={(e) => setByValue(e.target.value)}
        >
          <option>All Bidders</option>
          <option>Specific Bidder</option>
        </select>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-gray-400 w-10 shrink-0">Remote</span>
        <select
          className={`${selectCls} w-full`}
          value={remoteValue}
          onChange={(e) => setRemoteValue(e.target.value)}
        >
          <option>All</option>
          <option>Remote Only</option>
          <option>On-site Only</option>
          <option>Hybrid</option>
        </select>
      </div>

      <button className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold py-3 rounded transition-colors text-base tracking-wide">
        Refresh
      </button>
      <ApplicationsTable />
    </div>
  );
}
