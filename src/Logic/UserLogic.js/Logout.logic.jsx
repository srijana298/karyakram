import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function LogoutLogic() {
  const navigate = useNavigate();

  const logout = async (e) => {
    e?.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("Karyakram-user");
    localStorage.removeItem("cookieFallback");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return { logout };
}

export default LogoutLogic;
