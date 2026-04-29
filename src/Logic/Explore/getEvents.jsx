import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { eventService } from "../../services/events";

function GetExploreLogic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();
  const filter = searchParams.get("filter");
  const category = searchParams.get("category");
  const [events, setEvents] = useState(null);
  const [eventCount, setEventCount] = useState(null);
  const [publicEvent, setPublicEvent] = useState(null);
  const [offlineEvent, setOfflineEvent] = useState(null);
  const [onlineEvent, setOnlineEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEvents = useCallback(async () => {
    setError(null);
    setLoading(true);

    const params = {};
    if (category) params.category = category;
    if (filter === "online" || filter === "offline") params.filter = filter;

    const res = await eventService.list(params);
    if (res.ok) {
      setEvents(res.data);
      setEventCount(res.data.length);
      setPublicEvent(res.data.filter((e) => e.privacy === "public"));
      setOfflineEvent(res.data.filter((e) => e.medium === "offline"));
      setOnlineEvent(res.data.filter((e) => e.medium === "online"));
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [searchParams]);

  const getEventById = useCallback(async () => {
    setLoading(true);
    const res = await eventService.getById(id);
    if (res.ok) {
      setEvents(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) getEventById();
    else getEvents();
  }, [getEvents, getEventById, id]);

  return {
    loading,
    error,
    events,
    eventCount,
    publicEvent,
    offlineEvent,
    onlineEvent,
    filter,
    id,
    setSearchParams,
    searchParams,
    getEvents,
    category,
  };
}

export default GetExploreLogic;
