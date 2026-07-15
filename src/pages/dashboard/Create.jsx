import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import CreateEventLogic from "../../Logic/EventsLogic/createEvent.logic";
import LocationInput from "../../components/LocationInput";
import DateTimePicker from "../../components/DateTimePicker";
import Loading from "../../components/Loading";
import { calendarService } from "../../services/calendars";
import { categoryService } from "../../services/categories";
import { Switch } from "@/components/ui/switch";
import {
  IoChevronBackOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoCalendarClearOutline,
  IoLocationOutline,
  IoReorderThreeOutline,
  IoTicketOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoShuffleOutline,
  IoImageOutline,
  IoPencil,
  IoCloseOutline,
  IoPricetagOutline,
} from "../../components/icons";
import { MdComputer, MdLocationPin } from "../../components/icons";

const THEMES = [
  { name: "Minimal", css: "linear-gradient(135deg,#64748b,#334155)" },
  { name: "Sunset", css: "linear-gradient(135deg,#f97316,#db2777,#7c3aed)" },
  { name: "Emerald", css: "linear-gradient(135deg,#10b981,#059669,#065f46)" },
  { name: "Ocean", css: "linear-gradient(135deg,#0ea5e9,#6366f1,#8b5cf6)" },
  { name: "Warm", css: "linear-gradient(135deg,#f59e0b,#ef4444,#ec4899)" },
];

// Shared theme-aware class fragments.
const card = "rounded-2xl border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.03]";
const label = "text-sm font-medium text-stone-800 dark:text-white";
const muted = "text-stone-400 dark:text-white/40";
const inputField = "bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30 focus:border-primary/40 dark:focus:border-white/25";
// Applies input styling to the inner <input> of composed components.
const inputScope = "[&_input]:!bg-white [&_input]:!border-stone-200 [&_input]:!text-stone-900 dark:[&_input]:!bg-white/5 dark:[&_input]:!border-white/10 dark:[&_input]:!text-white";

function Toggle({ checked, onChange }) {
  return <Switch checked={checked} onCheckedChange={onChange} aria-label="Toggle option" />;
}

function Create() {
  const { fields, signingin, handleImage, imagePreview, fileRef, handleCreateEvent, removeImage, id, fetchingDoc } = CreateEventLogic();

  const [themeIdx, setThemeIdx] = useState(0);
  const [showLocation, setShowLocation] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [dateError, setDateError] = useState("");

  const { data: calendars = [] } = useQuery({
    queryKey: ["calendars", { mine: true }],
    queryFn: async () => {
      const res = await calendarService.list({ mine: "true" });
      if (!res.ok) throw new Error(res.error || "Failed to load calendars");
      return res.data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.list();
      if (!res.ok) throw new Error(res.error || "Failed to load categories");
      return res.data || [];
    },
  });

  useEffect(() => {
    if (fields.location || fields.meetLink) setShowLocation(true);
    if (fields.description) setShowDescription(true);
  }, [fields.location, fields.meetLink, fields.description]);

  const theme = THEMES[themeIdx];
  const pageTitle = id ? "Save Changes" : "Create Event";

  const onSubmit = (e) => {
    e.preventDefault();
    if (fields.endDate && fields.startDate && dayjs(fields.endDate).isBefore(dayjs(fields.startDate))) {
      setDateError("End must be after start");
      return;
    }
    setDateError("");
    handleCreateEvent(e);
  };

  if (fetchingDoc) return <Loading />;

  return (
    <div className="w-full max-w-none">
      <Link to="/dashboard/events?filter=total" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white transition-colors mb-5">
        <IoChevronBackOutline className="text-base" /> Back
      </Link>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] gap-6 lg:gap-8 w-full">
        {/* Left: image tile + theme */}
        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-white/10 shadow-sm" style={!imagePreview ? { backgroundImage: theme.css } : undefined}>
            {imagePreview ? (
              <img src={imagePreview} alt="event" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/90">
                <IoImageOutline className="text-4xl mb-2 drop-shadow" />
                <span className="text-sm font-medium drop-shadow">Add a poster</span>
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-stone-900 shadow-md flex items-center justify-center hover:scale-105 transition-transform" title="Upload image">
              <IoImageOutline className="text-lg" />
            </button>
            {imagePreview && (
              <button type="button" onClick={removeImage} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors" title="Remove image">
                <IoCloseOutline />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center gap-3 px-3 py-2.5 ${card}`}>
              <span className="w-9 h-9 rounded-lg shrink-0 border border-stone-200 dark:border-white/10" style={{ backgroundImage: theme.css }} />
              <div className="leading-tight">
                <p className={`text-[11px] ${muted}`}>Theme</p>
                <p className="text-sm font-semibold text-stone-800 dark:text-white">{theme.name}</p>
              </div>
            </div>
            <button type="button" onClick={() => setThemeIdx((i) => (i + 1) % THEMES.length)} className={`w-12 h-[52px] ${card} flex items-center justify-center text-stone-500 hover:text-primary dark:text-white/60 dark:hover:text-white transition-colors`} title="Shuffle theme">
              <IoShuffleOutline className="text-lg" />
            </button>
          </div>
        </div>

        {/* Right: details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className={`inline-flex items-center gap-2 pl-3 pr-2 py-2 ${card}`}>
              <IoCalendarClearOutline className={`text-sm ${muted}`} />
              <select value={fields.calendarId || ""} onChange={(e) => fields.setCalendarId(e.target.value)} className="text-sm font-medium text-stone-800 dark:text-white bg-transparent outline-none pr-4 cursor-pointer [&>option]:text-stone-900">
                <option value="">Personal Calendar</option>
                {calendars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={`inline-flex items-center gap-2 pl-3 pr-2 py-2 ${card}`}>
              {fields.privacy === "private" ? <IoLockClosedOutline className={`text-sm ${muted}`} /> : <IoGlobeOutline className={`text-sm ${muted}`} />}
              <select value={fields.privacy} onChange={(e) => fields.setPrivacy(e.target.value)} className="text-sm font-medium text-stone-800 dark:text-white bg-transparent outline-none pr-4 cursor-pointer capitalize [&>option]:text-stone-900">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <input type="text" value={fields.title} onChange={(e) => fields.setTitle(e.target.value)} placeholder="Event Name" className="w-full bg-transparent text-3xl md:text-4xl font-bold text-stone-900 dark:text-white placeholder:text-stone-300 dark:placeholder:text-white/25 outline-none" />

          {/* Schedule */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 ${card} p-4 space-y-3`}>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-white shrink-0" />
                <span className={`${label} w-12`}>Start</span>
                <div className={`flex-1 ${inputScope}`}>
                  <DateTimePicker value={fields.startDate} onChange={fields.setStartDate} placeholder="Pick start" required />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-stone-300 dark:border-white/30 shrink-0" />
                <span className={`${label} w-12`}>End</span>
                <div className={`flex-1 ${inputScope}`}>
                  <DateTimePicker value={fields.endDate} onChange={fields.setEndDate} placeholder="Pick end" minDate={fields.startDate || undefined} />
                </div>
              </div>
              {dateError && <p className="text-xs text-red-500 dark:text-red-400 pl-6">{dateError}</p>}
            </div>
            <div className={`sm:w-40 ${card} p-4 flex flex-col justify-center`}>
              <IoGlobeOutline className={`mb-1.5 ${muted}`} />
              <p className="text-sm font-semibold text-stone-800 dark:text-white">GMT+05:45</p>
              <p className={`text-xs ${muted}`}>Kathmandu</p>
            </div>
          </div>

          {/* Location */}
          <div className={`${card} ${showLocation ? "" : "overflow-hidden"}`}>
            {!showLocation ? (
              <button type="button" onClick={() => setShowLocation(true)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                <IoLocationOutline className={`text-lg ${muted}`} />
                <span>
                  <span className={`block ${label}`}>Add Event Location</span>
                  <span className={`block text-xs ${muted}`}>Offline location or virtual link</span>
                </span>
              </button>
            ) : (
              <div className="p-4 space-y-3">
                <div className="inline-flex p-1 bg-stone-100 dark:bg-white/5 rounded-lg text-sm">
                  {[{ key: "offline", label: "In-person", icon: <MdLocationPin /> }, { key: "online", label: "Online", icon: <MdComputer /> }].map((m) => (
                    <button key={m.key} type="button" onClick={() => fields.setMedium(m.key)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${fields.medium === m.key ? "bg-white text-stone-900 shadow-sm dark:bg-white dark:text-stone-900" : "text-stone-500 dark:text-white/60"}`}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
                {fields.medium === "offline" ? (
                  <div className={`${inputScope} [&_input::placeholder]:!text-stone-400 dark:[&_input::placeholder]:!text-white/30`}>
                    <LocationInput value={fields.location} lat={fields.latitude} lng={fields.longitude} onChange={({ location, latitude, longitude }) => { fields.setLocation(location); fields.setLatitude(latitude); fields.setLongitude(longitude); }} placeholder="Search for a venue or address..." />
                  </div>
                ) : (
                  <input type="url" value={fields.meetLink} onChange={(e) => fields.setMeetLink(e.target.value)} placeholder="Virtual meeting link (Zoom, Meet, ...)" className={`w-full h-10 px-3 text-sm rounded-lg outline-none ${inputField}`} />
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className={`${card} overflow-hidden`}>
            {!showDescription ? (
              <button type="button" onClick={() => setShowDescription(true)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                <IoReorderThreeOutline className={`text-lg ${muted}`} />
                <span className={label}>Add Description</span>
              </button>
            ) : (
              <textarea value={fields.description} onChange={(e) => fields.setDescription(e.target.value)} placeholder="What's this event about?" rows={4} className="w-full p-4 text-sm bg-transparent outline-none resize-none text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30" />
            )}
          </div>

          {/* Event Options */}
          <div>
            <p className="text-sm font-semibold text-stone-800 dark:text-white mb-2">Event Options</p>
            <div className={`${card} divide-y divide-stone-100 dark:divide-white/10`}>
              <div className="flex items-center gap-3 p-4">
                <IoTicketOutline className={`text-lg ${muted}`} />
                <span className={`${label} flex-1`}>Ticket Price</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Free</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <IoPricetagOutline className={`text-lg ${muted}`} />
                <span className={`${label} flex-1`}>Category</span>
                <select value={fields.category} onChange={(e) => fields.setCategory(e.target.value)} className="text-sm font-medium text-stone-800 dark:text-white bg-transparent outline-none text-right cursor-pointer max-w-[55%] [&>option]:text-stone-900" required>
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 p-4">
                <IoPersonAddOutline className={`text-lg ${muted}`} />
                <span className={`${label} flex-1`}>
                  Require Approval
                  <span className={`block text-[11px] font-normal ${muted}`}>Guests need your approval to join</span>
                </span>
                <Toggle checked={fields.requireApproval} onChange={fields.setRequireApproval} />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <IoPeopleOutline className={`text-lg ${muted}`} />
                  <span className={`${label} flex-1`}>Admission</span>
                  <div className="inline-flex rounded-lg bg-stone-100 p-1 dark:bg-white/5">
                    {[{ key: "capacity", label: "Capacity" }, { key: "waitlist", label: "Waitlist" }].map((mode) => (
                      <button key={mode.key} type="button" onClick={() => fields.setAdmissionMode(mode.key)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${fields.admissionMode === mode.key ? "bg-white text-stone-900 shadow-sm dark:bg-white/10 dark:text-white" : "text-stone-500 dark:text-white/45"}`}>
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between pl-8">
                  <p className={`text-[11px] ${muted}`}>{fields.admissionMode === "waitlist" ? "Guests join a waitlist for selection when demand exceeds available seats." : "Registration closes automatically when all seats are filled."}</p>
                  {editingCapacity ? (
                    <input type="number" min="1" autoFocus value={fields.maxParticipants || ""} onChange={(e) => fields.setMaxParticipants(e.target.value)} onBlur={() => setEditingCapacity(false)} placeholder="Seats" className={`ml-4 w-24 h-8 px-2 text-sm text-right rounded-lg outline-none ${inputField}`} />
                  ) : (
                    <button type="button" onClick={() => setEditingCapacity(true)} className="ml-4 shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-800 dark:text-white hover:text-primary dark:hover:text-white/70 transition-colors">
                      {Number(fields.maxParticipants) > 0 ? `${fields.maxParticipants} seats` : "Set seats"}
                      <IoPencil className={`text-xs ${muted}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={signingin} className="w-full py-3.5 rounded-2xl font-semibold bg-primary text-white hover:bg-emerald-600 dark:bg-white dark:text-stone-900 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {signingin ? "Processing…" : pageTitle}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Create;
