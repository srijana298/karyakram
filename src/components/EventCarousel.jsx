import React, { useRef } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import ExploreEventCard from "./ExploreEventCard";

function EventCarousel({ events, title }) {
  const swiperRef = useRef(null);

  return (
    <div className="py-6 md:py-10">
      <div className="inline-flex items-center w-full justify-between mb-6">
        <h2 className="text-lg md:text-xl font-bold text-secondary">{title} Events</h2>
        <div className="inline-flex gap-2 items-center">
          <button
            onClick={() => {
              swiperRef.current.swiper.slidePrev();
            }}
            className="w-9 h-9 rounded-full border border-neutral-300 inline-flex items-center justify-center text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <IoArrowBack className="text-sm" />
          </button>
          <button
            onClick={() => {
              swiperRef.current.swiper.slideNext();
            }}
            className="w-9 h-9 rounded-full bg-accent inline-flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <IoArrowForward className="text-sm" />
          </button>
        </div>
      </div>
      <div>
        <Swiper
          className="event-swiper"
          ref={swiperRef}
          modules={[Navigation]}
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            360: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            560: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
            820: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
          }}
        >
          {events?.map((item) => (
            <SwiperSlide key={item.id}>
              <ExploreEventCard {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default EventCarousel;
