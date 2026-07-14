import React from "react";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function NotificationCard({ fromUserId, fromUserName, link, message, created_at, read }) {
  const time = dayjs(created_at).fromNow(true);

  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
        read
          ? "bg-white border-stone-100 dark:bg-white/[0.03] dark:border-white/10"
          : "bg-primary/5 border-primary/10 dark:bg-primary/10 dark:border-primary/20"
      }`}
    >
      <Avatar name={fromUserName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-secondary dark:text-white">{fromUserName}</p>
          {!read && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-stone-500 dark:text-white/50 mt-0.5 line-clamp-2 leading-relaxed">{message}</p>
        {link && (
          <Link
            to={link}
            target="_blank"
            className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
          >
            See event →
          </Link>
        )}
      </div>
      <p className="text-[10px] text-stone-400 dark:text-white/40 shrink-0 mt-0.5">{time}</p>
    </div>
  );
}

export default NotificationCard;
