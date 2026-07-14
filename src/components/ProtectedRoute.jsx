import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/auth/login");
      return;
    }

    // Any registered user can organize events, so the dashboard is open to all
    // authenticated users. Admin-only areas (e.g. Users) guard themselves.
    if (pathname.includes("/dashboard/users")) {
      let user = null;
      try { user = JSON.parse(localStorage.getItem("Mahotsav-user")); } catch {}
      if (user?.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    }

    if (pathname.includes("login") || pathname.includes("signup")) {
      navigate("/dashboard");
    }
  }, [pathname, navigate]);

  return children;
}

export default ProtectedRoute;
