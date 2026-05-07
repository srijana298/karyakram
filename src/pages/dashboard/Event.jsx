import React, { useEffect, useState } from "react";
import GetEventLogic from "../../Logic/EventsLogic/getEvents";
import { Link, useNavigate } from "react-router-dom";
import {
  IoCalendarOutline,
  IoCheckmarkDoneOutline,
  IoCopy,
  IoGlobeOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoRibbonOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoTicketOutline,
  IoTimeOutline,
  IoLinkOutline,
  IoChevronBackOutline,
} from "react-icons/io5";
import { MdComputer } from "react-icons/md";
import { toast } from "react-hot-toast";
import { eventService } from "../../services/events";
import Loading from "../../components/Loading";
import { resolveImage } from "../../lib/resolveImage";
import CreateMembershipLogic from "../../Logic/Membership/CreateMembership.logic";
import GetUsersLogic from "../../Logic/UserLogic.js/GetUsers.logic";
import UserList from "../../components/UserList";

function Event() {
  const { loading, error, events, id } = GetEventLogic();
  const { users, toggleShowUsers, showUsers, loading: fetchingUsers } = GetUsersLogic();
  const navigate = useNavigate();

  const deleteEvent = async () => {
    const res = await eventService.delete(id);
    if (res.ok) {
      toast.success("Event deleted successfully");
      navigate("/dashboard/events?filter=total");
    } else {
      toast.error(res.error || "Error deleting event");
    }
  };

  const copyEventId = (e) => {
    e?.preventDefault();
    navigator.clipboard.writeText(String(events?.id));
    toast.success("Event ID copied to clipboard");
  };

  const confirmDelete = (e) => {
    e?.preventDefault();
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto overflow-hidden`}
      >
        <div className="p-5">
          <h3 className="text-sm font-semibold text-stone-900">Delete this event?</h3>
          <p className="mt-1 text-xs text-stone-500">
            This action is permanent and cannot be undone.
          </p>
        </div>
        <div className="flex border-t border-stone-100">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-3 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await deleteEvent();
              toast.dismiss(t.id);
            }}
            className="flex-1 py-3 text-xs font-semibold text-red-600 border-l border-stone-100 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const { createMembership, teamMembers, memberCount } = CreateMembershipLogic(events?.id);

  const checkMembership = (userId) => {
    const member = teamMembers?.find((m) => m.user_id === userId);
    if (member) return member.joined ? "Joined" : "Pending";
    return "Invite";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-sm text-red-500 mt-4">{error}</p>;

  return (
    !loading &&
    events && (
      <div className="relative">
        {/* ── Back nav ────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors mb-5"
        >
          <IoChevronBackOutline className="text-sm" />
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left: hero image + details ──────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Cover image */}
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                alt="event"
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                src={resolveImage(events?.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Category & medium badges */}
              <div className="absolute top-4 left-4 inline-flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-3 py-1 rounded-lg text-stone-800">
                  {events?.category}
                </span>
                <span className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-3 py-1 rounded-lg text-stone-800 inline-flex items-center gap-1">
                  {events?.medium === "offline" ? (
                    <>
                      <IoLocationOutline className="text-xs" /> Offline
                    </>
                  ) : (
                    <>
                      <MdComputer className="text-xs" /> Online
                    </>
                  )}
                </span>
                {events?.privacy && (
                  <span className="bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-3 py-1 rounded-lg text-stone-800 inline-flex items-center gap-1 capitalize">
                    {events.privacy === "private" ? (
                      <IoGlobeOutline className="text-xs" />
                    ) : (
                      <IoGlobeOutline className="text-xs" />
                    )}
                    {events.privacy}
                  </span>
                )}
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
                  {events?.title}
                </h1>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                About this event
              </h3>
              <pre className="display-linebreak text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                {events?.description}
              </pre>
            </div>

            {/* Action cards row */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                to={`/dashboard/event/${events?.id}/attendance`}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  <IoCheckmarkDoneOutline className="text-lg" />
                </div>
                <p className="text-sm font-semibold text-stone-800">Attendance</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Mark & manage</p>
              </Link>

              <Link
                to={`/dashboard/event/${events?.id}/certificates`}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <IoRibbonOutline className="text-lg" />
                </div>
                <p className="text-sm font-semibold text-stone-800">Certificates</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Issue & download</p>
              </Link>

              <button
                onClick={toggleShowUsers}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:border-violet-300 hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                  <IoPeopleOutline className="text-lg" />
                </div>
                <p className="text-sm font-semibold text-stone-800">Invite Users</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {memberCount - 1 > 0 ? `${memberCount - 1} member(s)` : "No members yet"}
                </p>
              </button>
            </div>
          </div>

          {/* ── Right: sidebar info ──────────────────────── */}
          <div className="space-y-4">
            {/* Quick info card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Event Details
              </h3>

              {/* Date & time */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IoCalendarOutline className="text-base" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {formatDate(events?.start_date)}
                  </p>
                  {events?.end_date && (
                    <p className="text-xs text-stone-400">
                      to {formatDate(events?.end_date)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IoTimeOutline className="text-base" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {formatTime(events?.start_date)}
                    {events?.end_date && ` — ${formatTime(events?.end_date)}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              {events?.medium === "offline" ? (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <IoLocationOutline className="text-base" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {events?.location_name}
                    </p>
                    <p className="text-xs text-stone-400">In-person event</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <MdComputer className="text-base" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Online Event</p>
                    <p className="text-xs text-stone-400">Join virtually</p>
                  </div>
                </div>
              )}

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <IoPeopleOutline className="text-base" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {events?.max_participants > 0
                      ? `Max ${events.max_participants} participants`
                      : "Unlimited capacity"}
                  </p>
                </div>
              </div>

              {/* Members */}
              <div
                className="flex items-start gap-3 cursor-pointer hover:bg-stone-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                onClick={toggleShowUsers}
              >
                <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <IoPersonOutline className="text-base" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {memberCount - 1 > 0
                      ? `${memberCount - 1} Team Member(s)`
                      : "No team members"}
                  </p>
                  <p className="text-xs text-stone-400">Click to manage</p>
                </div>
              </div>
            </div>

            {/* Map (offline only) */}
            {events?.medium === "offline" && events?.latitude && events?.longitude && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Location
                  </h3>
                </div>
                <iframe
                  title="map"
                  className="w-full h-48 outline-none"
                  src={`https://maps.google.com/maps?q=${events.latitude},${events.longitude}&hl=en&output=embed`}
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            )}

            {/* Actions card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                Actions
              </h3>

              <Link
                to={`/dashboard/create?id=${events?.id}`}
                className="w-full inline-flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors"
              >
                <IoCreateOutline className="text-base" />
                Edit Event
              </Link>

              <button
                onClick={copyEventId}
                className="w-full inline-flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
              >
                <IoCopy className="text-base" />
                Copy Event ID
              </button>

              <button
                onClick={confirmDelete}
                className="w-full inline-flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <IoTrashOutline className="text-base" />
                Delete Event
              </button>
            </div>
          </div>
        </div>

        {/* ── User invite panel ──────────────────────────── */}
        {showUsers && (
          <UserList
            toggleShowUsers={toggleShowUsers}
            users={users}
            fetchingUsers={fetchingUsers}
            createMembership={createMembership}
            id={id}
            events={events}
            checkMembership={checkMembership}
          />
        )}
      </div>
    )
  );
}

export default Event;
