import { useEffect, useState } from "react";
import AppsTable from "../components/AppsTable";
import { getJobs } from "../services/appServices";

interface Job {
  id: number;
  company: string;
  title: string;
  createdAt: string;
  remote: boolean;
  job_desc: string;
  createdBy: {
    username: string;
    name: string;
  };
}

export default function ApplicationsTab() {
  const [searchCompany, setSearchCompany] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [forValue, setForValue] = useState("Steven Zhang (high5-steven)");
  const [byValue, setByValue] = useState("All Bidders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Search/filter function — always returns an array ──────────────────────
  // const getFilteredJobs = (): Job[] => {
  //   return jobs.filter((job) => {
  //     const matchesCompany = searchCompany
  //       ? job.company.toLowerCase().includes(searchCompany.toLowerCase())
  //       : true;

  //     const matchesKeyword = searchKeyword
  //       ? job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
  //         job.job_desc.toLowerCase().includes(searchKeyword.toLowerCase())
  //       : true;

  //     const matchesFromDate = fromDate
  //       ? new Date(job.createdAt) >= new Date(fromDate)
  //       : true;

  //     const matchesToDate = toDate
  //       ? new Date(job.createdAt) <= new Date(toDate)
  //       : true;

  //     return (
  //       matchesCompany && matchesKeyword && matchesFromDate && matchesToDate
  //     );
  //   });
  // };
  // ── Search/filter function ────────────────────────────────────────────────
  const getFilteredJobs = (): Job[] => {
    return jobs.filter((job) => {
      const matchesCompany = searchCompany
        ? job.company.toLowerCase().includes(searchCompany.toLowerCase())
        : true;

      const matchesKeyword = searchKeyword
        ? job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          job.job_desc.toLowerCase().includes(searchKeyword.toLowerCase())
        : true;

      const jobDate = new Date(job.createdAt);

      const matchesFromDate = fromDate
        ? jobDate >= new Date(fromDate) // start of day ✅
        : true;

      const matchesToDate = toDate
        ? jobDate <= new Date(new Date(toDate).setHours(23, 59, 59, 999)) // end of day ✅
        : true;

      return (
        matchesCompany && matchesKeyword && matchesFromDate && matchesToDate
      );
    });
  };

  const filteredJobs = getFilteredJobs(); // ✅ always an array

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
      {/* Date range row */}
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
          min={fromDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        {/* Clear button only shown when a date is set */}
        {(fromDate || toDate) && (
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="text-xs text-gray-400 hover:text-red-400 border border-[#333] hover:border-red-400 rounded px-2 py-2 transition-colors shrink-0"
            title="Clear date filter"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* <div className="flex items-center gap-3 mb-3 flex-wrap">
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
      </div> */}

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

      <button
        onClick={fetchJobs}
        className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold py-3 rounded transition-colors text-base tracking-wide"
      >
        Refresh
      </button>

      {/* ✅ Always receives a Job[] array */}
      <AppsTable jobs={filteredJobs} loading={loading} error={error} />
    </div>
  );
}
