import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { groupService } from "../../services/groups";
import { eventService } from "../../services/events";
import { toast } from "react-hot-toast";
import {
  IoAdd,
  IoCalendarOutline,
  IoChevronBackOutline,
  IoClose,
  IoFlagOutline,
  IoGlobeOutline,
  IoLayersOutline,
  IoLinkOutline,
  IoLockClosedOutline,
  IoMusicalNotesOutline,
  IoOptionsOutline,
  IoPeopleOutline,
  IoTrophyOutline,
  IoTrashOutline,
} from "../../components/icons";

const ICON_OPTIONS = [
  { key: "trophy", icon: <IoTrophyOutline /> },
  { key: "idea", icon: <IoOptionsOutline /> },
  { key: "music", icon: <IoMusicalNotesOutline /> },
  { key: "people", icon: <IoPeopleOutline /> },
  { key: "edu", icon: <IoCalendarOutline /> },
  { key: "sports", icon: <IoLayersOutline /> },
  { key: "flag", icon: <IoFlagOutline /> },
];

const COLOR_OPTIONS = [
  { key: "green", cls: "bg-emerald-500" },
  { key: "blue", cls: "bg-blue-500" },
  { key: "purple", cls: "bg-violet-500" },
  { key: "orange", cls: "bg-orange-500" },
  { key: "red", cls: "bg-rose-500" },
  { key: "cyan", cls: "bg-cyan-500" },
  { key: "gray", cls: "bg-slate-400" },
];

function emptyEvent() {
  return {
    tempId: Date.now() + Math.random(),
    title: "",
    start_date: "",
    end_date: "",
    category: "",
    medium: "offline",
    location_name: "",
    meet_link: "",
    description: "",
  };
}

export default function CreateGroup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [groupIcon, setGroupIcon] = useState("trophy");
  const [themeColor, setThemeColor] = useState("green");
  const [events, setEvents] = useState([]);
  const [groupMode, setGroupMode] = useState("scratch");
  const [selectedEventIds, setSelectedEventIds] = useState([]);

  // Load existing group for editing
  const { data: group, isPending: fetchingGroup } = useQuery({
    queryKey: ["group", editId],
    enabled: !!editId,
    queryFn: async () => {
      const res = await groupService.getById(editId);
      if (!res.ok || !res.data) {
        toast.error("Group not found");
        throw new Error(res.error || "Group not found");
      }
      return res.data;
    },
  });

  // Populate the form once the existing group has loaded (edit mode).
  useEffect(() => {
    if (!group) return;
    const g = group;
    setTitle(g.title || "");
    setDescription(g.description || "");
    setPrivacy(g.privacy || "public");
    if (g.subEvents?.length) {
      setEvents(g.subEvents.map((s) => ({ ...s, tempId: s.id })));
      setSelectedEventIds(g.subEvents.map((s) => s.id));
      setGroupMode("existing");
    }
  }, [group]);

  const { data: existingEvents = [] } = useQuery({
    queryKey: ["events", { mine: true }],
    queryFn: async () => {
      const res = await eventService.list({ mine: "true" });
      if (!res.ok) throw new Error(res.error || "Failed to load events");
      return res.data || [];
    },
  });

  const fetching = !!editId && fetchingGroup;

  const pageTitle = editId ? "Edit Group" : "Create Group";

  const addEvent = () => {
    setEvents((prev) => [...prev, emptyEvent()]);
  };

  const removeEvent = (tempId) => {
    setEvents((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  const updateEvent = (tempId, field, value) => {
    setEvents((prev) =>
      prev.map((e) => (e.tempId === tempId ? { ...e, [field]: value } : e))
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { title, description, privacy };
      const res = editId
        ? await groupService.update(editId, payload)
        : await groupService.create(payload);
      if (!res.ok) throw new Error(res.error || "Failed to save group");

      const groupId = editId || res.data?.id;
      if (groupMode === "existing" && groupId) {
        await Promise.all(
          selectedEventIds.map((eventId) =>
            eventService.update(eventId, { group_id: Number(groupId) })
          )
        );
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (editId) queryClient.invalidateQueries({ queryKey: ["group", editId] });
      toast.success(editId ? "Group updated!" : "Group created!");
      navigate("/dashboard/groups", { replace: false });
    },
    onError: (err) => toast.error(err.message),
  });
  const creating = saveMutation.isPending;

  const create = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Group name is required");
      return;
    }
    saveMutation.mutate();
  };

  if (fetching) return null;

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Groups <span className="px-2">/</span> {pageTitle}
      </div>

      <div className="px-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-dashboard-muted hover:text-dashboard-text transition-colors mb-4"
        >
          <IoChevronBackOutline className="text-base" />
          Back
        </button>

        <h1 className="text-[40px] leading-tight font-semibold text-dashboard-text">{pageTitle}</h1>
        <p className="text-dashboard-muted mt-1">Create a group to organize related events and sub-events.</p>

        <form onSubmit={create} className="mt-6 space-y-6">
          {/* ── Group details ─────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
            <h2 className="text-lg font-semibold text-dashboard-text">Group Details</h2>

            <div>
              <label className="text-sm font-semibold text-dashboard-text mb-1.5 block">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sports Week 2025"
                className="w-full px-3 h-11 text-sm border border-gray-200 rounded-md outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-dashboard-text mb-1.5 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a short description about this group."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-dashboard-text mb-2 block">
                Visibility <span className="text-red-500">*</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy("public")}
                  className={`h-12 rounded-md border text-left px-4 inline-flex items-center gap-2 ${
                    privacy === "public"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-dashboard-text"
                  }`}
                >
                  <IoGlobeOutline />
                  <span className="font-semibold">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy("private")}
                  className={`h-12 rounded-md border text-left px-4 inline-flex items-center gap-2 ${
                    privacy === "private"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-dashboard-text"
                  }`}
                >
                  <IoLockClosedOutline />
                  <span className="font-semibold">Private</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-dashboard-text mb-1 block">Group Icon</label>
              <p className="text-xs text-dashboard-muted mb-2">Choose an icon to represent your group.</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => setGroupIcon(it.key)}
                    className={`w-10 h-10 rounded-md border inline-flex items-center justify-center ${
                      groupIcon === it.key
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-dashboard-muted"
                    }`}
                  >
                    {it.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-dashboard-text mb-1 block">Color Theme</label>
              <p className="text-xs text-dashboard-muted mb-2">Choose a color that represents your group.</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setThemeColor(c.key)}
                    className={`w-7 h-7 rounded-full ${c.cls} ${
                      themeColor === c.key ? "ring-2 ring-offset-2 ring-emerald-500" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Events option ────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-dashboard-text">Events in this group</h2>
              <p className="text-xs text-dashboard-muted mt-0.5">
                Start with an empty group, or attach events you already created.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGroupMode("scratch")}
                className={`text-left rounded-md border p-4 transition-colors ${
                  groupMode === "scratch"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 hover:bg-stone-50"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 inline-flex items-center justify-center text-primary mb-3">
                  <IoAdd />
                </div>
                <p className="text-sm font-semibold text-dashboard-text">Create from scratch</p>
                <p className="text-xs text-dashboard-muted mt-1">
                  Create the group now and add new events to it later.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGroupMode("existing")}
                className={`text-left rounded-md border p-4 transition-colors ${
                  groupMode === "existing"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 hover:bg-stone-50"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 inline-flex items-center justify-center text-primary mb-3">
                  <IoCalendarOutline />
                </div>
                <p className="text-sm font-semibold text-dashboard-text">Use existing events</p>
                <p className="text-xs text-dashboard-muted mt-1">
                  Select existing events and attach them to this group.
                </p>
              </button>
            </div>

            {groupMode === "existing" && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                {existingEvents.length === 0 ? (
                  <div className="py-10 text-center">
                    <IoCalendarOutline className="text-2xl text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-dashboard-muted">No existing events found</p>
                    <p className="text-xs text-stone-400 mt-1">Create events first, then attach them to a group.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {existingEvents.map((event) => {
                      const checked = selectedEventIds.includes(event.id);
                      return (
                        <label
                          key={event.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedEventIds((prev) =>
                                e.target.checked
                                  ? [...prev, event.id]
                                  : prev.filter((id) => id !== event.id)
                              );
                            }}
                            className="w-4 h-4 accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dashboard-text truncate">{event.title}</p>
                            <p className="text-xs text-dashboard-muted">
                              {event.category || "Uncategorized"}
                              {event.group_id ? ` · currently in group #${event.group_id}` : " · no group"}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Actions ───────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 pb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-stone-600 rounded-md border border-gray-200 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || creating}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {creating ? "Saving..." : editId ? "Update Group" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
