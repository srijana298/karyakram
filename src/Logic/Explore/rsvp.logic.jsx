import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { rsvpService } from "../../services/rsvps";
import { useNotifications } from "../../context/notificationContext";

export default function RsvpLogic(event) {
  let token = null;
  try { token = JSON.parse(localStorage.getItem("token")); } catch { token = null; }

  let MahotsavUser = null;
  try { MahotsavUser = JSON.parse(localStorage.getItem("Mahotsav-user")); } catch { MahotsavUser = null; }

  const [adding, setAdding] = useState(false);
  // The current user's RSVP for this event (null = none). Used to hide the
  // RSVP button once they've already responded.
  const [myRsvp, setMyRsvp] = useState(null);
  const { sendNotification } = useNotifications();

  // Load the user's existing RSVP for this event so we don't offer to RSVP
  // again after they've already done so.
  useEffect(() => {
    if (!token || !event?.id) return;
    let active = true;
    rsvpService.listMine().then((res) => {
      if (!active || !res.ok) return;
      const mine = (res.data || []).find((r) => r.event_id === event.id);
      if (mine) setMyRsvp(mine);
    });
    return () => {
      active = false;
    };
  }, [token, event?.id]);

  const checkUserIsOwner = () => {
    if (token && MahotsavUser && event?.created_by === MahotsavUser?.id) {
      return true;
    }
    return false;
  };

  const addRsvp = async (user, options) => {
    const res = await rsvpService.create(event?.id, options);
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
        from_user_id: MahotsavUser?.id,
        from_user_name: MahotsavUser?.name,
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
        from_user_id: MahotsavUser?.id,
        from_user_name: MahotsavUser?.name,
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
    let res = await rsvpService.create(event?.id);

    if (!res.ok && res.status === 409 && res.data?.data?.code === "TRAVEL_RISK") {
      const proceed = window.confirm(`${res.error}\n\nContinue RSVP anyway?`);
      if (proceed) {
        res = await rsvpService.create(event?.id, { forceTravelRisk: true });
      }
    }

    if (!res.ok) {
      toast.error(res.error);
      setAdding(false);
      return;
    }

    toast.success("RSVP has been sent to the event owner. You will be notified when they approve your request.");
    setMyRsvp({ event_id: event?.id, pending: true, approved: false, rejected: false });
    await sendNotification({
      user_id: event?.created_by,
      from_user_id: MahotsavUser?.id,
      from_user_name: MahotsavUser?.name,
      type: "RSVP",
      message: `${MahotsavUser?.name} has RSVP'd to your event ${event?.title}`,
    });
    setAdding(false);
  };

  return {
    token,
    handleRSVP,
    checkUserIsOwner,
    adding,
    myRsvp,
    approveRsvp,
    rejectRsvp,
  };
}
