import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../../services/categories";
import { calendarService } from "../../services/calendars";

// Fetches the two Discover sections: categories (Browse by Category) and
// featured calendars (Featured Calendars). Exposes an optimistic follow
// toggle that updates the follower count locally before the request resolves.
export default function GetDiscoverLogic() {
  const queryClient = useQueryClient();
  const calendarsKey = ["calendars", { featured: true }];

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.list();
      if (!res.ok) throw new Error(res.error || "Failed to load categories");
      return res.data || [];
    },
  });

  const calendarsQuery = useQuery({
    queryKey: calendarsKey,
    queryFn: async () => {
      const res = await calendarService.list({ featured: true });
      if (!res.ok) throw new Error(res.error || "Failed to load calendars");
      return res.data || [];
    },
  });

  const followMutation = useMutation({
    mutationFn: async (cal) => {
      const next = !cal.is_following;
      const res = next
        ? await calendarService.follow(cal.id)
        : await calendarService.unfollow(cal.id);
      if (!res.ok) throw new Error(res.error || "Failed to update follow");
      return res;
    },
    onMutate: async (cal) => {
      const next = !cal.is_following;
      await queryClient.cancelQueries({ queryKey: calendarsKey });
      const prev = queryClient.getQueryData(calendarsKey);
      queryClient.setQueryData(calendarsKey, (list) =>
        (list || []).map((c) =>
          c.id === cal.id
            ? { ...c, is_following: next, follower_count: Number(c.follower_count) + (next ? 1 : -1) }
            : c
        )
      );
      return { prev };
    },
    onError: (_err, _cal, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(calendarsKey, ctx.prev);
    },
  });

  const toggleFollow = async (cal) => {
    try {
      return await followMutation.mutateAsync(cal);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  return {
    categories: categoriesQuery.data || [],
    calendars: calendarsQuery.data || [],
    loading: categoriesQuery.isPending || calendarsQuery.isPending,
    toggleFollow,
  };
}
