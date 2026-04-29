import React, { useEffect, useState } from "react";
import { useNotifications } from "../../context/notificationContext";
import NotificationCard from "../../components/NotificationCard";
import { IoCheckmarkDoneOutline, IoNotificationsOutline, IoRefreshOutline } from "react-icons/io5";
import { notificationService } from "../../services/notifications";

function Notifications() {
  const { notifications, fetchNotifications, unreadNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await notificationService.markRead(n.id);
    }
    await fetchNotifications();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-secondary">Notifications</h1>
          {unreadNotifications > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {unreadNotifications} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
            >
              <IoCheckmarkDoneOutline className="text-sm" />
              Mark all read
            </button>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            <IoRefreshOutline className={`text-sm ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6">
        {notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
              <IoNotificationsOutline className="text-2xl text-stone-400" />
            </div>
            <p className="text-sm font-medium text-stone-500">No notifications yet</p>
            <p className="text-xs text-stone-400 mt-1">We'll notify you when something arrives</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications?.map((notification) => (
              <NotificationCard key={notification.id} {...notification} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
