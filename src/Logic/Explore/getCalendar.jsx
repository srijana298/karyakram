import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { calendarService } from "../../services/calendars";

// Loads a single calendar (with its events, follower count and the current
// user's follow state) for the dedicated calendar page. Exposes an optimistic
// follow toggle mirroring the Discover page behaviour.
export default function GetCalendarLogic() {
  const { id } = useParams();
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await calendarService.getById(id);
    if (res.ok) setCalendar(res.data);
    else setError(res.error || "Calendar not found");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = useCallback(async () => {
    if (!calendar) return { ok: false };
    const next = !calendar.is_following;
    const prev = calendar;
    setCalendar((c) => ({
      ...c,
      is_following: next,
      follower_count: Number(c.follower_count) + (next ? 1 : -1),
    }));
    const res = next
      ? await calendarService.follow(calendar.id)
      : await calendarService.unfollow(calendar.id);
    if (!res.ok) setCalendar(prev); // revert
    return res;
  }, [calendar]);

  return { calendar, loading, error, toggleFollow };
}
