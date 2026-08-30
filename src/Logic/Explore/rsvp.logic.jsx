import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { rsvpService } from "../../services/rsvps";
import { useNotifications } from "../../context/notificationContext";

export default function RsvpLogic(event) {
  let token = null;
  try { token = JSON.parse(localStorage.getItem("token")); } catch { token = null; }

  let MahotsavUser = null;
  try { MahotsavUser = JSON.parse(localStorage.getItem("Mahotsav-user")); } catch { MahotsavUser = null; }

  const queryClient = useQueryClient();
  const { sendNotification } = useNotifications();

  // Load the user's existing RSVP for this event so we don't offer to RSVP
  // again after they've already responded.
  const { data: myRsvp } = useQuery({
    queryKey: ["rsvps", "mine"],
    enabled: !!token,
    select: (rows) => rows.find((r) => r.event_id === event?.id) ?? null,
    queryFn: async () => {
      const res = await rsvpService.listMine();
      if (!res.ok) throw new Error(res.error || "Failed to load RSVPs");
      return res.data || [];
    },
  });

  const checkUserIsOwner = () => {
    if (token && MahotsavUser && event?.created_by === MahotsavUser?.id) {
      return true;
    }
    return false;
  };

  const approveMutation = useMutation({
    mutationFn: async (rsvpItem) => {
      const res = await rsvpService.approve(rsvpItem.id || rsvpItem.documentId);
      if (!res.ok) throw new Error(res.error || "Failed to approve RSVP");
      return rsvpItem;
    },
    onSuccess: async (rsvpItem) => {
      await sendNotification({
        user_id: rsvpItem.user_id || rsvpItem.userId,
        from_user_id: MahotsavUser?.id,
        from_user_name: MahotsavUser?.name,
        type: "RSVP_APPROVED",
        message: `Your RSVP to ${event?.title} has been approved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
      toast.success("RSVP has been approved");
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async (rsvpItem) => {
      const res = await rsvpService.reject(rsvpItem.id || rsvpItem.documentId);
      if (!res.ok) throw new Error(res.error || "Failed to reject RSVP");
      return rsvpItem;
    },
    onSuccess: async (rsvpItem) => {
      await sendNotification({
        user_id: rsvpItem.user_id || rsvpItem.userId,
        from_user_id: MahotsavUser?.id,
        from_user_name: MahotsavUser?.name,
        type: "RSVP_REJECTED",
        message: `Your RSVP to ${event?.title} has been rejected by the owner.`,
      });
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
      toast.success("RSVP has been rejected");
    },
    onError: (err) => toast.error(err.message),
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      let res = await rsvpService.create(event?.id);
      if (!res.ok && res.status === 409 && res.data?.data?.code === "TRAVEL_RISK") {
        const proceed = window.confirm(`${res.error}\n\nContinue RSVP anyway?`);
        if (proceed) res = await rsvpService.create(event?.id, { forceTravelRisk: true });
      }
      if (!res.ok) throw new Error(res.error || "Failed to RSVP");
      return res.data;
    },
    onSuccess: async () => {
      toast.success("RSVP has been sent to the event owner. You will be notified when they approve your request.");
      await sendNotification({
        user_id: event?.created_by,
        from_user_id: MahotsavUser?.id,
        from_user_name: MahotsavUser?.name,
        type: "RSVP",
        message: `${MahotsavUser?.name} has RSVP'd to your event ${event?.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleRSVP = (e) => {
    e?.preventDefault();
    if (checkUserIsOwner()) return toast.error("You cannot RSVP to your own event");
    if (!token) return toast.error("Please login to RSVP");
    if (event?.accepting_rsvp === false) return toast.error("RSVP for this event is closed");
    const startDate = event?.start_date
      ? new Date(typeof event.start_date === 'string' ? event.start_date.split('+')[0] : event.start_date)
      : null;
    if (startDate && startDate.getTime() < Date.now()) {
      return toast.error("RSVP is closed because this event has already started");
    }
    rsvpMutation.mutate();
  };

  return {
    token,
    handleRSVP,
    checkUserIsOwner,
    adding: rsvpMutation.isPending,
    myRsvp: myRsvp ?? null,
    approveRsvp: (item) => approveMutation.mutate(item),
    rejectRsvp: (item) => rejectMutation.mutate(item),
  };
}
