import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { calendarService } from "../../services/calendars";

// Loads a single calendar (with its events, follower count and the current
// user's follow state) for the dedicated calendar page. Exposes an optimistic
// follow toggle mirroring the Discover page behaviour.
export default function GetCalendarLogic() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const queryKey = ["calendar", id];

  const { data: calendar, isPending, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await calendarService.getById(id);
      if (!res.ok) throw new Error(res.error || "Calendar not found");
      return res.data;
    },
  });

  const followMutation = useMutation({
    mutationFn: async (next) => {
      const res = next
        ? await calendarService.follow(calendar.id)
        : await calendarService.unfollow(calendar.id);
      if (!res.ok) throw new Error(res.error || "Failed to update follow");
      return res;
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (c) =>
        c
          ? { ...c, is_following: next, follower_count: Number(c.follower_count) + (next ? 1 : -1) }
          : c
      );
      return { prev };
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
    },
  });

  const toggleFollow = async () => {
    if (!calendar) return { ok: false };
    try {
      return await followMutation.mutateAsync(!calendar.is_following);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  return { calendar: calendar ?? null, loading: isPending, error: error?.message ?? null, toggleFollow };
}
