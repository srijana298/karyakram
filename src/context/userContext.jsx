import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { authService } from "../services/auth";

const UserContext = createContext();

export default function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("Mahotsav-user"))
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let active = true;
    authService.getMe().then((res) => {
      if (!active) return;

      // A failed /me means the session is no longer valid (e.g. an expired or
      // stale token after a DB reseed). Log out immediately and send the user
      // back to login instead of leaving them in a broken half-authed state.
      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("Mahotsav-user");
        localStorage.removeItem("cookieFallback");
        setUserInfo(null);
        toast.error("Session expired, please log in again");
        window.location.assign("/auth/login");
        return;
      }

      setUserInfo(res.data);
      localStorage.setItem("Mahotsav-user", JSON.stringify(res.data));
    });

    return () => {
      active = false;
    };
  }, []);

  const value = {
    userInfo,
    setUserInfo,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
