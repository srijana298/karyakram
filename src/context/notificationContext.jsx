import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { notificationService } from "../services/notifications";

const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const toggleNotificationBar = (e) => {
    e?.preventDefault();
    setShow((prev) => !prev);
    setUnreadNotifications(0);
  };

  const closeNotificationBar = useCallback(() => {
    setShow(false);
  }, []);

  const sendNotification = useCallback(async (data) => {
    const res = await notificationService.create(data);
    if (!res.ok) console.error("Failed to send notification:", res.error);
  }, []);

  const fetchNotifications = useCallback(async () => {
    const res = await notificationService.list();
    if (res.ok) {
      setNotifications(res.data);
      setUnreadNotifications(res.data.filter((n) => !n.read).length);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    show,
    toggleNotificationBar,
    closeNotificationBar,
    sendNotification,
    notifications,
    unreadNotifications,
    fetchNotifications,
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
