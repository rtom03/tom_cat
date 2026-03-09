import Dashboard from "./page/Dashboard";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "./page/LoginPage";

const App = () => {
  const token = localStorage.getItem("token");

  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  const AuthLayout = () => (
    <div className="">
      <Outlet />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AuthLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
