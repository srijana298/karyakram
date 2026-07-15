import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GetEventLogic from "../../Logic/EventsLogic/getEvents";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  IoCalendarOutline,
  IoCopy,
  IoLocationOutline,
  IoPeopleOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoChevronBackOutline,
  IoMailOutline,
  IoArrowRedoOutline,
  IoScanOutline,
  IoImageOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoRibbonOutline,
  IoTicketOutline,
  IoLogoFacebook,
  IoLogoLinkedin,
  IoChatbubbleEllipsesOutline,
  IoMegaphoneOutline,
  IoPersonAddOutline,
  IoQrCodeOutline,
  IoDownloadOutline,
  IoRefreshOutline,
} from "../../components/icons";
import { MdComputer } from "../../components/icons";
import { eventService } from "../../services/events";
import { rsvpService } from "../../services/rsvps";
import { useUser } from "../../context/userContext";
import Loading from "../../components/Loading";
import { resolveImage } from "../../lib/resolveImage";
import InviteGuestsModal from "../../components/InviteGuestsModal";

const TABS = ["Overview", "Guests"];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function fmtDateShort(d) {
  if (!d) return { mon: "", day: "" };
  const dt = new Date(d);
  return {
    mon: dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: dt.getDate(),
  };
}
function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function Event() {
  const { loading, error, events, id } = GetEventLogic();
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("Overview");
  const [inviteOpen, setInviteOpen] = useState(false);

  // ── RSVPs ──────────────────────────────────────────────────
  const [rsvpTab, setRsvpTab] = useState("pending");
  const eventId = events?.id;

  const rsvpsQuery = useQuery({
    queryKey: ["rsvps", "event", Number(eventId)],
    enabled: !!eventId,
    queryFn: async () => {
      const res = await rsvpService.listForEvent(eventId);
      if (!res.ok) throw new Error(res.error || "Failed to load RSVPs");
      return res.data || [];
    },
  });
  const rsvps = rsvpsQuery.data || [];
  const rsvpsLoading = rsvpsQuery.isPending;

  const invitationsQuery = useQuery({
    queryKey: ["event", Number(eventId), "invitations"],
    enabled: !!eventId,
    queryFn: async () => {
      const res = await eventService.listInvitations(eventId);
      if (!res.ok) throw new Error(res.error || "Failed to load invitations");
      return res.data || [];
    },
  });
  const invitations = invitationsQuery.data || [];

  const approveMutation = useMutation({
    mutationFn: async (rid) => {
      const res = await rsvpService.approve(rid);
      if (!res.ok) throw new Error(res.error || "Failed");
      return res.data;
    },
    onSuccess: () => {
      toast.success("RSVP approved");
      queryClient.invalidateQueries({ queryKey: ["rsvps", "event", Number(eventId)] });
    },
    onError: (err) => toast.error(err.message),
  });
  const rejectMutation = useMutation({
    mutationFn: async (rid) => {
      const res = await rsvpService.reject(rid);
      if (!res.ok) throw new Error(res.error || "Failed");
      return res.data;
    },
    onSuccess: () => {
      toast.success("RSVP rejected");
      queryClient.invalidateQueries({ queryKey: ["rsvps", "event", Number(eventId)] });
    },
    onError: (err) => toast.error(err.message),
  });
  const handleApprove = (rid) => approveMutation.mutate(rid);
  const handleReject = (rid) => rejectMutation.mutate(rid);

  const pending = rsvps.filter((r) => r.pending && !r.approved && !r.rejected);
  const approved = rsvps.filter((r) => r.approved);
  const rejected = rsvps.filter((r) => r.rejected);
  const sentInvitations = invitations.filter((invitation) => invitation.status === "sent");

  // Combined "Invites" list for the Overview tab: still-pending email invites
  // plus everyone who has RSVP'd (going / pending / declined).
  const rsvpStatus = (r) =>
    r.approved
      ? { status: "Going", tint: "bg-emerald-500/10 text-emerald-600" }
      : r.rejected
        ? { status: "Declined", tint: "bg-red-500/10 text-red-600" }
        : { status: "Pending", tint: "bg-amber-500/10 text-amber-600" };
  const inviteRows = [
    ...sentInvitations.map((i) => ({
      key: `inv-${i.id}`,
      label: i.email,
      sub: `Invited ${new Date(i.created_at).toLocaleDateString()}`,
      status: "Invited",
      tint: "bg-blue-500/10 text-blue-600",
    })),
    ...rsvps.map((r) => ({
      key: `rsvp-${r.id}`,
      label: r.user_name || r.user_email || `User #${r.user_id}`,
      sub: r.user_email || "",
      ...rsvpStatus(r),
    })),
  ];

  // ── Visibility (local, persisted) ──────────────────────────
  const [privacy, setPrivacy] = useState(null);
  useEffect(() => { setPrivacy(events?.privacy); }, [events?.privacy]);
  const visibilityMutation = useMutation({
    mutationFn: async (next) => {
      const res = await eventService.update(eventId, { privacy: next });
      if (!res.ok) throw new Error(res.error || "Failed to update");
      return next;
    },
    onSuccess: (next) => {
      toast.success(`Event is now ${next}`);
      queryClient.invalidateQueries({ queryKey: ["event", Number(eventId)] });
    },
    onError: (err) => toast.error(err.message),
  });
  const changeVisibility = () => {
    const prev = privacy;
    const next = privacy === "private" ? "public" : "private";
    setPrivacy(next);
    visibilityMutation.mutate(next, { onError: () => setPrivacy(prev) });
  };

  // ── Actions ────────────────────────────────────────────────
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // Public event pages use unguessable random short codes, never numeric IDs.
  const shareUrl = events?.short_code ? `${origin}/${events.short_code}` : "";

  const copyLink = () => {
    if (!shareUrl) return toast.error("Public event link is not available for this event");
    navigator.clipboard.writeText(shareUrl);
    toast.success("Event link copied");
  };
  const copyId = () => {
    navigator.clipboard.writeText(String(events?.id));
    toast.success("Event ID copied");
  };

  const exportGuests = () => {
    const rows = [
      ...sentInvitations.map((i) => ({ name: "", email: i.email, status: "Invited" })),
      ...rsvps.map((r) => ({
        name: r.user_name || `User #${r.user_id}`,
        email: r.user_email || "",
        status: r.approved ? "Going" : r.rejected ? "Declined" : "Pending",
      })),
    ];
    if (rows.length === 0) return toast.error("No guests to export");
    const csv = "Name,Email,Status\n" + rows.map((r) => `"${r.name}","${r.email}","${r.status}"`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests-event-${events.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Guest list exported");
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await eventService.delete(id);
      if (!res.ok) throw new Error(res.error || "Error deleting event");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      navigate("/dashboard/events?filter=total");
    },
    onError: (err) => toast.error(err.message),
  });
  const confirmDelete = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-white dark:bg-white/[0.04] shadow-xl rounded-2xl overflow-hidden`}>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Delete this event?</h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-white/50">This action is permanent and cannot be undone.</p>
        </div>
        <div className="flex border-t border-stone-100 dark:border-white/10">
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 py-3 text-xs font-medium text-stone-500 dark:text-white/50 hover:bg-stone-50 dark:hover:bg-white/5">Cancel</button>
          <button onClick={async () => { await deleteMutation.mutateAsync().catch(() => {}); toast.dismiss(t.id); }} className="flex-1 py-3 text-xs font-semibold text-red-600 border-l border-stone-100 dark:border-white/10 hover:bg-red-50">Delete</button>
        </div>
      </div>
    ));
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-sm text-red-500 mt-4">{error}</p>;
  if (!events) return null;

  const isPrivate = (privacy ?? events.privacy) === "private";
  const badge = fmtDateShort(events.start_date);

  // ── Small building blocks ──────────────────────────────────
  const ActionCard = ({ icon, label, tint, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-3 p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:border-stone-300 dark:border-white/15 hover:shadow-sm transition-all text-left">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${tint}`}>{icon}</span>
      <span className="text-sm font-semibold text-stone-800 dark:text-white">{label}</span>
    </button>
  );

  const GuestList = ({ list, mode }) => (
    <div className="divide-y divide-stone-100 dark:divide-white/10">
      {list.length === 0 ? (
        <div className="p-8 text-center">
          <IoPeopleOutline className="text-2xl text-stone-300 dark:text-white/30 mx-auto" />
          <p className="text-xs text-stone-400 dark:text-white/40 mt-2">No {mode} guests</p>
        </div>
      ) : (
        list.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
              {r.user_name ? r.user_name.slice(0, 2).toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 dark:text-white truncate">{r.user_name || `User #${r.user_id}`}</p>
              <p className="text-[11px] text-stone-400 dark:text-white/40 truncate">{r.user_email || "—"}</p>
            </div>
            {r.pending && !r.approved && !r.rejected ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleApprove(r.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg">Approve</button>
                <button onClick={() => handleReject(r.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Reject</button>
              </div>
            ) : (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${r.approved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                {r.approved ? "Going" : "Declined"}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 dark:text-white/40 hover:text-stone-700 dark:text-white/80 transition-colors mb-4">
        <IoChevronBackOutline className="text-sm" /> Back
      </button>

      {/* ── Tabs + Event Page link ────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 dark:border-white/10">
        <div className="scrollbar-hidden flex items-center gap-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-white/40 hover:text-stone-600 dark:text-white/60"
              }`}
            >
              {t}
              {t === "Guests" && pending.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">{pending.length}</span>
              )}
              {tab === t && <span className="absolute left-0 -bottom-px h-0.5 w-full bg-stone-900 dark:bg-white rounded-full" />}
            </button>
          ))}
        </div>
        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-white/15 text-sm font-medium text-stone-700 dark:text-white/80 hover:bg-stone-50 dark:hover:bg-white/10 transition-colors"
          >
            Event Page <span aria-hidden>↗</span>
          </a>
        )}
      </div>

      <div className="py-6">
        {/* ══════════════════ OVERVIEW ══════════════════ */}
        {tab === "Overview" && (
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="grid sm:grid-cols-3 gap-3">
              <ActionCard icon={<IoMailOutline />} label="Invite Guests" tint="bg-blue-50 text-blue-600" onClick={() => setInviteOpen(true)} />
              <ActionCard icon={<IoRibbonOutline />} label="Certificates" tint="bg-amber-50 text-amber-600" onClick={() => navigate(`/dashboard/event/${events.id}/certificates`)} />
              <ActionCard icon={<IoArrowRedoOutline />} label="Share Event" tint="bg-rose-50 text-rose-600" onClick={copyLink} />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Event preview card */}
              <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-4">
                <div className="flex gap-4">
                  <img src={resolveImage(events.image)} alt={events.title} className="w-28 h-28 rounded-xl object-cover shrink-0 bg-stone-100 dark:bg-white/10" />
                  <div className="min-w-0 flex-1">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${isPrivate ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {isPrivate ? <IoLockClosedOutline /> : <IoGlobeOutline />}
                      {isPrivate ? "Private Event" : "Public Event"}
                    </span>
                    <h1 className="text-xl font-bold text-stone-900 dark:text-white mt-1.5 leading-tight line-clamp-2">{events.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-xs text-stone-500 dark:text-white/50">
                      <IoCalendarOutline /> {fmtDate(events.start_date)}, {fmtTime(events.start_date)}
                    </div>
                    {events.medium === "offline" && events.location_name && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-white/50">
                        <IoLocationOutline /> <span className="truncate">{events.location_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-white/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-white/40 mb-1.5">Hosted By</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                      {(userInfo?.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-stone-700 dark:text-white/80">{userInfo?.name || "You"}</span>
                  </div>
                </div>

                {/* Share link */}
                <div className="mt-4 flex items-center gap-2 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-500 dark:text-white/50 truncate flex-1">{shareUrl}</span>
                  <button onClick={copyLink} className="text-xs font-semibold text-primary hover:underline shrink-0">COPY</button>
                </div>

                {/* Social */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-stone-400 dark:text-white/40">Share Event</span>
                  <div className="flex items-center gap-3 text-stone-400 dark:text-white/40">
                    <a target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} className="hover:text-blue-600"><IoLogoFacebook /></a>
                    <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} className="hover:text-blue-700"><IoLogoLinkedin /></a>
                    <button onClick={copyLink} className="hover:text-stone-700 dark:text-white/80"><IoChatbubbleEllipsesOutline /></button>
                  </div>
                </div>
              </div>

              {/* When & Where */}
              <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-5">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">When &amp; Where</h2>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl border border-stone-200 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-stone-400 dark:text-white/40 leading-none">{badge.mon}</span>
                    <span className="text-base font-bold text-stone-800 dark:text-white leading-tight">{badge.day}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-white">{fmtDate(events.start_date)}</p>
                    <p className="text-xs text-stone-500 dark:text-white/50">
                      {fmtTime(events.start_date)}{events.end_date && ` – ${fmtTime(events.end_date)}`} GMT+5:45
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl border border-stone-200 dark:border-white/10 flex items-center justify-center shrink-0 text-stone-500 dark:text-white/50">
                    {events.medium === "offline" ? <IoLocationOutline className="text-lg" /> : <MdComputer className="text-lg" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 dark:text-white truncate">
                      {events.medium === "offline" ? events.location_name || "Location TBD" : "Online Event"}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-white/50">
                      {events.medium === "offline" ? "The address is shown on the event page." : "Join link shared with guests."}
                    </p>
                  </div>
                </div>

                {events.medium === "offline" && events.latitude && events.longitude && (
                  <iframe title="map" className="w-full h-36 rounded-xl border border-stone-200 dark:border-white/10 mb-4" style={{ border: 0 }} allowFullScreen
                    src={`https://maps.google.com/maps?q=${events.latitude},${events.longitude}&hl=en&output=embed`} />
                )}

                <Link to={`/dashboard/event/${events.id}/attendance`} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-sm font-semibold text-stone-700 dark:text-white/80 transition-colors">
                  <IoScanOutline /> Check In Guests
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link to={`/dashboard/create?id=${events.id}`} className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-sm font-semibold text-stone-700 dark:text-white/80 transition-colors">
                    <IoCreateOutline /> Edit Event
                  </Link>
                  <Link to={`/dashboard/create?id=${events.id}`} className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-sm font-semibold text-stone-700 dark:text-white/80 transition-colors">
                    <IoImageOutline /> Change Photo
                  </Link>
                  <button onClick={copyId} className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-sm font-semibold text-stone-700 dark:text-white/80 transition-colors">
                    <IoCopy /> Copy Event ID
                  </button>
                  <button onClick={confirmDelete} className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-semibold transition-colors">
                    <IoTrashOutline /> Delete Event
                  </button>
                </div>
              </div>
            </div>

            {/* About */}
            {events.description && (
              <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-white/40 mb-3">About this event</h3>
                <p className="text-sm text-stone-600 dark:text-white/60 whitespace-pre-wrap leading-relaxed">{events.description}</p>
              </div>
            )}

            {/* ── Invites ─────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">Invites</h2>
                <button
                  onClick={() => setInviteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-white/15 text-sm font-medium text-stone-700 dark:text-white/80 hover:bg-stone-50 dark:hover:bg-white/10 transition-colors"
                >
                  + Invite Guests
                </button>
              </div>
              <p className="text-sm text-stone-500 dark:text-white/50 mt-1">Invite subscribers, contacts and past guests via email or SMS.</p>
              <div className="mt-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] divide-y divide-stone-100 dark:divide-white/10">
                {inviteRows.length === 0 ? (
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-white/10 flex items-center justify-center text-stone-400 dark:text-white/40 shrink-0"><IoMailOutline className="text-lg" /></div>
                    <div><p className="text-sm font-semibold text-stone-800 dark:text-white">No Invites Sent</p><p className="text-xs text-stone-400 dark:text-white/40">You can invite contacts and past guests to the event.</p></div>
                  </div>
                ) : inviteRows.map((row) => (
                  <div key={row.key} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{(row.label || "?")[0].toUpperCase()}</div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-stone-800 dark:text-white truncate">{row.label}</p>{row.sub && <p className="text-xs text-stone-400 truncate">{row.sub}</p>}</div>
                    <span className={`text-[10px] uppercase font-bold rounded-full px-2 py-1 ${row.tint}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Hosts ───────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">Hosts</h2>
                <button
                  onClick={() => toast("Adding co-hosts is coming soon")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-white/15 text-sm font-medium text-stone-700 dark:text-white/80 hover:bg-stone-50 dark:hover:bg-white/10 transition-colors"
                >
                  + Add Host
                </button>
              </div>
              <div className="mt-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {(userInfo?.name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800 dark:text-white">{userInfo?.name || "You"}</span>
                  <span className="text-xs text-stone-400 dark:text-white/40 truncate">{userInfo?.email}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">Creator</span>
                </div>
              </div>
              <Link to={`/dashboard/event/${events.id}/attendance`} className="mt-3 inline-flex items-center gap-2 text-sm text-stone-500 dark:text-white/50 hover:text-stone-800 dark:hover:text-white transition-colors">
                <IoScanOutline /> Manage check-in staff and options
              </Link>
            </div>

            {/* ── Visibility & Discovery ──────────────────────── */}
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">Visibility &amp; Discovery</h2>
              <p className="text-sm text-stone-500 dark:text-white/50 mt-1">Control how people can find your event.</p>
              <div className="mt-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-white/40">Managing Calendar</p>
                <p className="text-sm font-semibold text-stone-800 dark:text-white mt-0.5">
                  {events.calendar_id ? "Community Calendar" : "Your Personal Calendar"}
                </p>
                <p className="flex items-center gap-1.5 text-sm mt-2">
                  {isPrivate ? <IoLockClosedOutline className="text-amber-500" /> : <IoGlobeOutline className="text-emerald-500" />}
                  <span className={isPrivate ? "text-amber-600 dark:text-amber-300 font-medium" : "text-emerald-600 dark:text-emerald-300 font-medium"}>
                    {isPrivate ? "Private" : "Public"}
                  </span>
                  <span className="text-stone-400 dark:text-white/40">
                    — {isPrivate ? "This event is not listed publicly." : "This event can be discovered by anyone."}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={changeVisibility} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-sm font-medium text-stone-700 dark:text-white/80 transition-colors">
                    Change Visibility
                  </button>
                </div>
              </div>
              <p className="text-xs text-stone-400 dark:text-white/40 mt-3">
                To be eligible for Discover and community calendars, set the event visibility to public.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════ GUESTS ══════════════════ */}
        {tab === "Guests" && (
          <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-5 sm:p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">At a Glance</h2>
              <div className="mt-5 flex items-end justify-between gap-4">
                <p className="text-stone-500 dark:text-white/50"><span className="text-4xl font-semibold text-stone-700 dark:text-white/70">{approved.length}</span> <span className="text-base font-bold">Going</span></p>
                <p className="text-stone-500 dark:text-white/50"><span className="text-sm font-bold">cap</span> <span className="text-4xl font-semibold text-stone-700 dark:text-white/70">{events.max_participants > 0 ? events.max_participants : "∞"}</span></p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: events.max_participants > 0 ? `${Math.min((approved.length / events.max_participants) * 100, 100)}%` : approved.length > 0 ? "100%" : "0%" }} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => setInviteOpen(true)} className="flex items-center gap-3 rounded-2xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-3.5 text-left hover:bg-stone-100 dark:hover:bg-white/[0.07] transition-colors">
                  <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl"><IoMailOutline /></span>
                  <span className="text-base font-bold text-stone-900 dark:text-white">Invite Guests</span>
                </button>
                <button onClick={() => navigate(`/dashboard/events/${events.id}/attendance`)} className="flex items-center gap-3 rounded-2xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-3.5 text-left hover:bg-stone-100 dark:hover:bg-white/[0.07] transition-colors">
                  <span className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl"><IoQrCodeOutline /></span>
                  <span className="text-base font-bold text-stone-900 dark:text-white">Check In Guests</span>
                </button>
                <button onClick={copyLink} className="flex items-center gap-3 rounded-2xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-3.5 text-left hover:bg-stone-100 dark:hover:bg-white/[0.07] transition-colors">
                  <span className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl"><IoPeopleOutline /></span>
                  <span><span className="block text-base font-bold text-stone-900 dark:text-white">Guest List</span><span className="text-xs font-medium text-stone-500 dark:text-white/50">Shown to guests</span></span>
                </button>
              </div>
            </div>

            <div className="border-t border-stone-100 dark:border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">Guest List</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setInviteOpen(true)} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-500 dark:text-white/60 flex items-center justify-center text-lg"><IoPersonAddOutline /></button>
                  <button onClick={() => { rsvpsQuery.refetch(); invitationsQuery.refetch(); }} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-500 dark:text-white/60 flex items-center justify-center text-lg"><IoRefreshOutline /></button>
                  <button onClick={exportGuests} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-500 dark:text-white/60 flex items-center justify-center text-lg"><IoDownloadOutline /></button>
                </div>
              </div>

              {rsvpsLoading ? (
                <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : approved.length + pending.length + rejected.length + sentInvitations.length === 0 ? (
                <div className="py-14 text-center">
                  <IoPeopleOutline className="text-5xl text-stone-300 dark:text-white/30 mx-auto" />
                  <p className="mt-5 text-xl font-bold text-stone-500 dark:text-white/50">No Guests Yet</p>
                  <p className="mt-2 text-sm font-medium text-stone-400 dark:text-white/40">Share the event or invite people to get started!</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-stone-50 dark:bg-white/[0.04] border border-stone-100 dark:border-white/10">
                  {sentInvitations.map((invitation) => (
                    <div key={`invite-${invitation.id}`} className="px-5 py-4 border-b border-stone-100 dark:border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">{invitation.email[0].toUpperCase()}</div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-stone-800 dark:text-white truncate">{invitation.email}</p><p className="text-xs text-stone-400 dark:text-white/40">Invitation sent · awaiting response</p></div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full">INVITED</span>
                    </div>
                  ))}
                  {pending.length + approved.length + rejected.length > 0 && <GuestList list={[...pending, ...approved, ...rejected]} mode="all" />}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {inviteOpen && (
        <InviteGuestsModal
          event={events}
          guestCount={approved.length}
          onClose={() => setInviteOpen(false)}
          onSent={() => invitationsQuery.refetch()}
        />
      )}
    </div>
  );
}

export default Event;
