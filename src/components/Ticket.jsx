import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loading from "./Loading";
import Barcode from "../assets/images/barcode.png";
import { RiDownloadFill } from "./icons";
import { exportComponentAsPNG } from "react-component-export-image";
import { resolveImage } from "../lib/resolveImage";
import { rsvpService } from "../services/rsvps";

function mapRsvpToEvent(rsvp) {
  if (!rsvp) return null;
  return {
    id: rsvp.event_id,
    title: rsvp.event_title,
    start_date: rsvp.event_start_date,
    location_name: rsvp.event_location_name,
    image: rsvp.event_image,
  };
}

function Ticket({ text, event }) {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef(null);
  const eventId = searchParams.get("eventId");
  const memberId = searchParams.get("memberId");

  const ticketQuery = useQuery({
    queryKey: ["rsvps", "mine", "ticket", eventId],
    enabled: !event && !text && !!eventId,
    queryFn: async () => {
      const res = await rsvpService.listMine();
      if (!res.ok) throw new Error(res.error || "Failed to load ticket");
      return (res.data || []).find((rsvp) => String(rsvp.event_id) === String(eventId)) || null;
    },
  });

  const rsvp = ticketQuery.data;
  const ticketEvent = event || mapRsvpToEvent(rsvp);
  const ticketText =
    text ||
    (eventId && memberId
      ? `${window.location.origin}/mark-attendance?eventId=${eventId}&memberId=${memberId}`
      : "");

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketText)}`;

  const download = (e) => {
    e?.preventDefault();
    exportComponentAsPNG(ticketRef, { fileName: `ticket.png` });
  };

  useEffect(() => {
    if (!ticketText) return;
    const img = new Image();
    img.src = qrUrl;
    img.onload = () => {
      setLoading(false);
      download();
    };
    img.onerror = () => setLoading(false);
  }, [qrUrl, ticketText]);

  if ((!event && !text && ticketQuery.isPending) || (loading && ticketText)) return <Loading />;

  if (!ticketText || (!event && !rsvp)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-stone-50">
        <h1 className="text-lg font-bold text-stone-800">Ticket not available</h1>
        <p className="text-sm text-stone-500 max-w-sm">
          Approved RSVP tickets include a check-in QR code. Open an approved RSVP to download yours.
        </p>
        <Link to="/my-rsvps" className="text-sm font-semibold text-primary hover:underline">
          Back to My RSVPs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <section
        id="ticket"
        ref={ticketRef}
        className="flex items-center justify-between font-geist text-black w-[1024px] h-[400px] m-10 drop-shadow-xl"
        style={{ boxSizing: "border-box" }}
      >
        <div className="rounded-l-[18px] bg-primary p-2 h-full text-white flex items-center justify-center">
          <img alt="Barcode" src={Barcode} className="w-full h-[80%] object-contain m-auto" />
        </div>
        <div
          className="col-span-4 relative bg-slate-200 w-full h-full border-l-[3px] border-r-[3px] border-spacing-2 border-dashed border-l-primary border-r-secondary"
          style={{
            backgroundImage: `url(${resolveImage(ticketEvent?.image)})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="grid grid-cols-2 absolute bottom-0 w-full left-0 bg-accent p-4 text-white">
            <h1>Event Name: {ticketEvent?.title}</h1>
            <h2>
              Event Date:{" "}
              {new Date(ticketEvent?.start_date).toDateString()}
            </h2>
            <h3>
              Event Time:{" "}
              {new Date(ticketEvent?.start_date).toTimeString().slice(0, 5)}
            </h3>
            <h4>Event Location: {ticketEvent?.location_name}</h4>
          </div>
        </div>
        <div className="p-16 h-full flex flex-col items-center justify-center gap-4 rounded-r-[18px] bg-secondary">
          <img
            alt="QR Code"
            src={qrUrl}
            className="m-0 outline-dashed outline-1 outline-neutral-300 outline-offset-8"
          />
          <p className="font-bold uppercase text-white">Admit One</p>
        </div>
      </section>
      <button className="primary-btn" onClick={download}>
        <RiDownloadFill /> Download
      </button>
    </div>
  );
}

export default Ticket;
