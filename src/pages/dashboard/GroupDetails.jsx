import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { groupService } from "../../services/groups";
import Loading from "../../components/Loading";
import DataTable from "../../components/DataTable";
import {
  IoAdd,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoChevronBackOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoLayersOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoTrashOutline,
  IoWarningOutline,
} from "../../components/icons";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("events");

  const { data: group, isPending: groupPending } = useQuery({
    queryKey: ["group", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await groupService.getById(id);
      if (!res.ok) throw new Error(res.error || "Failed to load group");
      return res.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["group", id, "stats"],
    enabled: !!id,
    queryFn: async () => {
      const res = await groupService.stats(id);
      if (!res.ok) throw new Error(res.error || "Failed to load stats");
      return res.data;
    },
  });

  const { data: conflicts } = useQuery({
    queryKey: ["group", id, "conflicts"],
    enabled: !!id,
    queryFn: async () => {
      const res = await groupService.conflicts(id);
      if (!res.ok) throw new Error(res.error || "Failed to load conflicts");
      return res.data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["group", id, "attendance"],
    enabled: !!id,
    queryFn: async () => {
      const res = await groupService.attendanceSummary(id);
      if (!res.ok) throw new Error(res.error || "Failed to load attendance");
      return res.data;
    },
  });

  if (groupPending) return <Loading />;
  if (!group) return <p className="text-sm text-dashboard-muted">Group not found</p>;

  const visibility = (group.privacy || "public").toLowerCase();
  const subEvents = group.subEvents || [];
  const conflictList = conflicts?.conflicts || [];
  const students = summary?.students || [];

  const statCards = [
    { label: "Sub-events", value: stats?.totalSubEvents ?? subEvents.length ?? 0, icon: <IoCalendarOutline className="text-lg" />, tone: "emerald" },
    { label: "Total RSVPs", value: stats?.totalRsvps ?? 0, icon: <IoPeopleOutline className="text-lg" />, tone: "blue" },
    { label: "Checked In", value: stats?.checkedIn ?? 0, icon: <IoCheckmarkCircleOutline className="text-lg" />, tone: "amber" },
    { label: "Attendance", value: `${stats?.attendanceRate ?? 0}%`, icon: <IoTimeOutline className="text-lg" />, tone: "violet" },
  ];

  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };

  // Sub-events table columns
  const eventColumns = [
    {
      key: "title",
      label: "Event",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <IoCalendarOutline className="text-[16px]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dashboard-text truncate">{row.title}</p>
            <p className="text-xs text-dashboard-muted truncate">{row.category || "No category"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      className: "text-sm text-dashboard-muted",
      render: (row) => {
        const d = row.start_date || row.start;
        if (!d) return "—";
        const dt = new Date(d);
        return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" });
      },
    },
    {
      key: "status",
      label: "Status",
      className: "text-center",
      render: (row) => {
        const now = new Date();
        const end = row.end_date ? new Date(row.end_date) : null;
        const start = row.start_date ? new Date(row.start_date) : null;
        let label = "Upcoming";
        let cls = "bg-blue-50 text-blue-700 border-blue-200";
        if (end && end < now) { label = "Completed"; cls = "bg-stone-100 text-stone-600 border-stone-200"; }
        else if (start && start < now) { label = "Live"; cls = "bg-emerald-50 text-emerald-700 border-emerald-200"; }
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>;
      },
    },
    {
      key: "rsvps",
      label: "RSVPs",
      className: "text-center text-sm text-dashboard-text",
      render: (row) => row.rsvp_count ?? 0,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-center w-[90px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Link
            to={`/dashboard/event/${row.id}`}
            className="w-8 h-8 rounded-md border border-gray-200 inline-flex items-center justify-center text-dashboard-muted hover:bg-stone-50"
          >
            <IoEyeOutline />
          </Link>
          <button className="w-8 h-8 rounded-md border border-gray-200 inline-flex items-center justify-center text-dashboard-muted hover:bg-stone-50">
            <IoEllipsisVertical />
          </button>
        </div>
      ),
    },
  ];

  // Attendance table columns
  const attendanceColumns = [
    {
      key: "name",
      label: "Student",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
            {(row.name || "U").slice(0, 2).toUpperCase()}
          </div>
          <p className="text-sm font-semibold text-dashboard-text truncate">{row.name}</p>
        </div>
      ),
    },
    {
      key: "attendance",
      label: "Attendance",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden max-w-[200px]">
            <div className="h-full bg-primary rounded-full" style={{ width: `${row.attendanceRate}%` }} />
          </div>
          <span className="text-xs text-dashboard-muted w-24 text-right">{row.attendedCount}/{row.totalSubEvents} ({row.attendanceRate}%)</span>
        </div>
      ),
    },
  ];

  const tabs = [
    { key: "events", label: "Sub-events" },
    { key: "conflicts", label: "Conflicts", badge: conflictList.length || null },
    { key: "attendance", label: "Attendance" },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Groups <span className="px-2">/</span> <span className="text-dashboard-text">{group.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap px-1">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/dashboard/groups")}
            className="mt-2 w-9 h-9 rounded-md border border-gray-200 inline-flex items-center justify-center text-dashboard-muted hover:bg-stone-50"
          >
            <IoChevronBackOutline className="text-base" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[34px] leading-tight font-semibold text-dashboard-text">{group.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${visibility === "private" ? "bg-stone-100 text-stone-600" : "bg-emerald-50 text-emerald-700"}`}>
                {visibility === "private" ? "Private" : "Public"}
              </span>
            </div>
            <p className="text-dashboard-muted mt-1">{group.description || group.category || "No description"}</p>
          </div>
        </div>
        <Link
          to={`/dashboard/create?groupId=${group.id}`}
          className="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-primary rounded-md hover:bg-emerald-600 transition-colors"
        >
          <IoAdd className="text-base" />
          Add Sub-event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-md p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneMap[s.tone]}`}>
              {s.icon}
            </div>
            <p className="text-[28px] leading-tight font-semibold text-dashboard-text mt-2">{s.value}</p>
            <p className="text-xs text-dashboard-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-dashboard-text"
                : "border-transparent text-dashboard-muted hover:text-dashboard-text"
            }`}
          >
            {t.label}
            {t.badge && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-1">
        {tab === "events" && (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <DataTable
              columns={eventColumns}
              data={subEvents}
              pageSize={10}
              emptyMessage="No sub-events yet. Click 'Add Sub-event' to create one."
            />
          </div>
        )}

        {tab === "conflicts" && (
          <div className="space-y-3">
            {conflictList.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-md py-12 text-center">
                <IoCheckmarkCircleOutline className="text-3xl text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-dashboard-muted">No scheduling conflicts detected.</p>
              </div>
            ) : (
              conflictList.map((c, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-md border p-4 ${
                    c.severity === "critical" ? "border-red-300 bg-red-50/30" : "border-amber-300 bg-amber-50/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      c.severity === "critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      <IoWarningOutline />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dashboard-text">
                        {c.eventA.title} <span className="text-dashboard-muted font-normal">↔</span> {c.eventB.title}
                      </p>
                      <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs text-dashboard-muted">
                        <p>
                          <span className="font-medium text-dashboard-text">{c.eventA.title}</span><br />
                          {formatDateTime(c.eventA.start)} → {formatTime(c.eventA.end)}
                        </p>
                        <p>
                          <span className="font-medium text-dashboard-text">{c.eventB.title}</span><br />
                          {formatDateTime(c.eventB.start)} → {formatTime(c.eventB.end)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-dashboard-muted">Shared users: <b className="text-dashboard-text">{c.sharedUsersCount}</b></span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {c.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "attendance" && (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <DataTable
              columns={attendanceColumns}
              data={students}
              pageSize={10}
              emptyMessage="No attendance data yet."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
