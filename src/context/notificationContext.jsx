import { createContext, useCallback, useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notifications";

const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  // Opening the bar marks the current batch as seen, zeroing the unread badge.
  const [seen, setSeen] = useState(false);

  const hasToken = !!localStorage.getItem("token");

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    enabled: hasToken,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await notificationService.list();
      if (!res.ok) throw new Error(res.error || "Failed to load notifications");
      return res.data;
    },
  });

  const unreadNotifications = seen ? 0 : notifications.filter((n) => !n.read).length;

  const toggleNotificationBar = (e) => {
    e?.preventDefault();
    setShow((prev) => !prev);
    setSeen(true);
  };

  const closeNotificationBar = useCallback(() => {
    setShow(false);
  }, []);

  const notificationMutation = useMutation({
    mutationFn: async (data) => {
      const res = await notificationService.create(data);
      if (!res.ok) throw new Error(res.error || "Failed to send notification");
      return res.data;
    },
    onError: (err) => console.error("Failed to send notification:", err.message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Fire-and-forget: callers await this but it must never throw (mirrors the
  // previous behaviour of only logging failures).
  const sendNotification = useCallback(
    (data) => notificationMutation.mutateAsync(data).catch(() => {}),
    [notificationMutation]
  );

  const value = {
    show,
    toggleNotificationBar,
    closeNotificationBar,
    sendNotification,
    notifications,
    unreadNotifications,
    fetchNotifications: refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
