import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import { useUser } from "../context/userContext";

function UserRoute({ children }) {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
  const { userInfo } = useUser();

  if (!hasToken) {
    return children;
  }

  if (!userInfo) {
    return <Loading />;
  }

  if (userInfo.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default UserRoute;
