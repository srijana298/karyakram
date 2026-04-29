import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { attendanceService } from "../../services/attendance";
import { rsvpService } from "../../services/rsvps";
import { eventService } from "../../services/events";
import { userService } from "../../services/users";
import { toast } from "react-hot-toast";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoCopy,
  IoEllipsisHorizontal,
  IoPeopleOutline,
  IoQrCodeOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoCheckmarkDoneOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoCalendarOutline,
  IoDownloadOutline,
  IoShieldCheckmarkOutline,
  IoLinkOutline,
} from "react-icons/io5";
import Loading from "../../components/Loading";

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${bg} ${color} mb-3`}
      >
        {icon}
      </div>
      <h2 className="text-2xl font-extrabold text-secondary">{value}</h2>
      <p className="text-[11px] text-stone-400 mt-1">{label}</p>
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────── */
function InitialsAvatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

/* ── Attendee Row ────────────────────────────────────────────── */
function AttendeeRow({ rsvp, checked, onToggle, getUserName, getUserEmail }) {
  const name = getUserName(rsvp);
  const email = getUserEmail(rsvp);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50/60 transition-colors group">
      <InitialsAvatar name={name} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
        {email && (
          <p className="text-[11px] text-stone-400 truncate">{email}</p>
        )}
      </div>

      {checked ? (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
          <IoCheckmarkCircle className="text-sm" />
          Checked In
        </span>
      ) : (
        <button
          onClick={() => onToggle(rsvp.user_id, true)}
          className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          Check In
        </button>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function EventAttendance() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [approvedRsvps, setApprovedRsvps] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | checked | pending

  /* ── Helper: resolve display name from RSVP + userMap ── */
  const getUserName = useCallback(
    (rsvp) => {
      if (rsvp.name) return rsvp.name;
      const uid = String(rsvp.user_id ?? "");
      const user = userMap[uid];
      if (user) {
        return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || user.email || uid;
      }
      return uid;
    },
    [userMap]
  );

  const getUserEmail = useCallback(
    (rsvp) => {
      if (rsvp.email) return rsvp.email;
      const uid = String(rsvp.user_id ?? "");
      const user = userMap[uid];
      return user?.email || "";
    },
    [userMap]
  );

  /* ── Data loading ──────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    const [ev, r, a, u] = await Promise.all([
      eventService.getById(id),
      rsvpService.listForEvent(id),
      attendanceService.list(id),
      userService.list(),
    ]);
    if (ev.ok) setEvent(ev.data);
    if (r.ok) setApprovedRsvps((r.data || []).filter((x) => x.approved));
    if (a.ok) setAttendance(a.data || []);
    if (u.ok) {
      const map = {};
      (u.data || []).forEach((user) => {
        map[String(user.id)] = user;
      });
      setUserMap(map);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const checkedSet = useMemo(
    () => new Set(attendance.map((a) => a.user_id)),
    [attendance]
  );

  /* ── Stats ─────────────────────────────────────────── */
  const totalApproved = approvedRsvps.length;
  const totalChecked = approvedRsvps.filter((r) =>
    checkedSet.has(r.user_id)
  ).length;
  const totalPending = totalApproved - totalChecked;

  /* ── Toggle check-in ───────────────────────────────── */
  const toggle = async (userId, checked) => {
    try {
      await attendanceService.mark(id, { userId, checkedIn: checked });
      toast.success(checked ? "Checked in successfully" : "Check-in reverted");
      load();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  /* ── Bulk check-in ─────────────────────────────────── */
  const bulkCheckIn = async () => {
    const pendingIds = approvedRsvps
      .filter((r) => !checkedSet.has(r.user_id))
      .map((r) => r.user_id);
    if (pendingIds.length === 0) {
      toast("Everyone is already checked in", { icon: "✅" });
      return;
    }
    try {
      await attendanceService.bulk(id, {
        userIds: pendingIds,
        checkedIn: true,
      });
      toast.success(`${pendingIds.length} attendees checked in`);
      load();
    } catch {
      toast.error("Bulk check-in failed");
    }
  };

  /* ── Generate check-in code ────────────────────────── */
  const generateCode = async () => {
    const res = await attendanceService.generateCode(id);
    if (res.ok) {
      setCode(res.data.code);
      toast.success("Check-in code generated");
    } else {
      toast.error(res.error || "Failed to generate code");
    }
  };

  /* ── Filtered list ─────────────────────────────────── */
  const filteredRsvps = useMemo(() => {
    let list = approvedRsvps;

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          getUserName(r).toLowerCase().includes(q) ||
          getUserEmail(r).toLowerCase().includes(q)
      );
    }

    // filter
    if (filter === "checked") {
      list = list.filter((r) => checkedSet.has(r.user_id));
    } else if (filter === "pending") {
      list = list.filter((r) => !checkedSet.has(r.user_id));
    }

    return list;
  }, [approvedRsvps, search, filter, checkedSet]);

  /* ── Export CSV ─────────────────────────────────────── */
  const exportCSV = () => {
    if (approvedRsvps.length === 0) {
      toast.error("No data to export");
      return;
    }
    const header = "Name,Email,Status\n";
    const rows = approvedRsvps
      .map((r) => {
        const name = getUserName(r);
        const email = getUserEmail(r);
        const status = checkedSet.has(r.user_id) ? "Checked In" : "Pending";
        return `"${name}","${email}","${status}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-event-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors mb-5"
      >
        <IoChevronBackOutline className="text-sm" />
        Back to Event
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-secondary">Attendance</h1>
          {event?.title && (
            <p className="text-sm text-stone-400 mt-0.5">{event.title}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={generateCode}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            <IoQrCodeOutline className="text-base" />
            Generate Code
          </button>
          <button
            onClick={bulkCheckIn}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-primary/20"
          >
            <IoCheckmarkDoneOutline className="text-base" />
            Check All In
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-500 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <IoDownloadOutline className="text-base" />
            Export
          </button>
        </div>
      </div>

      {/* Check-in code banner */}
      {code && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-1">
              Check-in Code
            </p>
            <p className="text-3xl font-extrabold text-primary tracking-[0.15em] font-mono">
              {code}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Share this code with attendees so they can check themselves in
            </p>
            <button
              onClick={() => {
                const url = `${window.location.origin}/checkin/${id}`;
                navigator.clipboard.writeText(url);
                toast.success("Check-in link copied");
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-primary bg-white/80 rounded-lg border border-primary/15 hover:bg-primary hover:text-white transition-colors"
            >
              <IoLinkOutline className="text-sm" />
              Copy check-in link
            </button>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast.success("Code copied");
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary bg-white rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors"
          >
            <IoCopy className="text-sm" />
            Copy
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={<IoPeopleOutline className="text-lg" />}
          label="Total Approved"
          value={totalApproved}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={<IoCheckmarkCircle className="text-lg" />}
          label="Checked In"
          value={totalChecked}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<IoCloseCircle className="text-lg" />}
          label="Pending"
          value={totalPending}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Attendance progress bar */}
      {totalApproved > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Check-in Progress
            </p>
            <p className="text-sm font-bold text-secondary">
              {totalChecked}/{totalApproved}
              <span className="text-stone-400 font-normal ml-1">
                ({Math.round((totalChecked / totalApproved) * 100)}%)
              </span>
            </p>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(
                  (totalChecked / totalApproved) * 100,
                  totalChecked > 0 ? 2 : 0
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Search & filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5 border border-stone-100 shadow-sm focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <IoSearchOutline className="text-stone-400 text-sm shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-stone-400 hover:text-stone-600"
            >
              <IoCloseOutline />
            </button>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-600 outline-none shadow-sm focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
        >
          <option value="all">All ({totalApproved})</option>
          <option value="checked">
            Checked In ({totalChecked})
          </option>
          <option value="pending">
            Pending ({totalPending})
          </option>
        </select>
      </div>

      {/* Attendee list */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {/* Table header */}
        {filteredRsvps.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-stone-100 bg-stone-50/60">
            <div className="w-9 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Attendee
              </p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Status
            </p>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-stone-50">
          {filteredRsvps.map((r) => (
            <AttendeeRow
              key={r.id || r.user_id}
              rsvp={r}
              checked={checkedSet.has(r.user_id)}
              onToggle={toggle}
              getUserName={getUserName}
              getUserEmail={getUserEmail}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredRsvps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
              <IoShieldCheckmarkOutline className="text-2xl text-stone-300" />
            </div>
            <p className="text-sm font-semibold text-stone-500">
              {search || filter !== "all"
                ? "No matching attendees"
                : "No approved RSVPs yet"}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {search || filter !== "all"
                ? "Try adjusting your search or filter"
                : "Approved attendees will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
