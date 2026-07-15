import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/users";
import { toast } from "react-hot-toast";

function GetUsersLogic() {
  const [showUsers, setShowUsers] = useState(null);

  const toggleShowUsers = useCallback(() => {
    setShowUsers((prev) => !prev);
  }, []);

  const { data, isPending, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await userService.list();
      if (!res.ok) {
        toast.error(res.error);
        throw new Error(res.error || "Failed to load users");
      }
      return res.data;
    },
  });

  return {
    users: data ?? null,
    showUsers,
    loading: isPending,
    error: error?.message ?? null,
    toggleShowUsers,
  };
}

export default GetUsersLogic;
