import { useState } from "react";
import { loginUser } from "../services/appServices";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(formData.username, formData.password);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token); // if you're returning a token
      console.log("Login success:", data);
      window.location.href = "/"; // ✅ forces full reload, app picks up localStorage

      // do whatever you want after login e.g. redirect, save user to state
    } catch (err) {
      console.log(err);
      // setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F4EC]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#0F5E2D] text-center">
          tom_cat
        </h1>
        <p className="text-center text-gray-500 mt-1 mb-6">
          Sign in to your dashboard
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-medium">Email</label>
            <input
              type="text"
              name="username"
              placeholder="johndoe"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A7C3A]"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A7C3A]"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0A7C3A] text-white font-semibold rounded-lg hover:bg-[#0F5E2D] transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} tom_cat
        </p>
      </div>
    </div>
  );
};

export default Login;
