import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useParams } from "react-router-dom";
import { eventService } from "../../services/events";

function GetExploreLogic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();
  const filter = searchParams.get("filter");
  const category = searchParams.get("category");

  const isDetail = !!id;

  const listParams = useMemo(() => {
    const params = {};
    if (category) params.category = category;
    if (filter === "online" || filter === "offline") params.filter = filter;
    return params;
  }, [category, filter]);

  const listQuery = useQuery({
    queryKey: ["explore-events", listParams],
    enabled: !isDetail,
    queryFn: async () => {
      const res = await eventService.list(listParams);
      if (!res.ok) throw new Error(res.error || "Failed to load events");
      return res.data || [];
    },
  });

  const detailQuery = useQuery({
    queryKey: ["event", Number(id)],
    enabled: isDetail,
    queryFn: async () => {
      const res = await eventService.getById(id);
      if (!res.ok) throw new Error(res.error || "Failed to load event");
      return res.data;
    },
  });

  const listData = listQuery.data || [];
  const events = isDetail ? (detailQuery.data ?? null) : (listQuery.data ?? null);
  const activeQuery = isDetail ? detailQuery : listQuery;

  return {
    loading: activeQuery.isPending,
    error: activeQuery.error?.message ?? null,
    events,
    eventCount: isDetail ? null : listData.length,
    publicEvent: listData.filter((e) => e.privacy === "public"),
    offlineEvent: listData.filter((e) => e.medium === "offline"),
    onlineEvent: listData.filter((e) => e.medium === "online"),
    filter,
    id,
    setSearchParams,
    searchParams,
    getEvents: listQuery.refetch,
    category,
  };
}

export default GetExploreLogic;
