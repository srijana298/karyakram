import { Navigate, useLocation } from "react-router-dom";
import Loading from "./Loading";
import { useUser } from "../context/userContext";

function AdminRoute({ children }) {
  const location = useLocation();
  const { userInfo } = useUser();
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  if (!hasToken) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (!userInfo) {
    return <Loading />;
  }

  if (userInfo.role !== "admin") {
    return <Navigate to="/events?filter=total" replace />;
  }

  return children;
}

export default AdminRoute;
