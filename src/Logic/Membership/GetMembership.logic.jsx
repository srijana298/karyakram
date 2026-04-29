import { useState, useEffect, useCallback } from "react";
import { memberService } from "../../services/members";
import { eventService } from "../../services/events";

function GetMembershipLogic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEvents, setUserEvents] = useState(null);
  const [eventsCount, setEventsCount] = useState(0);

  const getUserEvents = useCallback(async () => {
    setLoading(true);
    const res = await eventService.list({ mine: "true" });
    if (res.ok) {
      setUserEvents(res.data);
      setEventsCount(res.data.length);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getUserEvents();
  }, [getUserEvents]);

  const deleteInvitation = async ({ eventId, memberId }) => {
    const res = await memberService.remove(eventId, memberId);
    return res;
  };

  return { loading, error, teams: userEvents, teamsCount: eventsCount, deleteInvitation };
}

export default GetMembershipLogic;
