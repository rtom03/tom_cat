import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import {
  // useGenerateApp,
  useGenerateCv,
} from "../api/appMutation";
import { parseJson } from "../utils";
import { saveResume } from "../utils/utils";

export default function ResumeGenerateTab() {
  const [jobDesc, setJobDesc] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    if (!isGenerating) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const formattedTime = `${Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0")}:${(elapsed % 60).toString().padStart(2, "0")}`;
  // const { mutateAsync, isPending } = useGenerateApp();
  const { mutateAsync: generateCvMutate, isPending } = useGenerateCv();

  const notify = () => toast("chillax ur CV has been generated 😜!");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDesc(e.target.value);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     await mutateAsync(jobDesc);
  //     setJobDesc(""); // clear on success
  //     notify();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleGenerateCvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsGenerating(true);

      const response = await generateCvMutate(jobDesc);

      // console.log(response);

      const normalizedResume = {
        ...response.resume,

        personalDetail: parseJson(response.resume.personalDetail, []),
        education: parseJson(response.resume.education, []),
        skills: parseJson(response.resume.skills, []),
        certifications: parseJson(response.resume.certifications, []),
        projects: parseJson(response.resume.projects, []),

        professionalExperiences: response.resume.professionalExperiences.map(
          (exp: any) => ({
            ...exp,
            responsibilities: parseJson(exp.responsibilities, []),
            technologies: parseJson(exp.technologies, []),
          }),
        ),
      };

      await saveResume(
        normalizedResume,
        response.job.company,
        `${response.resume.name}.pdf`,
      );

      notify();
      setJobDesc("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <h2 className="text-xl font-bold text-white mb-4">Resume Generate</h2>

      <div className="space-y-3 mb-4">
        <form onSubmit={handleGenerateCvSubmit}>
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
            {isPending ? <Loader className="animate-spin" /> : "Generate"}
          </button>
          {isGenerating && (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors text-base mb-4 flex items-center justify-center gap-2"
            >
              {formattedTime}
            </button>
          )}
        </form>
      </div>
      {/* <ResumeJsonUpload /> */}
    </div>
  );
}
