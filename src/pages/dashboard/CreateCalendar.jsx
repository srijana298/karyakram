import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { calendarService } from "../../services/calendars";
import { IoCheckmarkCircleOutline, IoCloudUploadOutline, IoLocationOutline, IoSearchOutline } from "../../components/icons";

const CITIES = [
  ["Kathmandu", 27.7172, 85.324], ["Lalitpur", 27.6644, 85.3188], ["Bhaktapur", 27.671, 85.4298],
  ["Pokhara", 28.2096, 83.9856], ["Bharatpur", 27.6766, 84.4359], ["Biratnagar", 26.4525, 87.2718],
  ["Birgunj", 27.0104, 84.877], ["Janakpur", 26.7288, 85.925], ["Hetauda", 27.4287, 85.0322],
  ["Butwal", 27.7006, 83.4484], ["Dharan", 26.8065, 87.2846], ["Itahari", 26.6631, 87.2749],
  ["Nepalgunj", 28.05, 81.6167], ["Dhangadhi", 28.701, 80.5898], ["Tulsipur", 28.1302, 82.2973],
  ["Ghorahi", 28.0417, 82.4861], ["Siddharthanagar", 27.5057, 83.4572], ["Kirtipur", 27.678, 85.2774],
];
const COLORS = ["#d6d3d1", "#e879a9", "#b56be8", "#9b87f5", "#6f9fec", "#82cf67", "#efc86f", "#ee9a6c", "#ec7168", "#a18b32"];

export default function CreateCalendar() {
  const navigate = useNavigate();
  const avatarRef = useRef(); const coverRef = useRef();
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [slug, setSlug] = useState(""); const [color, setColor] = useState(COLORS[4]);
  const [cityQuery, setCityQuery] = useState(""); const [city, setCity] = useState(null);
  const [avatar, setAvatar] = useState(null); const [cover, setCover] = useState(null); const [saving, setSaving] = useState(false);
  const matches = useMemo(() => CITIES.filter(([n]) => n.toLowerCase().includes(cityQuery.toLowerCase())).slice(0, 7), [cityQuery]);
  const coverUrl = cover && URL.createObjectURL(cover); const avatarUrl = avatar && URL.createObjectURL(avatar);
  const chooseName = (value) => { setName(value); if (!slug) setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); };
  const mapUrl = city ? `https://www.openstreetmap.org/export/embed.html?bbox=${city[2]-0.12}%2C${city[1]-0.08}%2C${city[2]+0.12}%2C${city[1]+0.08}&layer=mapnik&marker=${city[1]}%2C${city[2]}` : "https://www.openstreetmap.org/export/embed.html?bbox=80.0%2C26.3%2C88.3%2C30.5&layer=mapnik";

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Calendar name is required");
    if (!city) return toast.error("Choose a city in Nepal");
    setSaving(true);
    const data = new FormData();
    Object.entries({ name, description, slug, color, city: city[0], latitude: city[1], longitude: city[2] }).forEach(([k,v]) => data.append(k,v));
    if (avatar) data.append("avatar", avatar); if (cover) data.append("cover", cover);
    const res = await calendarService.create(data);
    setSaving(false);
    if (!res.ok) return toast.error(res.error || "Failed to create calendar");
    toast.success("Calendar created"); navigate("/dashboard/calendars");
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h1 className="text-4xl font-bold text-stone-900 dark:text-white">Create Calendar</h1>
      <form onSubmit={submit} className="mt-10 space-y-7">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-white/10 dark:bg-[#18181a]">
          <div className="relative h-64 sm:h-72 bg-stone-200 dark:bg-white/[0.15]" style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: `linear-gradient(135deg, ${color}55, ${color}aa)` }}>
            <button type="button" onClick={() => coverRef.current.click()} className="absolute right-5 top-5 rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-800 backdrop-blur dark:bg-black/30 dark:text-white dark:border-white/10">Change cover</button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => setCover(e.target.files[0])} />
          </div>
          <div className="relative px-6 pb-7 pt-16">
            <button type="button" onClick={() => avatarRef.current.click()} className="absolute -top-14 left-7 w-28 h-28 rounded-3xl border-[6px] border-white dark:border-[#18181a] overflow-hidden flex items-center justify-center text-3xl font-bold text-white" style={{ background: color }}>
              {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" /> : name.slice(0,2).toUpperCase() || <IoCloudUploadOutline />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" hidden onChange={(e) => setAvatar(e.target.files[0])} />
            <input autoFocus value={name} onChange={(e) => chooseName(e.target.value)} placeholder="Calendar Name" className="w-full border-b border-stone-300 dark:border-white/20 bg-transparent pb-4 text-3xl font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/25 outline-none" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a short description." rows={2} className="mt-4 w-full resize-none bg-transparent text-base text-stone-600 dark:text-white/55 placeholder:text-stone-400 dark:placeholder:text-white/25 outline-none" />
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#18181a]">
          <h2 className="text-xl font-semibold">Customization</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-sm font-semibold text-stone-700 dark:text-white/75">Tint color</label>
              <div className="mt-3 flex flex-wrap gap-3">{COLORS.map(c => <button type="button" key={c} onClick={() => setColor(c)} aria-label={`Use ${c}`} className={`w-9 h-9 rounded-full ${color === c ? "ring-2 ring-offset-4 ring-stone-700 dark:ring-white dark:ring-offset-[#18181a]" : ""}`} style={{ background: c }} />)}</div>
              <label className="mt-8 block text-sm font-semibold text-stone-700 dark:text-white/75">Public URL</label>
              <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-stone-200 dark:border-white/10">
                <span className="flex items-center bg-stone-100 px-4 text-sm text-stone-500 dark:bg-white/10 dark:text-white/45">mahotsav.com/calendar/</span>
                <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} className="min-w-0 flex-1 bg-transparent px-3 outline-none" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 dark:text-white/75">Location · Nepal</label>
              <div className="relative mt-2">
                <IoSearchOutline className="absolute left-3 top-3.5 text-stone-400" />
                <input value={cityQuery} onChange={(e) => { setCityQuery(e.target.value); setCity(null); }} placeholder="Search Nepal cities" className="w-full h-12 rounded-xl border border-stone-200 bg-transparent pl-10 pr-3 outline-none focus:border-stone-400 dark:border-white/10" />
                {cityQuery && !city && <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#242426]">{matches.map(c => <button type="button" key={c[0]} onClick={() => { setCity(c); setCityQuery(c[0]); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-stone-100 dark:hover:bg-white/10"><IoLocationOutline />{c[0]}, Nepal</button>)}</div>}
              </div>
              <div className="mt-3 h-56 overflow-hidden rounded-2xl border border-stone-200 dark:border-white/10"><iframe title="Nepal city map" src={mapUrl} className="w-full h-full grayscale-[.35] dark:invert-[.88] dark:hue-rotate-180" /></div>
            </div>
          </div>
        </section>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 font-semibold text-white hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900"><IoCheckmarkCircleOutline />{saving ? "Creating…" : "Create Calendar"}</button>
      </form>
    </div>
  );
}
