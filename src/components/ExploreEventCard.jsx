import React from "react";
import { Link } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { MdComputer } from "react-icons/md";
import { resolveImage } from "../lib/resolveImage";

function ExploreEventCard({
  title,
  description,
  category,
  image,
  location_name,
  id,
  medium,
  start_date,
  end_date,
}) {
  const start = new Date(start_date);
  const day = start.getDate();
  const formattedDay = `${day <= 9 ? "0" + day : day}`;
  const month = start.toDateString().slice(4, 7).toUpperCase();

  return (
    <Link to={`/event/${id}`} className="block group">
      <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 hover:border-stone-300 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={resolveImage(image)}
            alt={title}
            className="object-cover w-full aspect-[16/10] group-hover:scale-105 transition-transform duration-500"
          />
          {/* Date badge */}
          <div className="absolute top-2.5 right-2.5 rounded-lg text-xs font-semibold bg-white/90 backdrop-blur-sm p-2 text-center min-w-[42px] shadow-sm">
            <p className="text-sm leading-none text-secondary">{formattedDay}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{month}</p>
          </div>
          {/* Category badge */}
          <div className="absolute bottom-2.5 left-2.5 rounded-lg text-xs bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 shadow-sm font-medium">
            {category}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2">
            {medium && (
              <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                {medium === "offline" ? (
                  <IoLocationOutline className="text-xs" />
                ) : (
                  <MdComputer className="text-xs" />
                )}
                {medium === "offline" ? "In-person" : "Online"}
              </span>
            )}
            {location_name && medium === "offline" && (
              <span className="text-[11px] text-stone-400 truncate max-w-[140px]">
                {location_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ExploreEventCard;
