import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { groupService } from "../../services/groups";
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
} from "react-icons/io5";

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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [groupIcon, setGroupIcon] = useState("trophy");
  const [themeColor, setThemeColor] = useState("green");
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(!!editId);

  // Load existing group for editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setFetching(true);
      const res = await groupService.getById(editId);
      if (res.ok && res.data) {
        const g = res.data;
        setTitle(g.title || "");
        setDescription(g.description || "");
        setPrivacy(g.privacy || "public");
        if (g.subEvents?.length) {
          setEvents(g.subEvents.map((s) => ({ ...s, tempId: s.id })));
        }
      } else {
        toast.error("Group not found");
      }
      setFetching(false);
    })();
  }, [editId]);

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

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Group name is required");
      return;
    }
    setCreating(true);

    const payload = { title, description, privacy };
    let res;

    if (editId) {
      res = await groupService.update(editId, payload);
    } else {
      res = await groupService.create(payload);
    }

    if (res.ok) {
      toast.success(editId ? "Group updated!" : "Group created!");
      navigate("/dashboard/groups", { replace: false });
    } else {
      toast.error(res.error || "Failed to save group");
    }
    setCreating(false);
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

          {/* ── Sub-events ────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-dashboard-text">Sub-events</h2>
                <p className="text-xs text-dashboard-muted mt-0.5">
                  Add events to this group. You can also add them later from the group detail page.
                </p>
              </div>
              <button
                type="button"
                onClick={addEvent}
                className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-semibold text-primary border border-emerald-200 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
              >
                <IoAdd className="text-base" />
                Add Event
              </button>
            </div>

            {events.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-md py-10 text-center">
                <IoCalendarOutline className="text-2xl text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-dashboard-muted">No sub-events added yet</p>
                <p className="text-xs text-stone-400 mt-1">Click "Add Event" to start adding sub-events</p>
              </div>
            )}

            {events.map((ev, idx) => (
              <div
                key={ev.tempId}
                className="border border-gray-200 rounded-md p-4 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-dashboard-muted uppercase tracking-wide">
                    Event #{idx + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeEvent(ev.tempId)}
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <IoTrashOutline className="text-sm" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-dashboard-text mb-1 block">Title</label>
                    <input
                      value={ev.title}
                      onChange={(e) => updateEvent(ev.tempId, "title", e.target.value)}
                      placeholder="Event title"
                      className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dashboard-text mb-1 block">Category</label>
                    <input
                      value={ev.category}
                      onChange={(e) => updateEvent(ev.tempId, "category", e.target.value)}
                      placeholder="e.g. Sports"
                      className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-dashboard-text mb-1 block">Start</label>
                    <input
                      type="datetime-local"
                      value={ev.start_date}
                      onChange={(e) => updateEvent(ev.tempId, "start_date", e.target.value)}
                      className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dashboard-text mb-1 block">End</label>
                    <input
                      type="datetime-local"
                      value={ev.end_date}
                      onChange={(e) => updateEvent(ev.tempId, "end_date", e.target.value)}
                      className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-dashboard-text mb-1.5 block">Medium</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateEvent(ev.tempId, "medium", "offline")}
                      className={`flex-1 h-9 rounded-md border text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                        ev.medium === "offline"
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-dashboard-muted"
                      }`}
                    >
                      In Person
                    </button>
                    <button
                      type="button"
                      onClick={() => updateEvent(ev.tempId, "medium", "online")}
                      className={`flex-1 h-9 rounded-md border text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                        ev.medium === "online"
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-dashboard-muted"
                      }`}
                    >
                      <IoLinkOutline /> Online
                    </button>
                  </div>
                </div>

                {ev.medium === "offline" ? (
                  <div>
                    <label className="text-xs font-semibold text-dashboard-text mb-1 block">Location</label>
                    <input
                      value={ev.location_name}
                      onChange={(e) => updateEvent(ev.tempId, "location_name", e.target.value)}
                      placeholder="Venue name or address"
                      className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-dashboard-text mb-1 block">Meeting Link</label>
                    <input
                      value={ev.meet_link}
                      onChange={(e) => updateEvent(ev.tempId, "meet_link", e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3 h-10 text-sm border border-gray-200 rounded-md outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-dashboard-text mb-1 block">Description</label>
                  <textarea
                    value={ev.description}
                    onChange={(e) => updateEvent(ev.tempId, "description", e.target.value)}
                    placeholder="Brief event description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none resize-none"
                  />
                </div>
              </div>
            ))}
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
