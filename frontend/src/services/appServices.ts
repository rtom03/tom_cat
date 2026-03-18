export const BASE_URL = "/api";

// "http://localhost:8000/api";

//  "/api";
// ("http://localhost:8000/api");

export interface InterviewRequest {
  jobId: number;
  question: string;
}

export interface InterviewResponse {
  success: boolean;
  answer: string;
}

// types
interface PersonalDetail {
  contact: string;
  email: string;
  address: string;
  linkedin: string;
}

interface ProfessionalExperience {
  companyName: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
  technologies: string[];
}

interface ResumeJson {
  title: string;
  summary: string;
  personalDetail: PersonalDetail[];
  education: object[];
  skills: string[];
  certifications: object[];
  projects: object[];
  professionalExperiences: ProfessionalExperience[];
}
export const generateInterviewAnswer = async (
  payload: InterviewRequest,
): Promise<InterviewResponse> => {
  const response = await fetch(`${BASE_URL}/apps/job-ques`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to generate interview response");
  }

  return response.json();
};
const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    credentials: "include", // ✅ sends cookies with request
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error("Failed to create note");
  }

  return await response.json();
};

const registerUser = async (
  name: string,
  username: string,
  password: string,
) => {
  const response = await fetch(`${BASE_URL}/user/create`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });
  if (!response.ok) {
    throw new Error("Failed to create note");
  }

  return await response.json();
};

const generateApp = async (job_desc: string) => {
  console.log(`${BASE_URL}//apps/resume`);
  const response = await fetch(`${BASE_URL}/apps/resume`, {
    method: "POST",
    credentials: "include", // ✅ sends cookies with request
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_desc }),
  });
  if (!response.ok) {
    throw new Error("Failed to create note");
  }
  return await response.json();
};

const getJobs = async () => {
  const response = await fetch(`${BASE_URL}/apps/get-apps`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return await response.json();
};

const deleteJob = async (jobId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/apps/jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // add auth token if needed
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Delete failed:", data.error);
      return;
    }

    console.log("Job deleted:", data.job);
    // Optionally update your frontend state to remove the job from UI
  } catch (err) {
    console.error("Error deleting job:", err);
  }
};

const uploadJsonResume = async (json: ResumeJson) => {
  const response = await fetch(`${BASE_URL}/apps/create-resume`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json), // ← send fields directly, not wrapped in { file }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to upload resume");
  }

  return await response.json();
};

export {
  loginUser,
  generateApp,
  getJobs,
  deleteJob,
  registerUser,
  uploadJsonResume,
};
