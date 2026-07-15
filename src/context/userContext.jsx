import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "../services/auth";

const UserContext = createContext();

export default function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("Mahotsav-user"))
  );

  const hasToken = !!localStorage.getItem("token");

  const { data, isError } = useQuery({
    queryKey: ["me"],
    enabled: hasToken,
    queryFn: async () => {
      const res = await authService.getMe();
      if (!res.ok) throw new Error(res.error || "Failed to load profile");
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  // Keep the local mirror + localStorage in sync with the fetched profile.
  useEffect(() => {
    if (data) {
      setUserInfo(data);
      localStorage.setItem("Mahotsav-user", JSON.stringify(data));
    }
  }, [data]);

  // A failed /me means the session is no longer valid (e.g. an expired or
  // stale token after a DB reseed). Log out immediately and send the user
  // back to login instead of leaving them in a broken half-authed state.
  useEffect(() => {
    if (!isError) return;
    localStorage.removeItem("token");
    localStorage.removeItem("Mahotsav-user");
    localStorage.removeItem("cookieFallback");
    setUserInfo(null);
    toast.error("Session expired, please log in again");
    window.location.assign("/auth/login");
  }, [isError]);

  const value = {
    userInfo,
    setUserInfo,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
