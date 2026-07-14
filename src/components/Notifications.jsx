import React from "react";
import { useNotifications } from "../context/notificationContext";
import NotificationCard from "./NotificationCard";
import { IoArrowBack, IoNotificationsOutline } from "./icons";

function Notifications() {
  const { show, toggleNotificationBar, notifications } = useNotifications();

  return show ? (
    <div className="overflow-y-auto border-r border-neutral-200 bg-white w-72 shrink-0 flex flex-col">
      <h2 className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-neutral-200 flex items-center gap-2 text-sm font-bold text-secondary">
        <button onClick={toggleNotificationBar} className="text-neutral-500 hover:text-secondary">
          <IoArrowBack className="text-base" />
        </button>
        Notifications
      </h2>
      {notifications?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
            <IoNotificationsOutline className="text-lg text-neutral-400" />
          </div>
          <p className="text-xs text-neutral-500">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {notifications?.map((notification) => (
            <NotificationCard key={notification.id} {...notification} />
          ))}
        </div>
      )}
    </div>
  ) : null;
}

export default Notifications;
