import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Ticket from "../components/Ticket";
import { useNotifications } from "../context/notificationContext";
import { eventService } from "../services/events";
import { memberService } from "../services/members";
import { resolveImage } from "../lib/resolveImage";

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { sendNotification } = useNotifications();

  const memberId = searchParams.get("memberId");
  const token = searchParams.get("token");

  const [accepting, setAccepting] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    const getEventById = async () => {
      setLoading(true);
      const res = await eventService.getById(eventId);
      if (res.ok) setEvent(res.data);
      setLoading(false);
    };
    if (eventId && token) getEventById();
  }, [eventId, token]);

  const acceptInvite = async (e) => {
    e?.preventDefault();
    setAccepting(true);
    const res = await memberService.acceptInvite(token);
    if (res.ok) {
      toast.success("Invitation accepted successfully!");
      await sendNotification({
        message: `A member accepted your invitation to ${event?.title}!`,
        user_id: event?.created_by,
        type: "INVITE_ACCEPTED",
      });
      if (event?.medium === "online") navigate("/");
      else {
        setShowTicket(true);
        toast.success("Your ticket is ready!");
      }
    } else {
      toast.error(res.error);
    }
    setAccepting(false);
  };

  if (loading) return <Loading />;

  if (event)
    return (
      <div className="h-screen w-screen relative bg-black">
        <img alt="event" src={resolveImage(event?.image)} className="w-full h-full opacity-50 object-cover" />
        {showTicket ? (
          <div className="fixed inset-0 w-full h-full my-auto">
            <Ticket
              show={showTicket}
              text={`${import.meta.env.VITE_WEBSITE_URL}/mark-attendance?eventId=${event?.id}&memberId=${memberId}`}
              event={event}
            />
            <p className="text-lg text-center text-white">We recommend downloading the ticket now.<br/>The QR Code will be scanned to mark attendance on the day of the event.</p>
          </div>
        ) : (
          <div className="fixed overflow-auto left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] flex flex-col gap-4 items-center text-center justify-center p-8 rounded-[18px] bg-white text-black">
            <h2 className="page-title">Wohoho! You have an invitation for attending {event?.title}!</h2>
            <p>Do you want to accept it?</p>
            <Button text={"Accept Invitation"} style="my-2" cb={acceptInvite} loading={accepting} />
          </div>
        )}
      </div>
    );
  return null;
}

export default AcceptInvite;
