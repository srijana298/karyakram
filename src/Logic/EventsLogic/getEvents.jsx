import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { eventService } from "../../services/events";

function GetEventLogic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id, code } = useParams();
  const { pathname } = useLocation();
  const filter = searchParams.get("filter");

  const isDetail = !!(id || code);

  const listParams = useMemo(() => {
    const params = { mine: "true" };
    if (filter && filter !== "total") {
      if (filter === "private" || filter === "public") params.privacy = filter;
      if (filter === "offline" || filter === "online") params.medium = filter;
    }
    return params;
  }, [filter]);

  const listQuery = useQuery({
    queryKey: ["events", { scope: "mine", ...listParams }],
    enabled: !isDetail,
    queryFn: async () => {
      const res = await eventService.list(listParams);
      if (!res.ok) throw new Error(res.error || "Failed to load events");
      return res.data || [];
    },
  });

  const detailQuery = useQuery({
    queryKey: id ? ["event", Number(id)] : ["event-code", code],
    enabled: isDetail,
    queryFn: async () => {
      const res = id ? await eventService.getById(id) : await eventService.resolveCode(code);
      if (!res.ok) {
        toast.error(res.error);
        throw new Error(res.error || "Failed to load event");
      }
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
    privateEvent: listData.filter((e) => e.privacy === "private"),
    publicEvent: listData.filter((e) => e.privacy === "public"),
    offlineEvent: listData.filter((e) => e.medium === "offline"),
    onlineEvent: listData.filter((e) => e.medium === "online"),
    filter,
    id,
    setSearchParams,
    searchParams,
    getEvents: listQuery.refetch,
  };
}

export default GetEventLogic;
