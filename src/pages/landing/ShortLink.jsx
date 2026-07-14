import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { eventService } from "../../services/events";
import Loading from "../../components/Loading";

// Resolves a short share code (/<code>) to its event and forwards to the
// canonical event page.
function ShortLink() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await eventService.resolveCode(code);
      if (!active) return;
      if (res.ok && res.data?.id) navigate(`/event/${res.data.id}`, { replace: true });
      else setNotFound(true);
    })();
    return () => { active = false; };
  }, [code, navigate]);

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
