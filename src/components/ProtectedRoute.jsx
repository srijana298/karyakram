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
    // authenticated users.

    if (pathname.includes("login") || pathname.includes("signup")) {
      navigate("/dashboard");
    }
  }, [pathname, navigate]);

  return children;
}

export default ProtectedRoute;
