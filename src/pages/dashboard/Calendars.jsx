import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { calendarService } from "../../services/calendars";
import { resolveImage } from "../../lib/resolveImage";
import { IoAdd, IoArrowForward, IoCalendarOutline } from "../../components/icons";
import Loading from "../../components/Loading";
import { useUser } from "../../context/userContext";

function CalendarAvatar({ calendar, size = "w-14 h-14", rounded = "rounded-2xl" }) {
  return (
    <div className={`${size} ${rounded} shrink-0 overflow-hidden flex items-center justify-center text-lg font-bold text-white`} style={{ background: calendar.color || "#78716c" }}>
      {calendar.avatar
        ? <img src={resolveImage(calendar.avatar)} alt="" className="h-full w-full object-cover" />
        : calendar.name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MyCalendarCard({ calendar, personal = false }) {
  const className = "block w-full sm:w-[260px] min-h-[132px] rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1b1b1d] dark:hover:bg-[#202023] hover:border-stone-300 transition-colors";
  const content = <>
    <CalendarAvatar calendar={calendar} size="w-11 h-11" rounded="rounded-full" />
    <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-white">{calendar.name}</h3>
    <p className="mt-1 text-sm text-stone-500 dark:text-white/45">{personal ? "No Contacts" : `${Number(calendar.event_count)} events`}</p>
  </>;
  return personal ? <div className={className}>{content}</div> : <Link to={`/calendar/${calendar.id}`} className={className}>{content}</Link>;
}

function FollowingCard({ calendar }) {
  const date = calendar.next_event_date
    ? new Date(calendar.next_event_date).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;
  return (
    <article className="grid md:grid-cols-[220px_1fr] gap-5 rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1b1b1d]">
      <div>
        <CalendarAvatar calendar={calendar} size="w-10 h-10" rounded="rounded-xl" />
        <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-white">{calendar.name}</h3>
        <Link to={`/calendar/${calendar.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/[0.15]">
          View Calendar <IoArrowForward />
        </Link>
      </div>
      <div className="md:border-l md:border-stone-200 md:pl-5 dark:md:border-white/10">
        <p className="text-xs font-medium text-stone-400 dark:text-white/40">Upcoming Events</p>
        {calendar.next_event_title ? (
          <div className="mt-4">
            <p className="text-base font-medium text-stone-900 dark:text-white">{calendar.next_event_title}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-white/45">{date}</p>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-stone-400 dark:text-white/35">
            <IoCalendarOutline className="text-xl" /><span className="text-sm">No upcoming events</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Calendars() {
  const { userInfo } = useUser();
  const [mine, setMine] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([calendarService.list({ mine: true }), calendarService.list({ following: true })]).then(([a, b]) => {
      if (a.ok) setMine(a.data || []);
      if (b.ok) setFollowing(b.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Calendars</h1>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-semibold">My Calendars</h2>
          <Link to="/dashboard/calendars/create" className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/[0.15]"><IoAdd /> Create</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <MyCalendarCard personal calendar={{ name: "Personal Calendar", avatar: userInfo?.avatar, color: "#a8a29e" }} />
          {mine.map((calendar) => <MyCalendarCard key={calendar.id} calendar={calendar} />)}
        </div>
      </section>

      <section className="mt-10 pt-8 border-t border-stone-200 dark:border-white/10">
        <h2 className="text-lg md:text-xl font-semibold">Following</h2>
        <div className="mt-4 space-y-3">
          {following.length ? following.map((calendar) => <FollowingCard key={calendar.id} calendar={calendar} />) : (
            <div className="w-full sm:w-[260px] min-h-[154px] rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1b1b1d]">
              <IoCalendarOutline className="text-3xl text-stone-300 dark:text-white/20" />
              <p className="mt-4 text-base font-semibold text-stone-500 dark:text-white/45">No Calendars Yet</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-400 dark:text-white/35">When you follow a calendar, it’ll show up here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
