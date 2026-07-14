import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../../services/categories";
import { calendarService } from "../../services/calendars";

// Fetches the two Discover sections: categories (Browse by Category) and
// featured calendars (Featured Calendars). Exposes an optimistic follow
// toggle that updates the follower count locally before the request resolves.
export default function GetDiscoverLogic() {
  const [categories, setCategories] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [catRes, calRes] = await Promise.all([
      categoryService.list(),
      calendarService.list({ featured: true }),
    ]);
    if (catRes.ok) setCategories(catRes.data || []);
    if (calRes.ok) setCalendars(calRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = useCallback(async (cal) => {
    const next = !cal.is_following;
    // Optimistic update
    setCalendars((prev) =>
      prev.map((c) =>
        c.id === cal.id
          ? { ...c, is_following: next, follower_count: Number(c.follower_count) + (next ? 1 : -1) }
          : c,
      ),
    );
    const res = next
      ? await calendarService.follow(cal.id)
      : await calendarService.unfollow(cal.id);
    // Revert on failure
    if (!res.ok) {
      setCalendars((prev) =>
        prev.map((c) =>
          c.id === cal.id
            ? { ...c, is_following: cal.is_following, follower_count: Number(cal.follower_count) }
            : c,
        ),
      );
    }
    return res;
  }, []);

  return { categories, calendars, loading, toggleFollow };
}
