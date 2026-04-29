import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupService } from "../../services/groups";
import { toast } from "react-hot-toast";
import {
  IoCalendarOutline,
  IoChevronBackOutline,
  IoFlagOutline,
  IoGlobeOutline,
  IoLayersOutline,
  IoLockClosedOutline,
  IoMusicalNotesOutline,
  IoOptionsOutline,
  IoPeopleOutline,
  IoTrophyOutline,
} from "react-icons/io5";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [groupIcon, setGroupIcon] = useState("trophy");
  const [themeColor, setThemeColor] = useState("green");
  const [creating, setCreating] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    const res = await groupService.create({ title, description, privacy });
    if (res.ok) {
      toast.success("Group created!");
      navigate("/dashboard/groups", { replace: false });
    } else {
      toast.error(res.error || "Failed to create group");
    }
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Groups <span className="px-2">/</span> Create Group
      </div>

      <div className="px-1 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-dashboard-muted hover:text-dashboard-text transition-colors mb-4"
        >
          <IoChevronBackOutline className="text-base" />
          Back
        </button>

        <h1 className="text-[40px] leading-tight font-semibold text-dashboard-text">Create Group</h1>
        <p className="text-dashboard-muted mt-1">Create a group to organize related events and sub-events.</p>

        <form onSubmit={create} className="mt-6 space-y-5">
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
              Description <span className="text-red-500">*</span>
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
              {[
                { key: "trophy", icon: <IoTrophyOutline /> },
                { key: "idea", icon: <IoOptionsOutline /> },
                { key: "music", icon: <IoMusicalNotesOutline /> },
                { key: "people", icon: <IoPeopleOutline /> },
                { key: "edu", icon: <IoCalendarOutline /> },
                { key: "sports", icon: <IoLayersOutline /> },
                { key: "flag", icon: <IoFlagOutline /> },
              ].map((it) => (
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
              {[
                { key: "green", cls: "bg-emerald-500" },
                { key: "blue", cls: "bg-blue-500" },
                { key: "purple", cls: "bg-violet-500" },
                { key: "orange", cls: "bg-orange-500" },
                { key: "red", cls: "bg-rose-500" },
                { key: "cyan", cls: "bg-cyan-500" },
                { key: "gray", cls: "bg-slate-400" },
              ].map((c) => (
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

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
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
              {creating ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
