import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { eventService } from "../../services/events";
import Loading from "../../components/Loading";

// Resolves a short share code (/<code>) to its event and forwards to the
// canonical event page.
function ShortLink() {
  const { code } = useParams();
  const navigate = useNavigate();

  const { data, isError } = useQuery({
    queryKey: ["event-code", code],
    enabled: !!code,
    queryFn: async () => {
      const res = await eventService.resolveCode(code);
      if (!res.ok) throw new Error(res.error || "Event not found");
      return res.data;
    },
  });

  useEffect(() => {
    if (data?.id) navigate(`/event/${data.id}`, { replace: true });
  }, [data, navigate]);

  const notFound = isError || (data !== undefined && !data?.id);

  if (!notFound) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0b] text-center px-6">
      <p className="text-5xl font-bold text-stone-300 dark:text-white/20">404</p>
      <p className="mt-3 text-sm font-medium text-stone-600 dark:text-white/70">This link doesn't lead anywhere</p>
      <p className="text-xs text-stone-400 dark:text-white/40 mt-1">The event may have been removed or the link is wrong.</p>
      <Link to="/explore" className="mt-5 text-sm font-semibold text-primary hover:underline">Discover events</Link>
    </div>
  );
}

export default ShortLink;
