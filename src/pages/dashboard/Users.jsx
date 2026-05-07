import React, { useEffect, useState } from "react";
import { adminService } from "../../services/admin";
import { toast } from "react-hot-toast";
import Loading from "../../components/Loading";
import DataTable from "../../components/DataTable";
import { IoPeopleOutline, IoSearchOutline, IoTrashOutline } from "react-icons/io5";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingRole, setUpdatingRole] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const params = {};
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    const res = await adminService.listUsers(params);
    if (res.ok) setUsers(res.data || []);
    else toast.error(res.error || "Failed to fetch users");
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    const res = await adminService.updateUserRole(userId, newRole);
    if (res.ok) {
      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      toast.error(res.error || "Failed to update role");
    }
    setUpdatingRole(null);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await adminService.deleteUser(userId);
    if (res.ok) {
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      toast.error(res.error || "Failed to delete user");
    }
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
            {(row.name || "U").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dashboard-text truncate">{row.name}</p>
            <p className="text-xs text-dashboard-muted truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => {
        const badge = {
          admin: "bg-red-50 text-red-700 border-red-200",
          organizer: "bg-emerald-50 text-emerald-700 border-emerald-200",
          attendee: "bg-blue-50 text-blue-700 border-blue-200",
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge[row.role] || badge.attendee}`}>
            {row.role}
          </span>
        );
      },
    },
    {
      key: "events",
      label: "Events",
      className: "text-center text-sm text-dashboard-text",
      render: (row) => row.eventsCreated ?? 0,
    },
    {
      key: "rsvps",
      label: "RSVPs",
      className: "text-center text-sm text-dashboard-text",
      render: (row) => row.rsvpsCount ?? 0,
    },
    {
      key: "joined",
      label: "Joined",
      className: "text-sm text-dashboard-muted",
      render: (row) => {
        if (!row.created_at) return "—";
        const d = new Date(row.created_at);
        return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" });
      },
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-center w-[200px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <select
            value={row.role}
            disabled={updatingRole === row.id}
            onChange={(e) => handleRoleChange(row.id, e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-primary/40"
          >
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => handleDelete(row.id)}
            className="w-8 h-8 rounded-md border border-red-200 inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete user"
          >
            <IoTrashOutline className="text-sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Main Menu <span className="px-2">/</span> <span className="text-dashboard-text">Users</span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[30px] leading-tight font-semibold text-dashboard-text">User Management</h1>
            <p className="text-dashboard-muted mt-1">Manage roles and permissions across the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <IoPeopleOutline className="text-lg text-dashboard-muted" />
            <span className="text-sm font-medium text-dashboard-text">{users.length} users</span>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex items-center gap-3 mb-4">
          <IoSearchOutline className="text-neutral-400 text-base shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm bg-transparent outline-none border-l border-gray-200 pl-3 text-dashboard-muted"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="attendee">Attendee</option>
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <DataTable
              columns={columns}
              data={users}
              pageSize={20}
              emptyMessage="No users found."
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
