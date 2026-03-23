import { useState } from "react";
import { BASE_URL } from "../services/appServices";

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

// ---------- TABLE ----------
const JobsTable = ({
  jobs,
  loading,
  error,
}: {
  jobs: Job[];
  loading: boolean;
  error: boolean;
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const handleCheckboxChange = (jobId: number, checked: boolean) => {
    if (checked) {
      setSelectedJobId(jobId);
    } else {
      setSelectedJobId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedJobId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/apps/jobs/${selectedJobId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      console.log("Job deleted:", selectedJobId);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedJobId(null);
    }
  };

  if (loading && jobs.length === 0)
    return <p className="text-gray-400 p-4">Loading...</p>;
  if (error) return <p className="text-red-400 p-4">{error}</p>;

  return (
    <>
      <div className="w-full overflow-x-auto">
        {selectedJobId && (
          <button
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors text-base mb-4 flex items-center justify-center gap-2 mt-5"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
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
                // onClick={() => setSelectedJob(job)} // ✅ open modal on row click
              >
                <td
                  className="p-3 border border-[#333]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(job.id, e.target.checked)
                    }
                  />
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
    </>
  );
};

export default JobsTable;
