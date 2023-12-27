import React from "react";
import { useEffect, useState } from "react";
import { Databases } from "appwrite";
import client from "../../appwrite.config";
import GetExporeLogic from "../../Logic/Explore/getEvents";
import EventCarousel from "../../components/EventCarousel";
import Loading from "../../components/Loading";
import { getRecommendations } from "../../Logic/EventsLogic/recommendedEvent.logic";
import { categories } from "../../Logic/EventsLogic/categories";

function Explore() {
  console.log("running the component");
  const {
    events,
    offlineEvent,
    onlineEvent,
    loading,
    error,
    setSearchParams,
    category,
  } = GetExporeLogic();
  useEffect(() => {
    handleRecommendations();
  }, []);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  if (loading) return <Loading />;
  const database = new Databases(client);
  const handleRecommendations = async () => {
    const response = await getRecommendations("65283f9801797f0a3d52");
    for (const res of response) {
      const event = await database.getDocument(
        process.env.REACT_APP_DATABASE_ID,
        process.env.REACT_APP_EVENTS_COLLECTION_ID,
        res
      );
      setRecommendedEvents((prev) => [...prev, event]);
    }
  };
  return (
    <section className="container py-4 md:py-16">
      <h1 className="pb-12 text-4xl font-bold">
        Explore the best events happening around you
      </h1>
      <div className="flex gap-4 mb-8 items-center overflow-auto text-neutral-500">
        {[{ label: "All" }, ...categories]?.map((item, index) => (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (item?.label === "All") setSearchParams((prev) => ({}));
              else
                setSearchParams((prev) => ({ ...prev, category: item?.label }));
            }}
            className={`text-sm ${
              (category === item.label || item.label === "All") &&
              "text-primary"
            }`}
          >
            {item?.label}
          </button>
        ))}
      </div>
      {error ? (
        <div>{error}</div>
      ) : (
        <>
          {recommendedEvents.length > 0 && (
            <EventCarousel events={recommendedEvents} title={"Recommended "} />
          )}
          {events?.length > 0 ? (
            <EventCarousel events={events} title={"All"} />
          ) : (
            <div>No events found</div>
          )}
          {offlineEvent?.length > 0 && (
            <EventCarousel events={offlineEvent} title={"Offline"} />
          )}
          {onlineEvent?.length > 0 && (
            <EventCarousel events={onlineEvent} title={"Online"} />
          )}
        </>
      )}
    </section>
  );
}

export default Explore;
