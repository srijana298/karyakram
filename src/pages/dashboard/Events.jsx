import React, { useEffect, useState } from "react";
import GetEventLogic from "../../Logic/EventsLogic/getEvents";
import EventCard from "../../components/EventCard";
import Loading from "../../components/Loading";
import { IoSearchOutline } from "react-icons/io5";

function Events() {
  const {
    loading,
    error,
    events,
    privateEvent,
    publicEvent,
    offlineEvent,
    onlineEvent,
    filter,
    searchParams,
    setSearchParams,
  } = GetEventLogic();

  const [filteredEvents, setFilteredEvents] = useState(null);

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "total") {
      setFilteredEvents((prev) => events);
    } else if (filter === "private") {
      setFilteredEvents((prev) => privateEvent);
    } else if (filter === "public") {
      setFilteredEvents((prev) => publicEvent);
    } else if (filter === "offline") {
      setFilteredEvents((prev) => offlineEvent);
    } else if (filter === "online") {
      setFilteredEvents((prev) => onlineEvent);
    }
  }, [events, searchParams]);

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Main Menu <span className="px-2">/</span> Events
      </div>
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <IoSearchOutline className="text-neutral-400 text-base shrink-0" />
        <input
          onChange={(e) => {
            e?.preventDefault();
            setFilteredEvents((prev) =>
              events?.filter(
                (event) =>
                  event?.title
                    ?.toLowerCase()
                    .includes(e.target.value?.toLowerCase() ?? "") &&
                  (filter === "total" ? true : (event.medium === filter || event.privacy === filter))
              )
            );
          }}
          type="text"
          placeholder="Search events..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
        />
        <select
          defaultValue={filter}
          onChange={(e) => {
            e?.preventDefault();
            setSearchParams({ filter: e.target.value });
          }}
          className="text-sm bg-transparent outline-none border-l border-gray-200 pl-3 text-dashboard-muted"
        >
          <option value="total">Total</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid lg:grid-cols-3 gap-4">
            {!loading && filteredEvents?.length > 0 ? (
              filteredEvents?.map((event, index) => (
                <EventCard key={index} event={event} />
              ))
            ) : (
              <p className="text-sm text-dashboard-muted">No events found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
