import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rsvpService } from "../../services/rsvps";
import { resolveImage } from "../../lib/resolveImage";
import Loading from "../../components/Loading";
import {
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglassOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { MdComputer } from "react-icons/md";

const statusConfig = {
  approved: {
    icon: <IoCheckmarkCircle className="text-base" />,
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    icon: <IoCloseCircle className="text-base" />,
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  pending: {
    icon: <IoHourglassOutline className="text-base" />,
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

function getStatus(rsvp) {
  if (rsvp.approved) return "approved";
  if (rsvp.rejected) return "rejected";
  return "pending";
}

function formatEventDate(dateStr) {
  if (!dateStr) return "Date TBA";
  const d = new Date(dateStr);
  if (isNaN(d)) return "Date TBA";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MyRsvps() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRsvps = async () => {
      const res = await rsvpService.listMine();
      if (res.ok) {
        setRsvps(res.data || []);
      } else {
        setError(res.error);
      }
      setLoading(false);
    };
    fetchRsvps();
  }, []);

  if (loading) return <Loading />;

  const approved = rsvps.filter((r) => r.approved);
  const pending = rsvps.filter((r) => r.pending);
  const rejected = rsvps.filter((r) => r.rejected);

  return (
    <section className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200/70">
        <div className="container pt-8 pb-6">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
            My Events
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            My RSVPs
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Track all your event reservations
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg">
              {rsvps.length} Total
            </span>
            {approved.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                <IoCheckmarkCircle className="text-sm" />
                {approved.length} Approved
              </span>
            )}
            {pending.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">
                <IoHourglassOutline className="text-sm" />
                {pending.length} Pending
              </span>
            )}
            {rejected.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                <IoCloseCircle className="text-sm" />
                {rejected.length} Rejected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {error ? (
          <div className="text-sm text-red-500 p-8 text-center bg-red-50 rounded-xl">
            {error}
          </div>
        ) : !rsvps.length ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <IoCalendarOutline className="text-2xl text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-500">
              No RSVPs yet
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Browse events and RSVP to get started
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rsvps.map((rsvp) => {
              const status = getStatus(rsvp);
              const cfg = statusConfig[status];
              return (
                <Link
                  key={rsvp.rsvp_id}
                  to={`/event/${rsvp.event_id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 hover:border-stone-300 transition-all duration-300">
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={resolveImage(rsvp.event_image)}
                        alt={rsvp.event_title}
                        className="object-cover w-full aspect-[16/10] group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Status badge */}
                      <div
                        className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border backdrop-blur-sm ${cfg.className}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </div>
                      {/* Category badge */}
                      <div className="absolute bottom-2.5 left-2.5 rounded-lg text-xs bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 shadow-sm font-medium">
                        {rsvp.event_category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3.5">
                      <h3 className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {rsvp.event_title}
                      </h3>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                          <IoCalendarOutline className="text-xs" />
                          {formatEventDate(rsvp.event_start_date)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                          {rsvp.event_medium === "offline" ? (
                            <>
                              <IoLocationOutline className="text-xs" />
                              {rsvp.event_location_name
                                ? rsvp.event_location_name.length > 25
                                  ? rsvp.event_location_name.slice(0, 25) + "…"
                                  : rsvp.event_location_name
                                : "In-person"}
                            </>
                          ) : (
                            <>
                              <IoMdComputer className="text-xs" />
                              Online
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyRsvps;
