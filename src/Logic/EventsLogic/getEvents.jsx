import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { eventService } from "../../services/events";
import { adminService } from "../../services/admin";

function GetEventLogic() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams();
  const { pathname } = useLocation();
  const filter = searchParams.get("filter");
  const [events, setEvents] = useState(null);
  const [eventCount, setEventCount] = useState(null);
  const [privateEvent, setPrivateEvent] = useState(null);
  const [publicEvent, setPublicEvent] = useState(null);
  const [offlineEvent, setOfflineEvent] = useState(null);
  const [onlineEvent, setOnlineEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEvents = useCallback(async () => {
    setLoading(true);

    // Determine if user is admin from localStorage
    let role = "attendee";
    try {
      const user = JSON.parse(localStorage.getItem("Mahotsav-user"));
      role = user?.role || "attendee";
    } catch {}
    const isAdmin = role === "admin";

    const params = {};
    if (filter && filter !== "total") {
      if (filter === "private" || filter === "public") params.privacy = filter;
      if (filter === "offline" || filter === "online") params.medium = filter;
    }

    let res;
    if (isAdmin) {
      res = await adminService.listEvents(params);
    } else {
      params.mine = "true";
      res = await eventService.list(params);
    }

    if (res.ok) {
      const data = res.data || [];
      setEvents(data);
      setEventCount(data.length);
      setPrivateEvent(data.filter((e) => e.privacy === "private"));
      setPublicEvent(data.filter((e) => e.privacy === "public"));
      setOfflineEvent(data.filter((e) => e.medium === "offline"));
      setOnlineEvent(data.filter((e) => e.medium === "online"));
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [searchParams]);

  const getEventById = useCallback(async () => {
    setLoading(true);
    const res = await eventService.getById(id);
    if (res.ok) {
      if (!pathname.includes("dashboard") && res.data.privacy === "private") {
        setError("This event is private");
        toast.error("This event is private");
        navigate(-1);
      } else {
        setEvents(res.data);
      }
    } else {
      setError(res.error);
      toast.error(res.error);
      navigate(-1);
    }
    setLoading(false);
  }, [id, pathname, navigate]);

  useEffect(() => {
    if (id) getEventById();
    else getEvents();
  }, [getEvents, getEventById, id]);

  return {
    loading,
    error,
    events,
    eventCount,
    privateEvent,
    publicEvent,
    offlineEvent,
    onlineEvent,
    filter,
    id,
    setSearchParams: searchParams.setSearchParams,
    searchParams,
    getEvents,
  };
}

export default GetEventLogic;
