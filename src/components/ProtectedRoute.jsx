import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if ((!token) && pathname.includes("dashboard")) {
      navigate("/");
    } else if (token && (pathname.includes("login") || pathname.includes("signup"))) {
      navigate("/dashboard");
    }
  }, [pathname, navigate]);

  return children;
}

export default ProtectedRoute;
