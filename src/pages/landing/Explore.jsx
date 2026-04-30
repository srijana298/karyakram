import React, { useEffect, useState, useMemo, useCallback } from "react";
import GetExploreLogic from "../../Logic/Explore/getEvents";
import Loading from "../../components/Loading";
import { getRecommendations } from "../../Logic/EventsLogic/recommendedEvent.logic";
import { categories } from "../../Logic/EventsLogic/categories";
import ExploreEventCard from "../../components/ExploreEventCard";
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoSearchOutline,
  IoCloseCircleOutline,
  IoFunnelOutline,
  IoGridOutline,
  IoSwapVerticalOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoOptionsOutline,
} from "react-icons/io5";
import { MdComputer, MdOutlineWifiOff } from "react-icons/md";

// ── Tab config ──────────────────────────────────────────────────────
const tabs = [
  { key: "all", label: "All Events" },
  { key: "recommended", label: "Recommended" },
  { key: "offline", label: "Offline" },
  { key: "online", label: "Online" },
];

function Explore() {
  const { events, offlineEvent, onlineEvent, loading, error, setSearchParams, category } = GetExploreLogic();
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  // Smart search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [activeTab, setActiveTab] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    handleRecommendations();
  }, []);

  const handleRecommendations = async () => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("Mahotsav-user")); } catch {}
    if (!user?.id) return;
    const recs = await getRecommendations(user.id);
    setRecommendedEvents(recs);
  };

  // ── Smart multi-field search algorithm ──────────────────────────────
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let result = [...events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const terms = query.split(/\s+/);
      result = result.filter((event) => {
        const searchText = [
          event.title || "",
          event.description || "",
          event.category || "",
          event.medium || "",
          event.language || "",
        ].join(" ").toLowerCase();
        return terms.every((term) => searchText.includes(term));
      });
      result.sort((a, b) => {
        const aScore = (a.title || "").toLowerCase().includes(query) ? 2 : 0;
        const bScore = (b.title || "").toLowerCase().includes(query) ? 2 : 0;
        return bScore - aScore;
      });
    }

    if (searchLocation.trim()) {
      const loc = searchLocation.toLowerCase().trim();
      result = result.filter((event) => {
        const eventLoc = (event.location_name || "").toLowerCase();
        return loc.split(/\s+/).some((word) => eventLoc.includes(word));
      });
    }

    if (dateRange.from || dateRange.to) {
      result = result.filter((event) => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date);
        const from = dateRange.from ? new Date(dateRange.from) : null;
        const to = dateRange.to ? new Date(dateRange.to + "T23:59:59") : null;
        if (from && eventDate < from) return false;
        if (to && eventDate > to) return false;
        return true;
      });
    }

    return result;
  }, [events, searchQuery, searchLocation, dateRange]);

  const hasActiveFilters = searchQuery || searchLocation || dateRange.from || dateRange.to;

  const clearFilters = () => {
    setSearchQuery("");
    setSearchLocation("");
    setDateRange({ from: "", to: "" });
  };

  // ── Tab-based event source ───────────────────────────────────────
  const tabEvents = useMemo(() => {
    if (hasActiveFilters) return filteredEvents;
    switch (activeTab) {
      case "recommended": return recommendedEvents.length > 0 ? recommendedEvents : [];
      case "offline": return offlineEvent || [];
      case "online": return onlineEvent || [];
      default: return events || [];
    }
  }, [activeTab, events, offlineEvent, onlineEvent, recommendedEvents, filteredEvents, hasActiveFilters]);

  const resultCount = tabEvents?.length || 0;

  if (loading) return <Loading />;

  // ── Filter Panel (shared between sidebar and mobile sheet) ────────
  const FilterPanel = ({ compact = false }) => (
    <div className="flex flex-col gap-5">
      {/* Categories */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">Categories</h3>
        <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "lg:flex-col"}`}>
          <button
            onClick={() => setSearchParams({})}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              !category
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            All
          </button>
          {categories?.map((item, i) => (
            <button
              key={i}
              onClick={() => setSearchParams({ category: item.label })}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                category === item.label
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search inputs */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">Search</h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoSearchOutline className="text-stone-400 shrink-0 text-sm" />
            <input
              type="text"
              placeholder="Events, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoLocationOutline className="text-stone-400 shrink-0 text-sm" />
            <input
              type="text"
              placeholder="Location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      {/* Date range */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">Date Range</h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoCalendarOutline className="text-stone-400 shrink-0 text-sm" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none text-stone-600"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoCalendarOutline className="text-stone-400 shrink-0 text-sm" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none text-stone-600"
            />
          </div>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-primary transition-colors py-2 border border-stone-200 rounded-lg hover:border-primary/30"
        >
          <IoCloseCircleOutline className="text-sm" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <section className="min-h-screen bg-stone-50">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200/70">
        <div className="container pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Discover</p>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                Explore Events
              </h1>
              <p className="text-sm text-stone-400 mt-1">Find something happening around you</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <IoOptionsOutline className="text-sm" />
                Filters
              </button>
              <p className="text-xs text-stone-400">
                <span className="font-semibold text-secondary">{resultCount}</span>{" "}
                {resultCount === 1 ? "event" : "events"}
              </p>
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 mt-6 -mb-[1px] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm px-4 py-2.5 rounded-t-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-stone-50 text-primary border-t-2 border-x border-primary border-t-primary border-x-stone-200/70"
                    : "text-stone-400 hover:text-stone-600 hover:bg-stone-50/50"
                }`}
              >
                {tab.label}
                {tab.key === "recommended" && recommendedEvents.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-semibold">
                    {recommendedEvents.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: Sidebar + Grid ─────────────────────────────────── */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-6">
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Search active indicator */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg">
                <IoSearchOutline className="text-primary text-sm" />
                <p className="text-xs text-primary/80">
                  Showing <span className="font-bold text-primary">{filteredEvents.length}</span> filtered results
                </p>
                <button onClick={clearFilters} className="ml-auto text-primary/60 hover:text-primary transition-colors">
                  <IoCloseOutline className="text-base" />
                </button>
              </div>
            )}

            {/* Event grid */}
            {error ? (
              <div className="text-sm text-red-500 p-8 text-center bg-red-50 rounded-xl">{error}</div>
            ) : tabEvents?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {tabEvents.map((event) => (
                  <ExploreEventCard key={event.id} {...event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <IoSearchOutline className="text-2xl text-stone-300" />
                </div>
                <p className="text-sm font-medium text-stone-500">No events found</p>
                <p className="text-xs text-stone-400 mt-1">
                  {hasActiveFilters ? "Try adjusting your filters" : "Check back later for new events"}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter sheet ──────────────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Sheet */}
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
              <h2 className="text-sm font-bold text-secondary">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <IoCloseOutline className="text-base" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel compact />
            </div>
            <div className="px-5 py-4 border-t border-stone-200">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full primary-btn justify-center"
              >
                Show {resultCount} {resultCount === 1 ? "event" : "events"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Explore;
