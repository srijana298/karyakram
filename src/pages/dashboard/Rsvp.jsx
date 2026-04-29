import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { rsvpService } from "../../services/rsvps";
import UserList from "../../components/UserList";
import Loading from "../../components/Loading";
import {
  MdOutlinePersonAdd,
  MdOutlinePersonRemove,
  MdPeopleOutline,
} from "react-icons/md";

function Rsvps() {
  const [rsvps, setRsvps] = useState(null);
  const [simplifiedRsvps, setSimplifiedRsvps] = useState(null);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [eventId, setEventId] = useState(null);

  let user = null;
  try { user = JSON.parse(localStorage.getItem("Karyakram-user")); } catch {}
  const userId = user?.id;

  const getEventRsvps = async () => {
    if (!userId) return;
    setLoadingRsvps(true);
    const res = await rsvpService.listMine({ owner_user_id: userId, pending: "true" });
    if (res.ok) {
      setRsvps(res.data);
      const groupedData = {};
      res.data.forEach((doc) => {
        const key = `${doc.event_id}`;
        if (!groupedData[key]) {
          groupedData[key] = {
            eventName: doc.event_id,
            eventId: doc.event_id,
            approvedCount: 0,
            rejectedCount: 0,
            users: [],
          };
        }
        if (doc.approved) groupedData[key].approvedCount++;
        if (doc.rejected) groupedData[key].rejectedCount++;
        groupedData[key].users.push({
          documentId: doc.id,
          name: doc.user_id,
          approved: doc.approved,
          rejected: doc.rejected,
          userId: doc.user_id,
          eventId: doc.event_id,
        });
      });
      setSimplifiedRsvps(Object.values(groupedData));
    }
    setLoadingRsvps(false);
  };

  useEffect(() => {
    if (userId) getEventRsvps();
  }, [userId]);

  if (loadingRsvps) return <Loading />;

  return (
    <>
      {simplifiedRsvps && simplifiedRsvps?.length > 0 ? (
        <div className="flex w-full flex-col py-6 group">
          {simplifiedRsvps?.map((event) => (
            <div className="flex w-full justify-between py-4 border-b-neutral-200 border-b" key={event.eventId}>
              <h3 className="text-lg font-semibold cursor-pointer" onClick={(e) => { e?.preventDefault(); setEventId(event.eventId); }}>
                Event #{event.eventName}
              </h3>
              <div className="inline-flex items-center gap-6 select-none">
                <UserCount count={event?.users?.length} icon={<MdPeopleOutline />} title="Total" />
                <UserCount count={event?.approvedCount} icon={<MdOutlinePersonAdd />} title="Approved" />
                <UserCount count={event?.rejectedCount} icon={<MdOutlinePersonRemove />} title="Rejected" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">You don't have any pending RSVPs yet</p>
      )}
    </>
  );
}

export default Rsvps;

function UserCount({ count, icon, title }) {
  return (
    <div className="flex items-center gap-2 text-lg text-neutral-600" title={title}>
      {icon}
      <p>{count}</p>
    </div>
  );
}
