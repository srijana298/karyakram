import React from "react";
import { Link } from "react-router-dom";

function ExploreEventCard({
    title,
    description,
    category,
    image,
    location_name,
    id,
    medium,
    start_date,
    end_date
}) {
    const start = new Date(start_date)
    const day = start.getDate()
    const formattedDay = `${day <= 9 ? '0'+day : day}`
    const month = start.toDateString().slice(4,7).toUpperCase()

  return (
    <Link to={`/event/${id}`} className="w-full block group">
        <div className="relative overflow-hidden rounded-xl">
            <img
                src={image}
                alt={title}
                className="object-cover w-full aspect-video group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 right-2 rounded-lg text-xs font-semibold bg-white/90 backdrop-blur-sm p-2 text-center min-w-[40px] shadow-sm">
                <p className="text-sm leading-none text-secondary">{formattedDay}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{month}</p>
            </div>
            <div className="absolute bottom-2 left-2 rounded-lg text-xs bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 shadow-sm">
                <p>{category}</p>
            </div>
        </div>
        <div className="pt-3 pb-1">
            <h3 className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
        </div>
  </Link>
  );
}

export default ExploreEventCard;
