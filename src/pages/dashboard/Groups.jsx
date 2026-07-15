import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupService } from "../../services/groups";
import { adminService } from "../../services/admin";
import Loading from "../../components/Loading";
import DataTable from "../../components/DataTable";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoLayersOutline,
  IoOptionsOutline,
  IoPersonOutline,
  IoSearchOutline,
} from "../../components/icons";

export default function Groups() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [expandedSubEvents, setExpandedSubEvents] = useState({});
  const [loadingExpand, setLoadingExpand] = useState({});

  let role = "attendee";
  try {
    const user = JSON.parse(localStorage.getItem("Mahotsav-user"));
    role = user?.role || "attendee";
  } catch {}
  const isAdmin = role === "admin";
  const isOrganizer = role === "organizer";

  const listParams = isAdmin ? { admin: true } : { mine: "true" };
  const { data: groups = [], isPending: loading } = useQuery({
    queryKey: ["groups", listParams],
    queryFn: async () => {
      const res = isAdmin
        ? await adminService.listGroups()
        : await groupService.list({ mine: "true" });
      if (!res.ok) throw new Error(res.error || "Failed to load groups");
      return res.data || [];
    },
  });

  const handleExpand = async (groupId) => {
    if (expanded === groupId) {
      setExpanded(null);
      return;
    }
    setExpanded(groupId);

    // Fetch sub-events for this group if not already loaded
    if (!expandedSubEvents[groupId]) {
      setLoadingExpand((prev) => ({ ...prev, [groupId]: true }));
      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["group", groupId],
          queryFn: async () => {
            const res = await groupService.getById(groupId);
            if (!res.ok) throw new Error(res.error || "Failed to load group");
            return res.data;
          },
        });
        setExpandedSubEvents((prev) => ({
          ...prev,
          [groupId]: data?.subEvents || [],
        }));
      } catch {}
      setLoadingExpand((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const filtered = useMemo(() => {
    return groups.filter((g) =>
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.organizer_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row, idx) => {
        const subEvents = expandedSubEvents[row.id] || [];
        const isOpen = expanded === row.id;
        const visibility = (row.privacy || "public").toLowerCase();
        const isLoading = loadingExpand[row.id];

        return (
          <>
            <div className="flex items-start gap-2.5 min-w-0">
              <button
                onClick={() => handleExpand(row.id)}
                className="mt-1 text-stone-500 hover:text-stone-700"
                type="button"
              >
                {isLoading ? (
                  <span className="text-[10px] text-dashboard-muted">...</span>
                ) : (
                  <IoChevronDownOutline className={`transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                )}
              </button>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <IoLayersOutline className="text-[16px]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/dashboard/groups/${row.id}`} className="text-sm font-semibold text-dashboard-text hover:text-primary truncate">
                    {row.title}
                  </Link>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${visibility === "private" ? "bg-stone-100 text-stone-600" : "bg-emerald-50 text-emerald-700"}`}>
                    {visibility === "private" ? "Private" : "Public"}
                  </span>
                </div>
                <p className="text-xs text-dashboard-muted mt-0.5 truncate">{row.description || row.category || "No description"}</p>
                {row.organizer_name && isAdmin && (
                  <p className="text-[11px] text-emerald-600 mt-0.5 inline-flex items-center gap-1">
                    <IoPersonOutline className="text-[11px]" /> {row.organizer_name}
                  </p>
                )}
              </div>
            </div>

            {isOpen && isLoading && (
              <div className="ml-8 mt-2 py-3 text-xs text-dashboard-muted text-center">Loading sub-events...</div>
            )}

            {isOpen && !isLoading && subEvents.length > 0 && (
              <div className="ml-8 mt-2 border border-gray-200 rounded-md overflow-hidden">
                {subEvents.map((s, sIdx) => (
                  <div
                    key={s.id || sIdx}
                    className={`flex items-center justify-between px-4 py-2.5 bg-stone-50/50 ${sIdx < subEvents.length - 1 ? "border-b border-gray-200" : ""}`}
                  >
                    <p className="text-sm text-dashboard-text truncate">{s.title || "Sub-event"}</p>
                    <Link
                      to={`/dashboard/event/${s.id}`}
                      className="w-8 h-8 rounded-md border border-gray-200 inline-flex items-center justify-center text-dashboard-muted hover:bg-stone-50"
                    >
                      <IoEyeOutline />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      },
    },
    {
      key: "events",
      label: "Events",
      className: "text-center w-[90px]",
      render: (row) => {
        const count = row.sub_event_count ?? row.event_count ?? 0;
        return <span className="text-sm text-dashboard-text">{count}</span>;
      },
    },
    {
      key: "visibility",
      label: "Visibility",
      className: "text-center w-[120px]",
      render: (row) => {
        const visibility = (row.privacy || "public").toLowerCase();
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${visibility === "private" ? "bg-stone-100 text-stone-600" : "bg-emerald-50 text-emerald-700"}`}>
            {visibility === "private" ? "Private" : "Public"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-center w-[90px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Link
            to={`/dashboard/groups/${row.id}`}
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

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Main Menu <span className="px-2">/</span> {isAdmin ? "All Groups" : "Groups"}
      </div>

      <div className="px-1">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[34px] leading-tight font-semibold text-dashboard-text">
              {isAdmin ? "All Groups" : "Groups"}
            </h1>
            <p className="text-dashboard-muted mt-1">
              {isAdmin ? "All event groups across organizers." : "Organize your events into groups and sub-events."}
            </p>
          </div>
          {isOrganizer && (
            <Link
              to="/dashboard/groups/create"
              className="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-primary rounded-md hover:bg-emerald-600 transition-colors"
            >
              <IoLayersOutline className="text-base" />
              Create Group
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 mt-5">
          <div className="flex items-center gap-2 h-10 bg-white border border-gray-200 rounded-md px-3">
            <IoSearchOutline className="text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-stone-400"
            />
          </div>
          <button className="h-10 px-4 border border-gray-200 rounded-md text-sm text-dashboard-muted inline-flex items-center gap-2 bg-white">
            All Groups <IoChevronDownOutline className="text-xs" />
          </button>
          <button className="h-10 w-10 border border-gray-200 rounded-md text-dashboard-muted inline-flex items-center justify-center bg-white">
            <IoOptionsOutline />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={10}
          emptyMessage="No groups found"
        />
      </div>
    </div>
  );
}
