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

    if (pathname.includes("dashboard")) {
      let user = null;
      try { user = JSON.parse(localStorage.getItem("Mahotsav-user")); } catch {}
      const role = user?.role;
      if (role !== "admin" && role !== "organizer") {
        navigate("/explore");
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
