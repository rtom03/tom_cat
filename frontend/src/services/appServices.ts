export const BASE_URL = "http://localhost:8000/api";

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

export { loginUser, generateApp, getJobs };
