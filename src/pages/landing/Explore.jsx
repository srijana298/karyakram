import React, { useEffect, useState } from "react";
import GetExploreLogic from "../../Logic/Explore/getEvents";
import EventCarousel from "../../components/EventCarousel";
import Loading from "../../components/Loading";
import { getRecommendations } from "../../Logic/EventsLogic/recommendedEvent.logic";
import { categories } from "../../Logic/EventsLogic/categories";

function Explore() {
  const { events, offlineEvent, onlineEvent, loading, error, setSearchParams, category } = GetExploreLogic();
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  useEffect(() => {
    handleRecommendations();
  }, []);

  const handleRecommendations = async () => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("Karyakram-user")); } catch {}
    if (!user?.id) return;

    const recs = await getRecommendations(user.id);
    setRecommendedEvents(recs);
  };

  if (loading) return <Loading />;

  return (
    <section className="container py-4 md:py-16">
      <h1 className="pb-12 text-4xl font-bold">Explore the best events happening around you</h1>
      <div className="flex gap-4 mb-8 items-center overflow-auto text-neutral-500">
        {[{ label: "All" }, ...categories]?.map((item, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              if (item?.label === "All") setSearchParams({});
              else setSearchParams({ category: item?.label });
            }}
            className={`text-sm ${(category === item.label || item.label === "All") && "text-primary"}`}
          >
            {item?.label}
          </button>
        ))}
      </div>
      {error ? (
        <div>{error}</div>
      ) : (
        <>
          {recommendedEvents.length > 0 && <EventCarousel events={recommendedEvents} title={"Recommended "} />}
          {events?.length > 0 ? <EventCarousel events={events} title={"All"} /> : <div>No events found</div>}
          {offlineEvent?.length > 0 && <EventCarousel events={offlineEvent} title={"Offline"} />}
          {onlineEvent?.length > 0 && <EventCarousel events={onlineEvent} title={"Online"} />}
        </>
      )}
    </section>
  );
}

export default Explore;
