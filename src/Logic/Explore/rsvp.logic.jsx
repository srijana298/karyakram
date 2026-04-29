import { useState } from "react";
import { toast } from "react-hot-toast";
import { rsvpService } from "../../services/rsvps";
import { useNotifications } from "../../context/notificationContext";

export default function RsvpLogic(event) {
  let token = null;
  try { token = JSON.parse(localStorage.getItem("token")); } catch { token = null; }

  let KaryakramUser = null;
  try { KaryakramUser = JSON.parse(localStorage.getItem("Karyakram-user")); } catch { KaryakramUser = null; }

  const [adding, setAdding] = useState(false);
  const { sendNotification } = useNotifications();

  const checkUserIsOwner = () => {
    if (token && KaryakramUser && event?.created_by === KaryakramUser?.id) {
      return true;
    }
    return false;
  };

  const addRsvp = async (user) => {
    const res = await rsvpService.create(event?.id);
    return res;
  };

  const getRsvp = async (userId) => {
    // Handled server-side in createRsvp (duplicate check)
    return { ok: true, data: [] };
  };

  const approveRsvp = async (rsvpItem) => {
    try {
      const res = await rsvpService.approve(rsvpItem.id || rsvpItem.documentId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      await sendNotification({
        user_id: rsvpItem.user_id || rsvpItem.userId,
        from_user_id: KaryakramUser?.id,
        from_user_name: KaryakramUser?.name,
        type: "RSVP_APPROVED",
        message: `Your RSVP to ${event?.title} has been approved.`,
      });
      toast.success(`RSVP has been approved`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rejectRsvp = async (rsvpItem) => {
    try {
      const res = await rsvpService.reject(rsvpItem.id || rsvpItem.documentId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      await sendNotification({
        user_id: rsvpItem.user_id || rsvpItem.userId,
        from_user_id: KaryakramUser?.id,
        from_user_name: KaryakramUser?.name,
        type: "RSVP_REJECTED",
        message: `Your RSVP to ${event?.title} has been rejected by the owner.`,
      });
      toast.success("RSVP has been rejected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRSVP = async (e) => {
    e.preventDefault();
    if (checkUserIsOwner()) {
      toast.error("You cannot RSVP to your own event");
      return;
    }
    if (!token) {
      toast.error("Please login to RSVP");
      return;
    }
    if (event?.accepting_rsvp === false) {
      toast.error("RSVP for this event is closed");
      return;
    }

    setAdding(true);
    const res = await rsvpService.create(event?.id);

    if (!res.ok) {
      toast.error(res.error);
      setAdding(false);
      return;
    }

    toast.success("RSVP has been sent to the event owner. You will be notified when they approve your request.");
    await sendNotification({
      user_id: event?.created_by,
      from_user_id: KaryakramUser?.id,
      from_user_name: KaryakramUser?.name,
      type: "RSVP",
      message: `${KaryakramUser?.name} has RSVP'd to your event ${event?.title}`,
    });
    setAdding(false);
  };

  return {
    token,
    handleRSVP,
    checkUserIsOwner,
    adding,
    approveRsvp,
    rejectRsvp,
  };
}
