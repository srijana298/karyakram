import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import GetCalendarLogic from "../../Logic/Explore/getCalendar";
import { useUser } from "../../context/userContext";
import Loading from "../../components/Loading";
import { resolveImage } from "../../lib/resolveImage";
import {
  IoArrowBackOutline, IoCalendarClearOutline, IoGlobeOutline,
  IoLocationOutline, IoPeopleOutline, IoTimeOutline,
} from "../../components/icons";

function initials(name = "") {
  return name.split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() || "").join("");
}

function EventRow({ event }) {
  const date = event.start_date ? dayjs(event.start_date) : null;
  return (
    <Link to={`/${event.short_code || event.id}`} className="group grid sm:grid-cols-[1fr_150px] gap-4 rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-500 dark:text-white/45">{date ? date.format("h:mm A") : "Time TBA"}</p>
        <h3 className="mt-2 text-xl font-semibold text-stone-900 dark:text-white group-hover:opacity-75">{event.title}</h3>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-stone-500 dark:text-white/45">
          <IoLocationOutline /> {event.medium === "online" ? "Online" : event.location_name || "Location TBA"}
        </p>
      </div>
      {event.image && <img src={resolveImage(event.image)} alt="" className="w-full h-28 sm:h-full rounded-xl object-cover" />}
    </Link>
  );
}

export default function Calendar() {
  const { calendar, loading, error, toggleFollow } = GetCalendarLogic();
  const { userInfo } = useUser();
  const navigate = useNavigate();

  if (loading) return <Loading />;
  if (error || !calendar) return (
    <section className="min-h-screen bg-stone-50 dark:bg-[#071517]">
      <div className="container py-24 text-center">
        <IoCalendarClearOutline className="mx-auto text-5xl text-stone-300 dark:text-white/20" />
        <p className="mt-4 text-sm text-stone-500 dark:text-white/50">{error || "Calendar not found"}</p>
      </div>
    </section>
  );

  const events = [...(calendar.events || [])].sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
  const groups = events.reduce((all, event) => {
    const key = event.start_date ? dayjs(event.start_date).format("YYYY-MM-DD") : "tba";
    (all[key] ||= []).push(event); return all;
  }, {});
  const accent = calendar.color || "#78716c";
  const isOwner = Number(calendar.created_by) === Number(userInfo?.id);

  async function handleFollow() {
    if (!userInfo?.id) { toast.error("Please log in to follow calendars"); return navigate("/auth/login"); }
    const res = await toggleFollow();
    if (res && !res.ok) toast.error(res.error || "Something went wrong");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-[#071517] dark:text-white">
      <div className="mx-auto max-w-[1420px] px-4 sm:px-8 pt-7 pb-16">
        <Link to="/dashboard/calendars" className="mb-5 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:text-white/40 dark:hover:text-white"><IoArrowBackOutline /> Calendars</Link>

        <div className="relative h-[250px] sm:h-[360px] overflow-hidden rounded-3xl bg-stone-200 dark:bg-white/10">
          {calendar.cover_image ? <img src={resolveImage(calendar.cover_image)} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full" style={{ background: `radial-gradient(circle at 65% 25%, ${accent}dd, transparent 35%), linear-gradient(135deg, ${accent}55, ${accent})` }} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <section className="relative px-5 sm:px-14">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="-mt-16 relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-[7px] border-stone-50 dark:border-[#071517] overflow-hidden flex items-center justify-center text-3xl font-bold text-white" style={{ background: accent }}>
                {calendar.avatar ? <img src={resolveImage(calendar.avatar)} alt={calendar.name} className="w-full h-full object-cover" /> : initials(calendar.name)}
              </div>
            </div>
            {!isOwner && <button onClick={handleFollow} className={`sm:mt-5 rounded-xl border px-6 py-2.5 text-sm font-semibold transition-colors ${calendar.is_following ? "border-stone-400 text-stone-600 dark:border-white/30 dark:text-white/70" : "border-transparent bg-stone-900 text-white dark:bg-white dark:text-stone-900"}`}>{calendar.is_following ? "Following" : "Follow"}</button>}
          </div>

          <h1 className="mt-7 text-4xl sm:text-5xl font-bold tracking-tight">{calendar.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500 dark:text-white/45">
            <span className="inline-flex items-center gap-2"><IoTimeOutline /> Times in GMT+5:45</span>
            {calendar.city && <span className="inline-flex items-center gap-2"><IoLocationOutline /> {calendar.city}, Nepal</span>}
            <span className="inline-flex items-center gap-2"><IoPeopleOutline /> {Number(calendar.follower_count)} followers</span>
          </div>
          {calendar.description && <p className="mt-5 max-w-3xl text-base leading-relaxed text-stone-600 dark:text-white/65">{calendar.description}</p>}
          <div className="mt-5 flex items-center gap-3 text-stone-400 dark:text-white/35"><IoGlobeOutline /><span className="text-sm">mahotsav.com/calendar/{calendar.slug}</span></div>
        </section>
      </div>

      <section className="border-t border-stone-200 dark:border-white/10">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-10 py-12 grid lg:grid-cols-[1fr_320px] gap-12">
          <div>
            <h2 className="text-3xl font-bold">Events</h2>
            {events.length ? <div className="mt-9 space-y-10">{Object.entries(groups).map(([key, list]) => (
              <div key={key} className="grid sm:grid-cols-[150px_1fr] gap-5">
                <div>
                  <p className="text-lg font-semibold">{key === "tba" ? "Date TBA" : dayjs(key).format("MMM D")}</p>
                  {key !== "tba" && <p className="mt-1 text-sm text-stone-400 dark:text-white/35">{dayjs(key).format("dddd")}</p>}
                </div>
                <div className="space-y-3">{list.map((event) => <EventRow key={event.id} event={event} />)}</div>
              </div>
            ))}</div> : <div className="mt-10 rounded-2xl border border-dashed border-stone-300 py-16 text-center dark:border-white/10"><IoCalendarClearOutline className="mx-auto text-4xl text-stone-300 dark:text-white/20" /><p className="mt-4 text-sm font-medium text-stone-500 dark:text-white/45">No events yet</p></div>}
          </div>
          <aside>
            {isOwner && <Link to={`/dashboard/create?calendar=${calendar.id}`} className="flex w-full items-center justify-center rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white dark:bg-white/10 dark:text-white">+ Create Event</Link>}
            <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
              <div className="p-5"><p className="font-semibold">{calendar.city || "Nepal"}</p><p className="mt-1 text-sm text-stone-400 dark:text-white/35">Calendar region</p></div>
              {calendar.latitude && <iframe title="Calendar region" className="w-full h-48 grayscale-[.4] dark:invert-[.88] dark:hue-rotate-180" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(calendar.longitude)-.08}%2C${Number(calendar.latitude)-.05}%2C${Number(calendar.longitude)+.08}%2C${Number(calendar.latitude)+.05}&layer=mapnik&marker=${calendar.latitude}%2C${calendar.longitude}`} />}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
