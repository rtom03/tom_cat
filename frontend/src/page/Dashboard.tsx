import { useState, type JSX } from "react";
// import AnalysisTab from "../tabs/AnalysisTab";
import ResumeGenerateTab from "../tabs/ResumeGen";
// import BlockedCompaniesTab from "../tabs/BlockedTab";
import { useNavigate } from "react-router-dom";
import ApplicationsTab from "../tabs/ApplicationTab";

type TabKey = "Applications" | "Resume generate";

const TABS: TabKey[] = ["Applications", "Resume generate"];

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("Applications");
  const navigate = useNavigate();

  const Logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // const tabContent = {
  //   Applications: <ApplicationsTab />,
  //   // Analysis: <AnalysisTab />,
  //   // "Blocked companies": <BlockedCompaniesTab />,
  //   "Resume generate": <ResumeGenerateTab />,
  // };
  const tabContent: Record<TabKey, JSX.Element> = {
    Applications: <ApplicationsTab />,
    "Resume generate": <ResumeGenerateTab />,
  };
  return (
    <div
      className="min-h-screen bg-[#1a1a1a] text-gray-200"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="bg-[#111] border-b border-[#2a2a2a] px-6 py-3 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">
            Dashboard
          </h1>
          <div className="text-[13px] text-gray-400 mt-0.5">
            <span className="font-bold text-white"></span>{" "}
            <span className="text-gray-500">(bidder)</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">
            Bidder in 3_HIGH
          </div>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-5 py-2 rounded text-sm transition-colors mt-1"
          onClick={Logout}
        >
          Logout
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-6 pb-6">
        {/* Tabs */}
        <div className="flex items-center border-b border-[#2a2a2a] mt-1">
          {TABS.map((tab) => {
            // const isActive = activeTab === tab;
            // const isAnalysis = tab === "Analysis";
            // const isResume = tab === "Resume generate";

            let cls =
              "px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ";
            // if (isActive && isAnalysis) {
            //   cls += "bg-yellow-400 text-black rounded-sm border-transparent";
            // } else if (isActive) {
            //   cls += "text-blue-400 border-blue-400";
            // } else if (isResume) {
            //   cls += "text-sky-400 hover:text-sky-300 border-transparent";
            // } else {
            //   cls += "text-gray-400 hover:text-gray-200 border-transparent";
            // }

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cls}
              >
                {tab}
              </button>
            );
          })}
          <div className="ml-auto flex flex-col shrink-0">
            <button className="text-gray-600 hover:text-gray-400 border border-[#333] px-1.5 text-[9px] leading-none py-0.5 transition-colors">
              ▲
            </button>
            <button className="text-gray-600 hover:text-gray-400 border border-[#333] border-t-0 px-1.5 text-[9px] leading-none py-0.5 transition-colors">
              ▼
            </button>
          </div>
        </div>

        {/* Tab Panel */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-5 mt-2">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
