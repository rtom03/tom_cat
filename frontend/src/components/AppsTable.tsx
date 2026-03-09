// import { useState, useEffect } from "react";
// import { getJobs } from "../services/appServices";

// interface Job {
//   id: number;
//   company: string;
//   title: string;
//   createdAt: string;
//   remote: boolean;
//   job_desc: string;
//   createdBy: {
//     username: string;
//     name: string;
//   };
// }

// const JobsTable = () => {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchJobs = async () => {
//     setLoading(true);
//     try {
//       const data = await getJobs();
//       setJobs(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//     const interval = setInterval(fetchJobs, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading && jobs.length === 0)
//     return <p className="text-gray-400 p-4">Loading...</p>;
//   if (error) return <p className="text-red-400 p-4">{error}</p>;

//   return (
//     <div className="w-full overflow-x-auto">
//       <p className="text-sm text-gray-400 mb-2">Total: {jobs.length}</p>

//       <table className="w-full text-sm text-gray-300 border-collapse">
//         <thead>
//           <tr className="bg-[#1a1a2e] text-gray-200">
//             <th className="p-3 border border-[#333] text-left w-8">
//               <input type="checkbox" />
//             </th>
//             <th className="p-3 border border-[#333] text-left">Company</th>
//             <th className="p-3 border border-[#333] text-left">Title</th>
//             <th className="p-3 border border-[#333] text-left">Created at</th>
//             <th className="p-3 border border-[#333] text-center">Remote</th>
//             <th className="p-3 border border-[#333] text-left">Created for</th>
//             <th className="p-3 border border-[#333] text-left">Created by</th>
//           </tr>
//         </thead>
//         <tbody>
//           {jobs.map((job) => (
//             <tr
//               key={job.id}
//               className="border-b border-[#333] hover:bg-[#1a1a1a] transition-colors"
//             >
//               <td className="p-3 border border-[#333]">
//                 <input type="checkbox" />
//               </td>
//               <td className="p-3 border border-[#333]">{job.company}</td>
//               <td className="p-3 border border-[#333]">{job.title}</td>
//               <td className="p-3 border border-[#333] text-gray-400 text-xs">
//                 {new Date(job.createdAt).toLocaleString()}
//               </td>
//               <td className="p-3 border border-[#333] text-center">
//                 {job.remote ? (
//                   <span className="text-teal-400">✓</span>
//                 ) : (
//                   <span className="text-gray-500">✗</span>
//                 )}
//               </td>
//               <td className="p-3 border border-[#333]">{job.createdBy.name}</td>
//               <td className="p-3 border border-[#333]">
//                 {job.createdBy.username}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {jobs.length === 0 && (
//         <p className="text-center text-gray-500 py-6">No jobs found.</p>
//       )}
//     </div>
//   );
// };

// export default JobsTable;

import { useState, useEffect } from "react";
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

// ---------- MODAL ----------
const JobModal = ({ job, onClose }: { job: Job; onClose: () => void }) => {
  const [question, setQuestion] = useState("");

  const handleCopy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border border-[#333] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            📄 Application Details
          </h2>
          <div className="flex items-center gap-3 text-gray-400">
            <button
              className="hover:text-white transition-colors"
              title="Share"
            >
              ⬡
            </button>
            <button
              className="hover:text-white transition-colors"
              title="Copy"
              onClick={() => handleCopy(`${job.company} - ${job.title}`)}
            >
              📋
            </button>
            <button
              className="hover:text-white transition-colors"
              title="Download"
            >
              ⬇
            </button>
            <button
              className="hover:text-red-400 transition-colors text-lg"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-300 mb-4">
          <p>
            Company:{" "}
            <span className="font-semibold text-white">{job.company}</span>
            <button
              className="ml-2 text-gray-500 hover:text-white"
              onClick={() => handleCopy(job.company)}
            >
              📋
            </button>
          </p>
          <p className="flex items-center gap-2">
            Title: <span className="font-semibold text-white">{job.title}</span>
            {job.remote && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                Remote
              </span>
            )}
          </p>
          <p>
            Applied For:{" "}
            <span className="font-semibold text-white">
              {job.createdBy.name} ({job.createdBy.username})
            </span>
          </p>
          <p>
            Applied By:{" "}
            <span className="font-semibold text-white">
              {job.createdBy.name} ({job.createdBy.username})
            </span>
          </p>
          <p>
            Applied At:{" "}
            <span className="font-semibold text-white">
              {new Date(job.createdAt).toLocaleString()}
            </span>
          </p>
        </div>

        <hr className="border-[#333] mb-4" />

        {/* Question */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">Question</label>
          <textarea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[#555] resize-none transition-colors"
          />
        </div>

        <hr className="border-[#333] mb-4" />

        {/* Job Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              📄 Job Description
            </h3>
            <button
              className="text-gray-500 hover:text-white transition-colors"
              onClick={() => handleCopy(job.job_desc)}
              title="Copy description"
            >
              📋
            </button>
          </div>
          <div className="bg-[#111] border border-[#333] rounded-lg p-3 text-sm text-gray-400 whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
            {job.job_desc}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- TABLE ----------
const JobsTable = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

  if (loading && jobs.length === 0)
    return <p className="text-gray-400 p-4">Loading...</p>;
  if (error) return <p className="text-red-400 p-4">{error}</p>;

  return (
    <>
      <div className="w-full overflow-x-auto">
        <p className="text-sm text-gray-400 mb-2">Total: {jobs.length}</p>
        <table className="w-full text-sm text-gray-300 border-collapse">
          <thead>
            <tr className="bg-[#1a1a2e] text-gray-200">
              <th className="p-3 border border-[#333] w-8">
                <input type="checkbox" />
              </th>
              <th className="p-3 border border-[#333] text-left">Company</th>
              <th className="p-3 border border-[#333] text-left">Title</th>
              <th className="p-3 border border-[#333] text-left">Created at</th>
              <th className="p-3 border border-[#333] text-center">Remote</th>
              <th className="p-3 border border-[#333] text-left">
                Created for
              </th>
              <th className="p-3 border border-[#333] text-left">Created by</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-[#333] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                onClick={() => setSelectedJob(job)} // ✅ open modal on row click
              >
                <td
                  className="p-3 border border-[#333]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input type="checkbox" />
                </td>
                <td className="p-3 border border-[#333]">{job.company}</td>
                <td className="p-3 border border-[#333]">{job.title}</td>
                <td className="p-3 border border-[#333] text-gray-400 text-xs">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td className="p-3 border border-[#333] text-center">
                  {job.remote ? (
                    <span className="text-teal-400">✓</span>
                  ) : (
                    <span className="text-gray-500">✗</span>
                  )}
                </td>
                <td className="p-3 border border-[#333]">
                  {job.createdBy.name}
                </td>
                <td className="p-3 border border-[#333]">
                  {job.createdBy.username}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <p className="text-center text-gray-500 py-6">No jobs found.</p>
        )}
      </div>

      {/* Modal */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </>
  );
};

export default JobsTable;
