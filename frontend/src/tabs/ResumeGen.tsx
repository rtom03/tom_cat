import { useEffect, useState } from "react";
import { generateApp } from "../services/appServices";
import { Loader } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "../components/ResumePdf";
import ResumeJsonUpload from "../components/ResumeJsonUpload";
import { formatCVFileName } from "../utils";

export default function ResumeGenerateTab() {
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const [cvName, setCvName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const notify = () => toast("chillax ur CV has been generated 😜!");

  const handleAutoDownload = async () => {
    const blob = await pdf(<ResumePDF resume={resume} />).toBlob();
    const fileName = formatCVFileName(cvName);
    const buffer = await blob.arrayBuffer();

    const api = window as unknown as {
      electronAPI: {
        saveFile: (b: ArrayBuffer, c: string, f: string) => Promise<void>;
      };
    };

    await api.electronAPI.saveFile(buffer, companyName, fileName);
    console.log(`Saved → Downloads/${companyName}/${fileName}`);
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDesc(e.target.value);
  };

  const safeParse = (data: any) => {
    if (!data) return [];
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Parse error:", data);
        return [];
      }
    }
    return data; // already object/array
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ✅ fixed typo
    setLoading(true);
    setError(null);
    // console.log("KKKKKKKKKKKKKKKKK");
    try {
      const response = await generateApp(jobDesc);
      console.log(response);
      let company = response.job.company;
      let resume = response.resume;
      const formattedResume = {
        ...resume,
        education: safeParse(resume.education),
        personalDetail: safeParse(resume.personalDetail),
        skills: safeParse(resume.skills),
        certifications: safeParse(resume.certifications),
        projects: safeParse(resume.projects),

        professionalExperiences: resume.professionalExperiences.map(
          (exp: any) => ({
            ...exp,
            responsibilities: safeParse(exp.responsibilities),
          }),
        ),
      };
      setResume(formattedResume); // 👈 store AI resume
      setCompanyName(company);
      setJobDesc("");
      notify();
      console.log(company); // handle response e.g. save to state
      setCvName(formattedResume.name);
    } catch (err) {
      console.log(err);
      console.log(error);
    } finally {
      setLoading(false);
      // console.log(loading);
    }
  };

  useEffect(() => {
    if (resume) handleAutoDownload();
    console.log(resume);
  }, [resume]);

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
      <ResumeJsonUpload />
    </div>
  );
}
