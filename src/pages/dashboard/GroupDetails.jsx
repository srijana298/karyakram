import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { groupService } from "../../services/groups";
import Loading from "../../components/Loading";

export default function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [stats, setStats] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [g, s, c, a] = await Promise.all([
        groupService.getById(id),
        groupService.stats(id),
        groupService.conflicts(id),
        groupService.attendanceSummary(id),
      ]);
      if (g.ok) setGroup(g.data);
      if (s.ok) setStats(s.data);
      if (c.ok) setConflicts(c.data);
      if (a.ok) setSummary(a.data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Loading />;
  if (!group) return <p className="text-sm text-stone-500">Group not found</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-secondary">{group.title}</h1>
        <Link to={`/dashboard/create?groupId=${group.id}`} className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">Add Sub-event</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Stat title="Sub-events" value={stats?.totalSubEvents ?? 0} />
        <Stat title="Total RSVPs" value={stats?.totalRsvps ?? 0} />
        <Stat title="Checked-in" value={stats?.checkedIn ?? 0} />
        <Stat title="Attendance %" value={`${stats?.attendanceRate ?? 0}%`} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h2 className="text-sm font-bold text-secondary mb-3">Sub-events</h2>
        <div className="space-y-2">
          {(group.subEvents || []).map((e) => (
            <Link key={e.id} to={`/dashboard/event/${e.id}`} className="block text-sm text-primary hover:underline">
              {e.title}
            </Link>
          ))}
          {(group.subEvents || []).length === 0 && <p className="text-sm text-stone-500">No sub-events yet.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h2 className="text-sm font-bold text-secondary mb-3">Conflict Timeline</h2>
        {(conflicts?.conflicts || []).length === 0 ? (
          <p className="text-sm text-stone-500">No overlaps detected.</p>
        ) : (
          <div className="space-y-3">
            {conflicts.conflicts.map((c, i) => (
              <div key={i} className={`p-3 rounded-lg border ${c.severity === "critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                <p className="text-sm font-semibold text-secondary">{c.eventA.title} ↔ {c.eventB.title}</p>
                <p className="text-xs text-stone-500 mt-1">{new Date(c.eventA.start).toLocaleString()} → {new Date(c.eventA.end).toLocaleTimeString()}</p>
                <p className="text-xs text-stone-500">{new Date(c.eventB.start).toLocaleString()} → {new Date(c.eventB.end).toLocaleTimeString()}</p>
                <p className="text-xs mt-1">Shared users: <b>{c.sharedUsersCount}</b> · Severity: <b>{c.severity}</b></p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h2 className="text-sm font-bold text-secondary mb-3">Per-student Attendance</h2>
        <div className="space-y-2">
          {(summary?.students || []).map((s) => (
            <div key={s.userId} className="flex items-center gap-3 text-sm">
              <p className="w-40 truncate">{s.name}</p>
              <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${s.attendanceRate}%` }} />
              </div>
              <p className="w-28 text-right text-stone-500">{s.attendedCount}/{s.totalSubEvents} ({s.attendanceRate}%)</p>
            </div>
          ))}
          {(summary?.students || []).length === 0 && <p className="text-sm text-stone-500">No attendance data yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <p className="text-xs text-stone-500">{title}</p>
      <p className="text-xl font-bold text-secondary mt-1">{value}</p>
    </div>
  );
}
