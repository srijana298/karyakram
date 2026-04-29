import { useState, useEffect, useCallback } from "react";
import { userService } from "../../services/users";
import { toast } from "react-hot-toast";

function GetUsersLogic() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUsers, setShowUsers] = useState(null);

  const toggleShowUsers = useCallback(() => {
    setShowUsers((prev) => !prev);
  }, []);

  const getUsers = useCallback(async () => {
    setLoading(true);
    const res = await userService.list();
    if (res.ok) {
      setUsers(res.data);
    } else {
      setError(res.error);
      toast.error(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return {
    users,
    showUsers,
    loading,
    error,
    toggleShowUsers,
  };
}

export default GetUsersLogic;
