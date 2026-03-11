import { useState } from "react";
import { generateApp } from "../services/appServices";
import { Loader } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

export default function ResumeGenerateTab() {
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const notify = () => toast("chillax ur CV has been generated😜!");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDesc(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ✅ fixed typo
    setLoading(true);
    setError(null);
    // console.log("KKKKKKKKKKKKKKKKK");
    try {
      const response = await generateApp(jobDesc);
      setJobDesc("");
      notify();
      console.log(response); // handle response e.g. save to state
    } catch (err) {
      console.log(err);
      console.log(error);
    } finally {
      setLoading(false);
      console.log(loading);
    }
  };
  return (
    <div>
      <ToastContainer />
      <h2 className="text-xl font-bold text-white mb-4">Resume Generate</h2>

      <div className="space-y-3 mb-4">
        <form onSubmit={handleSubmit}>
          <label className="text-xs text-gray-400 mb-1 block">
            Paste Job Desc *
          </label>
          <textarea
            rows={8} // ✅ controls height
            name="jobDesc"
            value={jobDesc}
            className="w-full bg-[#0d0d0d] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-[#555] transition-colors resize-none" // ✅ resize-none locks the size
            placeholder="e.g. Senior Frontend Engineer"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors text-base mb-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" /> : "Generate"}
          </button>
        </form>
      </div>
    </div>
  );
}
