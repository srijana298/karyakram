import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";
import { adminService } from "../../services/admin";
import { useUser } from "../../context/userContext";
import {
  IoCalendarOutline,
  IoLayersOutline,
  IoPeopleOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
} from "../../components/icons";

const tabs = ["Overview", "Users", "Events", "Groups"];

function Admin() {
  const { userInfo } = useUser();
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [eventFilters, setEventFilters] = useState({ category: "", medium: "", privacy: "" });
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await adminService.stats();
      if (!res.ok) throw new Error(res.error || "Failed to load admin stats");
      return res.data;
    },
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", { search, role }],
    queryFn: async () => {
      const res = await adminService.users({ search, role });
      if (!res.ok) throw new Error(res.error || "Failed to load users");
      return res.data || [];
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["admin", "events", { search, ...eventFilters }],
    queryFn: async () => {
      const res = await adminService.events({ search, ...eventFilters });
      if (!res.ok) throw new Error(res.error || "Failed to load events");
      return res.data || [];
    },
  });

  const groupsQuery = useQuery({
    queryKey: ["admin", "groups"],
    queryFn: async () => {
      const res = await adminService.groups();
      if (!res.ok) throw new Error(res.error || "Failed to load groups");
      return res.data || [];
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, nextRole }) => adminService.updateUserRole(id, nextRole),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error || "Failed to update role");
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error || "Failed to delete user");
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => adminService.deleteEvent(id),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error || "Failed to delete event");
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: (id) => adminService.deleteGroup(id),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error || "Failed to delete group");
      toast.success("Group deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "groups"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const stats = statsQuery.data;
  const categories = (stats?.eventsByCategory || []).map((item) => item.category).filter(Boolean);
  const currentUserId = Number(userInfo?.id);

  const formatDate = (value) => {
    if (!value) return "TBA";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "TBA";
    return date.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" });
  };

  const confirmDelete = (label, action) => {
    if (window.confirm(`Delete ${label}? This cannot be undone.`)) action();
  };

  const userColumns = [
    {
      key: "name",
      label: "User",
      render: (user) => (
        <div>
          <p className="font-semibold text-stone-900 dark:text-white">{user.name || "Unnamed user"}</p>
          <p className="text-xs text-stone-500 dark:text-white/45">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user) => {
        const isCurrentUser = Number(user.id) === currentUserId;
        return (
        <select
          value={user.role || "user"}
          disabled={isCurrentUser}
          onChange={(e) => updateRole.mutate({ id: user.id, nextRole: e.target.value })}
          title={isCurrentUser ? "You cannot change your own admin role" : "Change user role"}
          className="h-9 rounded-md border border-stone-200 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#151517]"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        );
      },
    },
    { key: "eventsCreated", label: "Events", render: (user) => user.eventsCreated || 0 },
    { key: "rsvpsCount", label: "RSVPs", render: (user) => user.rsvpsCount || 0 },
    { key: "created_at", label: "Joined", render: (user) => formatDate(user.created_at) },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (user) => {
        const isCurrentUser = Number(user.id) === currentUserId;
        return (
          <button
            disabled={isCurrentUser}
            onClick={() => confirmDelete(user.name || user.email, () => deleteUser.mutate(user.id))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent dark:hover:bg-red-500/10 dark:disabled:text-white/20"
            title={isCurrentUser ? "You cannot delete your own account" : "Delete user"}
          >
            <IoTrashOutline />
          </button>
        );
      },
    },
  ];

  const eventColumns = [
    {
      key: "title",
      label: "Event",
      render: (event) => (
        <div>
          <p className="font-semibold text-stone-900 dark:text-white">{event.title || "Untitled event"}</p>
          <p className="text-xs text-stone-500 dark:text-white/45">{event.organizer_name || "Unknown organizer"}</p>
        </div>
      ),
    },
    { key: "category", label: "Category", render: (event) => event.category || "-" },
    { key: "medium", label: "Medium", render: (event) => <StatusPill value={event.medium || "offline"} /> },
    { key: "privacy", label: "Privacy", render: (event) => <StatusPill value={event.privacy || "public"} /> },
    { key: "start_date", label: "Date", render: (event) => formatDate(event.start_date) },
    { key: "location_name", label: "Location", render: (event) => event.location_name || event.meet_link || "-" },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (event) => (
        <button
          onClick={() => confirmDelete(event.title || "this event", () => deleteEvent.mutate(event.id))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          title="Delete event"
        >
          <IoTrashOutline />
        </button>
      ),
    },
  ];

  const groupColumns = [
    {
      key: "title",
      label: "Group",
      render: (group) => (
        <div>
          <p className="font-semibold text-stone-900 dark:text-white">{group.title || "Untitled group"}</p>
          <p className="text-xs text-stone-500 dark:text-white/45">{group.organizer_name || "Unknown organizer"}</p>
        </div>
      ),
    },
    { key: "category", label: "Category", render: (group) => group.category || "-" },
    { key: "privacy", label: "Privacy", render: (group) => <StatusPill value={group.privacy || "public"} /> },
    { key: "created_at", label: "Created", render: (group) => formatDate(group.created_at) },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (group) => (
        <button
          onClick={() => confirmDelete(group.title || "this group", () => deleteGroup.mutate(group.id))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          title="Delete group"
        >
          <IoTrashOutline />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            <IoShieldCheckmarkOutline /> Admin Console
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 dark:text-white">Platform control</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-white/50">Monitor activity, manage accounts, and remove content across Mahotsav.</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-9 rounded-md px-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-stone-950 text-white dark:bg-white dark:text-stone-950"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {statsQuery.isPending ? <Loading /> : null}
      {statsQuery.error ? <p className="text-sm text-red-500">{statsQuery.error.message}</p> : null}

      {activeTab === "Overview" && stats && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metric icon={<IoCalendarOutline />} label="Events" value={stats.overview?.totalEvents || 0} />
            <Metric icon={<IoPeopleOutline />} label="Users" value={stats.overview?.totalUsers || 0} />
            <Metric icon={<IoShieldCheckmarkOutline />} label="RSVPs" value={stats.overview?.totalRsvps || 0} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Breakdown title="Events by category" data={stats.eventsByCategory || []} labelKey="category" />
            <Breakdown title="Events by medium" data={stats.eventsByMedium || []} labelKey="medium" />
            <RsvpTrendChart data={stats.rsvpTrend || []} />
          </div>
        </div>
      )}

      {activeTab === "Users" && (
        <section className="space-y-4">
          <Toolbar search={search} setSearch={setSearch} placeholder="Search users">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="admin-select">
              <option value="">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </Toolbar>
          <Panel loading={usersQuery.isPending} error={usersQuery.error}>
            <DataTable columns={userColumns} data={usersQuery.data || []} emptyMessage="No users found" />
          </Panel>
        </section>
      )}

      {activeTab === "Events" && (
        <section className="space-y-4">
          <Toolbar search={search} setSearch={setSearch} placeholder="Search events">
            <select value={eventFilters.category} onChange={(e) => setEventFilters((f) => ({ ...f, category: e.target.value }))} className="admin-select">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select value={eventFilters.medium} onChange={(e) => setEventFilters((f) => ({ ...f, medium: e.target.value }))} className="admin-select">
              <option value="">All mediums</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <select value={eventFilters.privacy} onChange={(e) => setEventFilters((f) => ({ ...f, privacy: e.target.value }))} className="admin-select">
              <option value="">All privacy</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </Toolbar>
          <Panel loading={eventsQuery.isPending} error={eventsQuery.error}>
            <DataTable columns={eventColumns} data={eventsQuery.data || []} emptyMessage="No events found" />
          </Panel>
        </section>
      )}

      {activeTab === "Groups" && (
        <section className="space-y-4">
          <Panel loading={groupsQuery.isPending} error={groupsQuery.error}>
            <DataTable columns={groupColumns} data={groupsQuery.data || []} emptyMessage="No groups found" />
          </Panel>
        </section>
      )}
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#121214]">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">{icon}</div>
      <p className="mt-3 text-xs font-medium text-stone-500 dark:text-white/45">{label}</p>
      <p className="text-3xl font-semibold text-stone-950 dark:text-white">{Number(value).toLocaleString()}</p>
    </div>
  );
}

function Breakdown({ title, data, labelKey }) {
  const max = Math.max(...data.map((item) => Number(item.count || 0)), 1);

  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#121214]">
      <h2 className="text-sm font-semibold text-stone-950 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {data.length === 0 && <p className="text-sm text-stone-500 dark:text-white/45">No data yet.</p>}
        {data.map((item) => {
          const count = Number(item.count || 0);
          return (
            <div key={`${title}-${item[labelKey] || "unknown"}`} className="grid grid-cols-[120px_1fr_44px] items-center gap-3 text-sm">
              <span className="truncate text-stone-600 dark:text-white/60">{item[labelKey] || "Unknown"}</span>
              <span className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(6, (count / max) * 100)}%` }} />
              </span>
              <span className="text-right tabular-nums text-stone-500 dark:text-white/45">{count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RsvpTrendChart({ data }) {
  const width = 520;
  const height = 220;
  const padding = { top: 18, right: 18, bottom: 42, left: 42 };
  const points = data.map((item) => ({
    label: item.month || "Unknown",
    count: Number(item.count || 0),
  }));
  const max = Math.max(...points.map((point) => point.count), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const plotted = points.map((point, index) => {
    const x = padding.left + (points.length <= 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
    const y = padding.top + innerHeight - (point.count / max) * innerHeight;
    return { ...point, x, y };
  });
  const line = plotted.map((point) => `${point.x},${point.y}`).join(" ");
  const area = plotted.length
    ? `${padding.left},${padding.top + innerHeight} ${line} ${padding.left + innerWidth},${padding.top + innerHeight}`
    : "";

  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#121214]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-950 dark:text-white">RSVP trend</h2>
        {points.length > 0 && (
          <span className="text-xs tabular-nums text-stone-500 dark:text-white/45">
            {points.reduce((sum, point) => sum + point.count, 0).toLocaleString()} total
          </span>
        )}
      </div>

      {points.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500 dark:text-white/45">No data yet.</p>
      ) : (
        <div className="mt-4 h-[240px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" role="img" aria-label="RSVP trend line chart">
            {[0, 0.5, 1].map((tick) => {
              const y = padding.top + innerHeight - tick * innerHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={padding.left + innerWidth} y1={y} y2={y} className="stroke-stone-100 dark:stroke-white/10" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-stone-400 text-[10px] tabular-nums dark:fill-white/35">
                    {Math.round(max * tick)}
                  </text>
                </g>
              );
            })}
            {area && <polygon points={area} className="fill-emerald-500/10 dark:fill-emerald-300/10" />}
            {plotted.length > 1 ? (
              <polyline points={line} fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-600 stroke-[3] dark:stroke-emerald-300" />
            ) : (
              <line x1={padding.left} x2={padding.left + innerWidth} y1={plotted[0].y} y2={plotted[0].y} strokeLinecap="round" className="stroke-emerald-600 stroke-[3] dark:stroke-emerald-300" />
            )}
            {plotted.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="5" className="fill-white stroke-emerald-600 stroke-[3] dark:fill-[#121214] dark:stroke-emerald-300" />
                <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-stone-700 text-[11px] font-semibold tabular-nums dark:fill-white/75">
                  {point.count}
                </text>
                <text x={point.x} y={height - 14} textAnchor="middle" className="fill-stone-400 text-[10px] dark:fill-white/35">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}

function Toolbar({ search, setSearch, placeholder, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 dark:border-white/10 dark:bg-[#121214]">
        <IoSearchOutline className="shrink-0 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
        />
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Panel({ loading, error, children }) {
  if (loading) return <Loading />;
  if (error) return <p className="text-sm text-red-500">{error.message}</p>;
  return <div className="overflow-hidden rounded-md border border-stone-200 bg-white dark:border-white/10 dark:bg-[#121214]">{children}</div>;
}

function StatusPill({ value }) {
  return (
    <span className="inline-flex h-7 items-center rounded-full bg-stone-100 px-2.5 text-xs font-medium capitalize text-stone-700 dark:bg-white/10 dark:text-white/70">
      {value}
    </span>
  );
}

export default Admin;
