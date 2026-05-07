import React from "react";
import GetEventLogic from "../../Logic/EventsLogic/getEvents";
import Loading from "../../components/Loading";
import { MdComputer } from "react-icons/md";
import { resolveImage } from "../../lib/resolveImage";
import {
  IoBookmarkOutline,
  IoCalendarClearOutline,
  IoGlobeOutline,
  IoLanguageOutline,
  IoLinkOutline,
  IoLocationOutline,
  IoShareSocialOutline,
  IoTimerOutline,
} from "react-icons/io5";
import { shareLinks } from "../../static/shareLinks";
import { useLocation } from "react-router-dom";
import RsvpLogic from "../../Logic/Explore/rsvp.logic";

function formatTime(date) {
  return date?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) || "";
}

function EventPage() {
  const { loading, error, events } = GetEventLogic();
  const { handleRSVP, adding } = RsvpLogic(events);
  const { pathname } = useLocation();

  if (loading || !events) return <Loading />;
  if (error) return <div className="container py-16 text-center text-stone-500">{error}</div>;

  const {
    title,
    description,
    medium,
    category,
    start_date,
    end_date,
    location_name,
    latitude,
    longitude,
    image,
    meet_link,
    meet_id,
    meet_password,
    tnc,
    language,
    duration,
    accepting_rsvp,
  } = events;

  const start = start_date ? new Date(typeof start_date === 'string' ? start_date.split("+")[0] : start_date) : null;
  const end = end_date ? new Date(typeof end_date === 'string' ? end_date.split("+")[0] : end_date) : null;
  const isFree = true;

  const DetailsCard = () => (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Date header */}
      <div className="p-5 pb-4 border-b border-stone-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
            <p className="text-xs font-bold text-primary leading-none">{start?.toLocaleString("en", { weekday: "short" })}</p>
            <p className="text-lg font-extrabold text-primary leading-none mt-0.5">{start?.getDate()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-secondary">
              {start?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {formatTime(start)}
              {end && start?.toDateString() !== end?.toDateString() && ` — ${formatTime(end)}`}
              {end && start?.toDateString() === end?.toDateString() && ` – ${formatTime(end)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Category */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
            <IoBookmarkOutline className="text-xs text-stone-500" />
          </div>
          <span className="text-sm text-stone-600">{category}</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
            {medium === "offline" ? (
              <IoLocationOutline className="text-xs text-stone-500" />
            ) : (
              <IoGlobeOutline className="text-xs text-stone-500" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm text-stone-600">
              {medium === "offline" ? (location_name || "Location TBA") : "Online Event"}
            </span>
          </div>
        </div>

        {/* Duration */}
        {duration?.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
              <IoTimerOutline className="text-xs text-stone-500" />
            </div>
            <span className="text-sm text-stone-600">{duration.split(":").join("h ")}m</span>
          </div>
        )}

        {/* Language */}
        {language?.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
              <IoLanguageOutline className="text-xs text-stone-500" />
            </div>
            <span className="text-sm text-stone-600">{language}</span>
          </div>
        )}

        {/* Map */}
        {medium === "offline" && latitude && longitude && (
          <div className="rounded-xl overflow-hidden border border-stone-200 mt-2">
            <iframe
              title="map"
              className="w-full h-40"
              src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&output=embed`}
              loading="lazy"
            />
          </div>
        )}

        {/* Online link */}
        {medium === "online" && meet_link && (
          <a
            href={meet_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-1"
          >
            <IoLinkOutline /> Join Meeting Link
          </a>
        )}
        {meet_id && (
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
              <IoLinkOutline className="text-xs text-stone-500" />
            </div>
            <div>
              <p className="text-xs text-stone-400">Meeting ID</p>
              <p className="text-sm text-stone-600">{meet_id}{meet_password ? ` (Pass: ${meet_password})` : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Price & CTA */}
      <div className="p-5 pt-4 border-t border-stone-100">
        <button
          disabled={adding || accepting_rsvp === false}
          onClick={handleRSVP}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
        >
          {adding ? "Processing..." : accepting_rsvp === false ? "RSVP Closed" : "RSVP — It's Free"}
        </button>
      </div>
    </div>
  );

  return (
    <section className="pb-16 w-full">
      {/* Cover image with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            alt="cover blur"
            src={resolveImage(image)}
            className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white" />
        </div>
        <div className="relative container pt-6">
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-stone-200/50">
            <img
              alt={title}
              src={resolveImage(image)}
              className="w-full aspect-[21/9] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 md:items-start">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & meta */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                {category}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-secondary leading-tight">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <IoCalendarClearOutline className="text-sm" />
                  {start?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {start?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) !== end?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) && end && (
                    <> — {end?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {formatTime(start)}
                  {end && ` – ${formatTime(end)}`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {medium === "offline" ? (
                    <><IoLocationOutline className="text-sm" />{location_name || "Location TBA"}</>
                  ) : (
                    <><MdComputer className="text-sm" />Online</>
                  )}
                </span>
              </div>
            </div>

            {/* Mobile details card */}
            <div className="lg:hidden">
              <DetailsCard />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                About this event
              </h2>
              <div className="display-linebreak text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>

            {/* Terms */}
            {tnc && (
              <div>
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                  Terms & Conditions
                </h2>
                <ul className="space-y-2">
                  {tnc?.split("\n")?.filter(Boolean).map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Share */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center gap-3">
                <IoShareSocialOutline className="text-stone-400" />
                <p className="text-xs text-stone-400">Share this event</p>
                <div className="flex gap-2 ml-auto">
                  {shareLinks?.map((link, index) => (
                    <a
                      key={index}
                      href={link?.share?.(
                        `${window.location.origin}${pathname}`,
                        title
                      )}
                      target="_blank"
                      title={`Share on ${link?.title}`}
                      className={`w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-sm text-stone-500 hover:text-stone-700 transition-colors`}
                      rel="noreferrer"
                    >
                      {link?.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DetailsCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventPage;
