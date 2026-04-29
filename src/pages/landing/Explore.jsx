import React, { useEffect, useState, useMemo } from "react";
import GetExploreLogic from "../../Logic/Explore/getEvents";
import EventCarousel from "../../components/EventCarousel";
import Loading from "../../components/Loading";
import { getRecommendations } from "../../Logic/EventsLogic/recommendedEvent.logic";
import { categories } from "../../Logic/EventsLogic/categories";
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoSearchOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";

function Explore() {
  const { events, offlineEvent, onlineEvent, loading, error, setSearchParams, category } = GetExploreLogic();
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  // Smart search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

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

    // 1. Text search across title, description, category
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

        // Every search term must match at least one field (AND logic between terms)
        return terms.every((term) => searchText.includes(term));
      });

      // Relevance scoring: title matches rank higher
      result.sort((a, b) => {
        const aTitle = (a.title || "").toLowerCase();
        const bTitle = (b.title || "").toLowerCase();
        const aScore = aTitle.includes(query) ? 2 : 0;
        const bScore = bTitle.includes(query) ? 2 : 0;
        return bScore - aScore;
      });
    }

    // 2. Location filter (fuzzy match on location_name)
    if (searchLocation.trim()) {
      const loc = searchLocation.toLowerCase().trim();
      result = result.filter((event) => {
        const eventLoc = (event.location_name || "").toLowerCase();
        // Match if any word in search appears in location
        return loc.split(/\s+/).some((word) => eventLoc.includes(word));
      });
    }

    // 3. Date range filter
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

  if (loading) return <Loading />;

  return (
    <section className="container py-8 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-secondary">
        Explore events happening around you
      </h1>

      {/* Category pills */}
      <div className="flex gap-2 mt-6 mb-6 items-center overflow-auto text-stone-500">
        {[{ label: "All" }, ...categories]?.map((item, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              if (item?.label === "All") setSearchParams({});
              else setSearchParams({ category: item?.label });
            }}
            className={`text-sm whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${
              (category === item.label || (item.label === "All" && !category))
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {item?.label}
          </button>
        ))}
      </div>

      {/* Smart Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-8 shadow-sm">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text search */}
          <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoSearchOutline className="text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Search events, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Location search */}
          <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoLocationOutline className="text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Date from */}
          <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoCalendarOutline className="text-stone-400 shrink-0" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none text-stone-600"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-2 border border-stone-200 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoCalendarOutline className="text-stone-400 shrink-0" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              className="w-full bg-transparent text-sm outline-none text-stone-600"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              Found <span className="font-bold text-secondary">{filteredEvents.length}</span> events
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-primary transition-colors"
            >
              <IoCloseCircleOutline className="text-sm" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : (
        <>
          {/* Search results (when filters are active) */}
          {hasActiveFilters ? (
            filteredEvents.length > 0 ? (
              <EventCarousel events={filteredEvents} title={"Search Results"} />
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <IoSearchOutline className="text-2xl text-stone-400" />
                </div>
                <p className="text-sm text-stone-500">No events match your search criteria</p>
                <p className="text-xs text-stone-400 mt-1">Try adjusting your filters</p>
              </div>
            )
          ) : (
            <>
              {recommendedEvents.length > 0 && <EventCarousel events={recommendedEvents} title={"Recommended"} />}
              {events?.length > 0 ? <EventCarousel events={events} title={"All"} /> : <div>No events found</div>}
              {offlineEvent?.length > 0 && <EventCarousel events={offlineEvent} title={"Offline"} />}
              {onlineEvent?.length > 0 && <EventCarousel events={onlineEvent} title={"Online"} />}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default Explore;
