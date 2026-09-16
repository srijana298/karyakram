import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { calendarService } from "../../services/calendars";
import { IoCheckmarkCircleOutline, IoCloudUploadOutline } from "../../components/icons";

function toSlug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CreateCalendar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarRef = useRef(); const coverRef = useRef();
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [avatar, setAvatar] = useState(null); const [cover, setCover] = useState(null);
  const coverUrl = cover && URL.createObjectURL(cover); const avatarUrl = avatar && URL.createObjectURL(avatar);
  const chooseName = (value) => { setName(value); if (!slugTouched) setSlug(toSlug(value)); };

  const slugQuery = useQuery({
    queryKey: ["calendar-slug", slug],
    enabled: slug.length > 0,
    queryFn: async () => {
      const res = await calendarService.checkSlug(slug);
      if (!res.ok) throw new Error(res.error || "Failed to check public URL");
      return res.data;
    },
  });

  const slugAvailable = slugQuery.data?.available === true;
  const slugTaken = slugQuery.data?.available === false;

  const createMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries({ name, description, slug }).forEach(([k,v]) => data.append(k,v));
      if (avatar) data.append("avatar", avatar); if (cover) data.append("cover", cover);
      const res = await calendarService.create(data);
      if (!res.ok) throw new Error(res.error || "Failed to create calendar");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      toast.success("Calendar created"); navigate("/calendars");
    },
    onError: (err) => toast.error(err.message),
  });
  const saving = createMutation.isPending;

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Calendar name is required");
    if (!slug.trim()) return toast.error("Public URL is required");
    if (slugQuery.isFetching) return toast.error("Checking public URL. Try again in a moment.");
    if (!slugAvailable) return toast.error("That public URL is already taken");
    createMutation.mutate();
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h1 className="text-4xl font-bold text-stone-900 dark:text-white">Create Calendar</h1>
      <form onSubmit={submit} className="mt-10 space-y-7">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-white/10 dark:bg-[#18181a]">
          <div className="relative h-64 sm:h-72 bg-stone-200 dark:bg-white/[0.15]" style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: "linear-gradient(135deg, #e7e5e4, #a8a29e)" }}>
            <button type="button" onClick={() => coverRef.current.click()} className="absolute right-5 top-5 rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-800 backdrop-blur dark:bg-black/30 dark:text-white dark:border-white/10">Change cover</button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => setCover(e.target.files[0])} />
          </div>
          <div className="relative px-6 pb-7 pt-16">
            <button type="button" onClick={() => avatarRef.current.click()} className="absolute -top-14 left-7 w-28 h-28 rounded-3xl border-[6px] border-white dark:border-[#18181a] overflow-hidden flex items-center justify-center bg-stone-500 text-3xl font-bold text-white">
              {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" /> : name.slice(0,2).toUpperCase() || <IoCloudUploadOutline />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" hidden onChange={(e) => setAvatar(e.target.files[0])} />
            <input autoFocus value={name} onChange={(e) => chooseName(e.target.value)} placeholder="Calendar Name" className="w-full border-b border-stone-300 dark:border-white/20 bg-transparent pb-4 text-3xl font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/25 outline-none" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a short description." rows={2} className="mt-4 w-full resize-none bg-transparent text-base text-stone-600 dark:text-white/55 placeholder:text-stone-400 dark:placeholder:text-white/25 outline-none" />
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#18181a]">
          <h2 className="text-xl font-semibold">Calendar Details</h2>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-stone-700 dark:text-white/75">Public URL</label>
            <div className={`mt-2 flex h-12 overflow-hidden rounded-xl border dark:border-white/10 ${slugTaken ? "border-red-300" : slugAvailable ? "border-emerald-300" : "border-stone-200"}`}>
              <span className="flex items-center bg-stone-100 px-4 text-sm text-stone-500 dark:bg-white/10 dark:text-white/45">mahotsav.com/calendar/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(toSlug(e.target.value));
                }}
                className="min-w-0 flex-1 bg-transparent px-3 outline-none"
                required
              />
            </div>
            <p className={`mt-2 text-xs font-medium ${slugTaken ? "text-red-500" : slugAvailable ? "text-emerald-600" : "text-stone-400"}`}>
              {!slug
                ? "Generated from the calendar name."
                : slugQuery.isFetching
                  ? "Checking availability..."
                  : slugTaken
                    ? "This public URL is already taken."
                    : slugAvailable
                      ? "This public URL is available."
                      : "Generated from the calendar name."}
            </p>
          </div>
        </section>
        <button disabled={saving || slugQuery.isFetching || (slug.length > 0 && !slugAvailable)} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 font-semibold text-white hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900"><IoCheckmarkCircleOutline />{saving ? "Creating…" : "Create Calendar"}</button>
      </form>
    </div>
  );
}
