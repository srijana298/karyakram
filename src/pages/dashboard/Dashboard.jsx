import React, { useEffect, useMemo, useState } from "react";
import {
  IoAdd,
  IoArrowForward,
  IoCalendarOutline,
  IoLayersOutline,
  IoNotificationsOutline,
  IoPaperPlaneOutline,
  IoPeopleOutline,
  IoRocketOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { eventService } from "../../services/events";
import { analyticsService } from "../../services/analytics";
import { adminService } from "../../services/admin";
import Loading from "../../components/Loading";
import { resolveImage } from "../../lib/resolveImage";
import { useUser } from "../../context/userContext";

function StatCard({ icon, label, value, delta, tone = "green" }) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : tone === "amber"
        ? "bg-amber-50 text-amber-600"
        : tone === "violet"
          ? "bg-violet-50 text-violet-600"
          : "bg-emerald-50 text-emerald-600";

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneClass}`}>{icon}</div>
      <p className="mt-2 text-xs text-dashboard-muted font-medium">{label}</p>
      <p className="text-[30px] leading-tight font-semibold text-dashboard-text mt-0.5">{value}</p>
      <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ {delta}% from last month</p>
    </div>
  );
}

function Dashboard() {
  const { userInfo } = useUser();
  const role = userInfo?.role || "attendee";
  const isAdmin = role === "admin";
  const isOrganizer = role === "organizer";
  const isAttendee = role === "attendee";

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events: admin gets all via admin service, organizer gets mine, attendee gets public
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        let res;
        if (isAdmin) {
          res = await adminService.listEvents();
        } else if (isOrganizer) {
          res = await eventService.list({ mine: "true" });
        } else {
          res = await eventService.list({});
        }
        if (res.ok) setEvents(res.data || []);
        else setError(res.error);
      } catch (err) {
        setError(err.message);
      }
      setEventsLoading(false);
    };
    fetchEvents();
  }, [isAdmin, isOrganizer]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const res = isAdmin
          ? await adminService.stats()
          : await analyticsService.get();
        if (res.ok && res.data) setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics error:", err);
      }
      setLoadingAnalytics(false);
    };
    fetchAnalytics();
  }, [isAdmin]);

  const overview = analytics?.overview || {};
  const stats = [
    {
      label: isAdmin ? "All Events" : "Total Events",
      value: overview.totalEvents ?? 0,
      icon: <IoCalendarOutline className="text-lg" />,
      tone: "green",
      delta: 12,
    },
    {
      label: isAdmin ? "Total Users" : "Upcoming Events",
      value: isAdmin
        ? Number(overview.totalUsers ?? 0).toLocaleString()
        : events?.length ?? 0,
      icon: isAdmin ? <IoPersonOutline className="text-lg" /> : <IoRocketOutline className="text-lg" />,
      tone: "blue",
      delta: 8,
    },
    {
      label: isAdmin ? "Total RSVPs" : "Total Attendees",
      value: isAdmin
        ? Number(overview.totalRsvps ?? 0).toLocaleString()
        : Number(overview.totalMembers ?? 0).toLocaleString(),
      icon: <IoPeopleOutline className="text-lg" />,
      tone: "violet",
      delta: 16,
    },
    {
      label: isAdmin ? "Total Attendees" : "Invites Sent",
      value: isAdmin
        ? Number(overview.totalMembers ?? 0).toLocaleString()
        : Number(overview.totalRsvps ?? 0).toLocaleString(),
      icon: isAdmin ? <IoRocketOutline className="text-lg" /> : <IoPaperPlaneOutline className="text-lg" />,
      tone: "amber",
      delta: 20,
    },
  ];

  const upcomingEvents = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    return list.slice(0, 5);
  }, [events]);

  const rsvp = analytics?.rsvpStats || {};
  const accepted = Number(rsvp.approved || 0);
  const pending = Number(rsvp.pending || 0);
  const declined = Number(rsvp.rejected || 0);
  const total = accepted + pending + declined;

  const acceptedPct = total ? Math.round((accepted / total) * 100) : 0;
  const pendingPct = total ? Math.round((pending / total) * 100) : 0;
  const declinedPct = total ? Math.round((declined / total) * 100) : 0;

  const donutStyle = {
    background: `conic-gradient(#4caf50 0 ${acceptedPct}%, #fb923c ${acceptedPct}% ${acceptedPct + pendingPct}%, #ef4444 ${acceptedPct + pendingPct}% 100%)`,
  };

  const formatEventDate = (event) => {
    const raw = event?.start_date || event?.start || event?.date || event?.created_at;
    if (!raw) return "Date TBA";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "Date TBA";
    return d.toLocaleString([], { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Main Menu <span className="px-2">/</span> Home
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] leading-tight font-semibold text-dashboard-text">Welcome back{userInfo?.name ? `, ${userInfo.name}` : ""}! 👋</h1>
            <p className="text-dashboard-muted mt-1">
              {isAdmin && "Here's what's happening across the platform."}
              {isOrganizer && "Here's what's happening with your events today."}
              {isAttendee && "Discover what's happening on campus."}
            </p>
          </div>
          {isOrganizer && (
            <Link
              to="create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-emerald-600"
            >
              <IoAdd className="text-base" />
              Create Event
            </Link>
          )}
        </div>

        {loadingAnalytics || eventsLoading ? <div className="mt-6"><Loading /></div> : null}
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {!(loadingAnalytics || eventsLoading) && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </div>

            <div className="grid lg:grid-cols-[1.7fr_1fr] gap-4 mt-5">
              <div className="dashboard-panel rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-dashboard-text">
                    {isAdmin ? "Recent Events (All Organizers)" : "Upcoming Events"}
                  </h2>
                  <Link to="events?filter=total" className="text-sm text-primary inline-flex items-center gap-1 font-medium">
                    View all events <IoArrowForward />
                  </Link>
                </div>

                <div>
                  {upcomingEvents.length === 0 && (
                    <p className="text-sm text-dashboard-muted py-8 text-center">No upcoming events yet.</p>
                  )}
                  {upcomingEvents.map((event, i) => (
                    <Link
                      key={event.id}
                      to={`/dashboard/event/${event.id}`}
                      className={`flex items-center gap-3 py-3 px-2 hover:bg-white/70 transition-colors ${i < upcomingEvents.length - 1 ? "border-b border-gray-200" : ""}`}
                    >
                      <img
                        src={resolveImage(event.banner_url || event.image)}
                        alt={event.title}
                        className="w-20 h-14 rounded object-cover shrink-0 bg-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dashboard-text truncate">{event.title || "Untitled Event"}</p>
                        <p className="text-xs text-dashboard-muted mt-1 inline-flex items-center gap-1">
                          <IoCalendarOutline className="text-[13px]" />
                          {formatEventDate(event)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="dashboard-panel p-4">
                  <h3 className="text-xl font-semibold text-dashboard-text">Invitations Overview</h3>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="relative w-28 h-28">
                      <div className="w-28 h-28 rounded-full" style={donutStyle} />
                      <div className="absolute inset-[18px] bg-dashboard-surface rounded-full flex items-center justify-center text-center">
                        <div>
                          <p className="text-2xl font-semibold text-dashboard-text leading-none">{total}</p>
                          <p className="text-[11px] text-dashboard-muted mt-1">Total</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="text-dashboard-text"><span className="text-green-600">●</span> Accepted <span className="text-dashboard-muted ml-2">{accepted} ({acceptedPct}%)</span></p>
                      <p className="text-dashboard-text"><span className="text-orange-500">●</span> Pending <span className="text-dashboard-muted ml-2">{pending} ({pendingPct}%)</span></p>
                      <p className="text-dashboard-text"><span className="text-red-500">●</span> Declined <span className="text-dashboard-muted ml-2">{declined} ({declinedPct}%)</span></p>
                    </div>
                  </div>

                  <Link to="invities" className="mt-4 pt-3 border-t border-dashboard-border text-sm text-primary inline-flex items-center gap-1 font-medium">
                    View all invites <IoArrowForward />
                  </Link>
                </div>

                <div className="dashboard-panel p-4">
                  <h3 className="text-xl font-semibold text-dashboard-text mb-2">Quick Actions</h3>
                  <div className="divide-y divide-dashboard-border">
                    {isOrganizer && (
                      <QuickAction
                        icon={<IoCalendarOutline className="text-emerald-600" />}
                        title="Create New Event"
                        subtitle="Start planning your next event"
                        to="create"
                      />
                    )}
                    {(isOrganizer || isAdmin) && (
                      <QuickAction
                        icon={<IoPaperPlaneOutline className="text-amber-600" />}
                        title="Send Invites"
                        subtitle="Invite people to your events"
                        to="invities"
                      />
                    )}
                    {(isOrganizer || isAdmin) && (
                      <QuickAction
                        icon={<IoLayersOutline className="text-violet-600" />}
                        title="Manage Groups"
                        subtitle="Organize your teams and groups"
                        to="groups"
                      />
                    )}
                    <QuickAction
                      icon={<IoNotificationsOutline className="text-blue-600" />}
                      title="View Notifications"
                      subtitle="Stay updated on new activity"
                      to="notifications"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 py-3 group">
      <div className="w-9 h-9 rounded-lg bg-white border border-dashboard-border flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dashboard-text">{title}</p>
        <p className="text-xs text-dashboard-muted truncate">{subtitle}</p>
      </div>
      <IoArrowForward className="text-dashboard-muted group-hover:text-dashboard-text transition-colors" />
    </Link>
  );
}

export default Dashboard;
