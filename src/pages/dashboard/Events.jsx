import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import GetEventLogic from "../../Logic/EventsLogic/getEvents";
import Loading from "../../components/Loading";
import { resolveImage } from "../../lib/resolveImage";
import {
  IoArrowForward,
  IoLocationOutline,
  IoPeopleOutline,
  IoSparkles,
  IoCalendarClearOutline,
} from "../../components/icons";
import { MdComputer } from "../../components/icons";

function relativeDay(d) {
  const diff = dayjs(d).startOf("day").diff(dayjs().startOf("day"), "day");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return dayjs(d).format("MMM D");
}

function EventRow({ event }) {
  const start = event.start_date ? dayjs(event.start_date) : null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] p-4 sm:p-5 flex gap-4 transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-500 dark:text-white/50">{start ? start.format("h:mm A") : "Time TBD"}</p>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-white mt-0.5">
          <span className="w-5 h-5 rounded-md bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center text-[10px] text-white shrink-0">
            <IoSparkles />
          </span>
          <span className="truncate">{event.title}</span>
        </h3>

        <div className="mt-2 space-y-1.5 text-sm text-stone-500 dark:text-white/50">
          <p className="flex items-center gap-2">
            {event.medium === "online" ? <MdComputer /> : <IoLocationOutline />}
            <span className="truncate">{event.medium === "online" ? "Online" : event.location_name || "Location TBD"}</span>
          </p>
          <p className="flex items-center gap-2">
            <IoPeopleOutline />
            {Number(event.max_participants) > 0 ? `Up to ${event.max_participants} guests` : "Open to all"}
          </p>
        </div>

        <Link
          to={`/dashboard/event/${event.id}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-3.5 py-2 text-sm font-medium transition-colors"
        >
          Manage Event <IoArrowForward className="text-xs" />
        </Link>
      </div>

      <Link to={`/dashboard/event/${event.id}`} className="shrink-0">
        {event.image ? (
          <img src={resolveImage(event.image)} alt={event.title} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-stone-100 dark:bg-white/5" />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-orange-400" />
        )}
      </Link>
    </div>
  );
}

function Events() {
  const { loading, error, events } = GetEventLogic();
  const [tab, setTab] = useState("upcoming");

  const groups = useMemo(() => {
    const list = (events || []).filter((e) => e.start_date);
    const startToday = dayjs().startOf("day");
    const upcoming = tab === "upcoming";
    const filtered = list
      .filter((e) => (upcoming ? !dayjs(e.start_date).isBefore(startToday) : dayjs(e.start_date).isBefore(startToday)))
      .sort((a, b) => (upcoming ? 1 : -1) * (dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf()));
    const map = new Map();
    for (const e of filtered) {
      const key = dayjs(e.start_date).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return [...map.entries()];
  }, [events, tab]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-white">Events</h1>
        <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 dark:bg-white/5 dark:border-white/10">
          {["upcoming", "past"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-white text-stone-900 shadow-sm dark:bg-white/[0.12] dark:text-white dark:shadow-none"
                  : "text-stone-500 hover:text-stone-800 dark:text-white/50 dark:hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      ) : groups.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <IoCalendarClearOutline className="text-2xl text-stone-300 dark:text-white/30" />
          </div>
          <p className="text-sm font-medium text-stone-600 dark:text-white/70">No {tab} events</p>
          <p className="text-xs text-stone-400 dark:text-white/40 mt-1">
            {tab === "upcoming" ? "Create your first event to get started." : "Past events will show up here."}
          </p>
          {tab === "upcoming" && (
            <Link to="/dashboard/create" className="inline-block mt-5 rounded-lg bg-primary text-white dark:bg-white dark:text-stone-900 px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([key, list]) => (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 sm:gap-6">
              <div className="sm:pt-1">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-base font-bold text-stone-900 dark:text-white">{relativeDay(key)}</p>
                    <p className="text-sm text-stone-400 dark:text-white/40">{dayjs(key).format("dddd")}</p>
                  </div>
                  <span className="hidden sm:block mt-1.5 w-2 h-2 rounded-full bg-stone-300 dark:bg-white/30 shrink-0" />
                </div>
              </div>

              <div className="space-y-3 sm:border-l sm:border-dashed sm:border-stone-200 dark:sm:border-white/15 sm:pl-6">
                {list.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
