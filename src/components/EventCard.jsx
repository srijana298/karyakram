import React from "react";
import { IoLocation, IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { MdComputer } from "react-icons/md";

const EventCard = ({
  event: { title, description, category, image, location_name, id, medium, start_date, end_date },
}) => {
  return (
    <Link
      to={`/dashboard/event/${id}`}
      className="bg-white overflow-hidden text-black rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group border border-stone-100"
    >
      <div className="relative overflow-hidden">
        <img
          alt="event"
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
        />
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-lg">
          {category}
        </span>
        <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 px-2 rounded-lg inline-flex items-center gap-1 text-xs">
          {medium === "offline" ? <IoLocation className="text-xs" /> : <MdComputer className="text-xs" />}
        </span>
      </div>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-secondary line-clamp-1">{title}</p>
            <p className="text-xs text-stone-400 line-clamp-2 mt-1">{description}</p>
          </div>
          <div className="flex md:flex-col gap-1 items-center md:items-end text-xs text-stone-400 shrink-0">
            <p className="font-medium text-secondary">{new Date(start_date).toTimeString().slice(0, 5)}</p>
            <p>{new Date(start_date).toDateString().slice(4)}</p>
            {end_date && (
              <>
                <hr className="w-4 md:w-full border-stone-200" />
                <p className="font-medium text-secondary">{new Date(end_date).toTimeString().slice(0, 5)}</p>
                <p>{new Date(end_date).toDateString().slice(4)}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
