import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import GetExploreLogic from "../../Logic/Explore/getEvents";
import GetDiscoverLogic from "../../Logic/Explore/getDiscover";
import { getRecommendations } from "../../Logic/EventsLogic/recommendedEvent.logic";
import { CategoryIcon, formatCount } from "../../Logic/EventsLogic/categoryIcons";
import { useUser } from "../../context/userContext";
import ExploreEventCard from "../../components/ExploreEventCard";
import Loading from "../../components/Loading";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCloseOutline,
} from "../../components/icons";

const tabs = [
  { key: "all", label: "All Events" },
  { key: "recommended", label: "Recommended" },
  { key: "offline", label: "In-person" },
  { key: "online", label: "Online" },
];

// Turns "Kathmandu Tech Meetups" → "KT" for the avatar fallback.
function initials(name = "") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function Explore() {
  const { events, offlineEvent, onlineEvent, loading, error, setSearchParams, category } =
    GetExploreLogic();
  const { categories, calendars, loading: discoverLoading, toggleFollow } = GetDiscoverLogic();
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const eventsRef = useRef(null);

  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    (async () => {
      let user = null;
      try { user = JSON.parse(localStorage.getItem("Mahotsav-user")); } catch {}
      if (!user?.id) return;
      setRecommendedEvents(await getRecommendations(user.id));
    })();
  }, []);

  // ── Smart multi-field search ──────────────────────────────────────
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let result = [...events];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const terms = query.split(/\s+/);
      result = result.filter((event) => {
        const text = [event.title, event.description, event.category, event.medium, event.language]
          .filter(Boolean).join(" ").toLowerCase();
        return terms.every((t) => text.includes(t));
      });
    }
    if (searchLocation.trim()) {
      const loc = searchLocation.toLowerCase().trim();
      result = result.filter((e) =>
        loc.split(/\s+/).some((w) => (e.location_name || "").toLowerCase().includes(w)));
    }
    if (dateRange.from || dateRange.to) {
      result = result.filter((e) => {
        if (!e.start_date) return false;
        const d = new Date(e.start_date);
        const from = dateRange.from ? new Date(dateRange.from) : null;
        const to = dateRange.to ? new Date(dateRange.to + "T23:59:59") : null;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    return result;
  }, [events, searchQuery, searchLocation, dateRange]);

  const hasActiveFilters = searchQuery || searchLocation || dateRange.from || dateRange.to;

  const clearFilters = () => {
    setSearchQuery(""); setSearchLocation(""); setDateRange({ from: "", to: "" });
  };

  const tabEvents = useMemo(() => {
    if (hasActiveFilters) return filteredEvents;
    switch (activeTab) {
      case "recommended": return recommendedEvents;
      case "offline": return offlineEvent || [];
      case "online": return onlineEvent || [];
      default: return events || [];
    }
  }, [activeTab, events, offlineEvent, onlineEvent, recommendedEvents, filteredEvents, hasActiveFilters]);

  const selectCategory = (label) => {
    setSearchParams(category === label ? {} : { category: label });
    eventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFollow = async (cal) => {
    if (!userInfo?.id) {
      toast.error("Please log in to follow calendars");
      return navigate("/auth/login");
    }
    const res = await toggleFollow(cal);
    if (res && !res.ok) toast.error(res.error || "Something went wrong");
  };

  return (
    <section className="min-h-screen bg-stone-50 dark:bg-[#0a0a0b]">
      <div className="container py-10 md:py-14">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white">Discover Events</h1>
          <p className="text-sm md:text-base text-stone-500 dark:text-white/50 mt-2">
            Explore popular events near you, browse by category, or follow some of the great
            community calendars.
          </p>
        </header>

        {/* ── Browse by Category ─────────────────────────────────── */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-secondary dark:text-white mb-4">Browse by Category</h2>
          {discoverLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[74px] rounded-xl bg-stone-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const active = category === cat.label;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.label)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                      active
                        ? "border-stone-400 bg-stone-100 dark:border-white/25 dark:bg-white/10 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    <span
                      className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}1a`, color: cat.color || "#059669" }}
                    >
                      <CategoryIcon icon={cat.icon} className="text-xl" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-secondary dark:text-white truncate">
                        {cat.label}
                      </span>
                      <span className="block text-xs text-stone-400 dark:text-white/40 mt-0.5">
                        {formatCount(cat.event_count)}{" "}
                        {Number(cat.event_count) === 1 ? "Event" : "Events"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Featured Calendars ─────────────────────────────────── */}
        {(discoverLoading || calendars.length > 0) && (
          <div className="mt-12 pt-10 border-t border-stone-200 dark:border-white/10">
            <h2 className="text-xl font-bold text-secondary dark:text-white mb-4">Featured Calendars</h2>
            {discoverLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[168px] rounded-xl bg-stone-100 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendars.map((cal) => (
                  <Link
                    key={cal.id}
                    to={`/calendar/${cal.id}`}
                    className="block p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden"
                        style={{ backgroundColor: cal.color || "#059669" }}
                      >
                        {cal.avatar ? (
                          <img src={cal.avatar} alt={cal.name} className="w-full h-full object-cover" />
                        ) : (
                          initials(cal.name)
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleFollow(cal);
                        }}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all ${
                          cal.is_following
                            ? "bg-stone-900 text-white hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                        }`}
                      >
                        {cal.is_following ? "Following" : "Follow"}
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-secondary dark:text-white mt-3.5">{cal.name}</h3>
                    <p className="text-xs text-stone-500 dark:text-white/50 mt-1 line-clamp-2 leading-relaxed">
                      {cal.description}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-white/40 mt-2.5">
                      {formatCount(cal.follower_count)}{" "}
                      {Number(cal.follower_count) === 1 ? "follower" : "followers"}
                      {" · "}
                      {formatCount(cal.event_count)}{" "}
                      {Number(cal.event_count) === 1 ? "event" : "events"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Events ─────────────────────────────────────────────── */}
        <div ref={eventsRef} className="mt-12 pt-10 border-t border-stone-200 dark:border-white/10 scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-secondary dark:text-white">
              {category ? `${category} Events` : "Popular Events"}
            </h2>
            {category && (
              <button
                onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-1.5 self-start text-xs text-stone-500 dark:text-white/50 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <IoCloseOutline className="text-sm" /> Clear category
              </button>
            )}
          </div>

          {/* Search row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] gap-2.5 mb-5">
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2.5 focus-within:border-stone-400 dark:focus-within:border-white/25 transition-colors">
              <IoSearchOutline className="text-stone-400 dark:text-white/40 shrink-0 text-sm" />
              <input
                type="text" placeholder="Search events..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-stone-800 placeholder:text-stone-400 dark:text-white dark:placeholder:text-white/40"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2.5 focus-within:border-stone-400 dark:focus-within:border-white/25 transition-colors">
              <IoLocationOutline className="text-stone-400 dark:text-white/40 shrink-0 text-sm" />
              <input
                type="text" placeholder="Location..."
                value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-stone-800 placeholder:text-stone-400 dark:text-white dark:placeholder:text-white/40"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2.5">
              <IoCalendarOutline className="text-stone-400 dark:text-white/40 shrink-0 text-sm" />
              <input
                type="date" value={dateRange.from}
                onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
                className="w-full bg-transparent text-sm outline-none text-stone-600 dark:text-white/70 dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 rounded-lg px-3 py-2.5">
              <IoCalendarOutline className="text-stone-400 dark:text-white/40 shrink-0 text-sm" />
              <input
                type="date" value={dateRange.to}
                onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
                className="w-full bg-transparent text-sm outline-none text-stone-600 dark:text-white/70 dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Tabs */}
          {!hasActiveFilters && (
            <div className="flex items-center gap-1 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                      : "text-stone-500 hover:bg-stone-100 dark:text-white/50 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                  {tab.key === "recommended" && recommendedEvents.length > 0 && (
                    <span className="ml-1.5 text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">
                      {recommendedEvents.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-stone-100 border border-stone-200 dark:bg-white/5 dark:border-white/10 rounded-lg">
              <IoSearchOutline className="text-stone-500 dark:text-white/50 text-sm" />
              <p className="text-xs text-stone-600 dark:text-white/60">
                Showing <span className="font-bold text-stone-900 dark:text-white">{filteredEvents.length}</span> filtered results
              </p>
              <button onClick={clearFilters} className="ml-auto text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                <IoCloseOutline className="text-base" />
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-sm text-red-500 dark:text-red-400 p-8 text-center bg-red-50 dark:bg-red-500/10 rounded-xl">{error}</div>
          ) : tabEvents?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {tabEvents.map((event) => (
                <ExploreEventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <IoSearchOutline className="text-2xl text-stone-300 dark:text-white/30" />
              </div>
              <p className="text-sm font-medium text-stone-500 dark:text-white/70">No events found</p>
              <p className="text-xs text-stone-400 dark:text-white/40 mt-1">
                {hasActiveFilters ? "Try adjusting your filters" : "Check back later for new events"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Explore;
