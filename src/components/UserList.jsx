import React, { useCallback, useState } from "react";
import { IoClose, IoPerson, IoSearch } from "react-icons/io5";
import Loading from "./Loading";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { MdHandshake, MdPeople } from "react-icons/md";
import { useNotifications } from "../context/notificationContext";
import RsvpLogic from "../Logic/Explore/rsvp.logic";
import { memberService } from "../services/members";

function UserList({
  toggleShowUsers,
  users,
  fetchingUsers,
  createMembership,
  id,
  events,
  checkMembership,
  colors,
  deleteInvitation,
  teamName,
}) {
  const [filteredUsers, setFilteredUsers] = useState(null);
  const { pathname } = useLocation();
  const { sendNotification } = useNotifications();
  const { approveRsvp, rejectRsvp } = RsvpLogic(events);

  const filterUsers = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      const filtered = users.filter((user) => {
        return (
          (user?.name ?? "").toLowerCase().includes(value || "") ||
          (user?.email ?? "").toLowerCase().includes(value || "") ||
          (user?.role ?? "").toLowerCase().includes(value || "")
        );
      });
      setFilteredUsers(filtered);
    },
    [users]
  );

  const handleInvite = async (user, role) => {
    const fromUser = JSON.parse(localStorage.getItem("Karyakram-user"));
    try {
      if (typeof createMembership === "function") {
        await createMembership({
          eventId: events?.id || id,
          userId: user.id || user.user_id,
          name: user.name,
          email: user.email,
          role,
        });
        toast.success(`${user.name} has been invited to the event`);
        await sendNotification({
          user_id: user.id || user.user_id,
          message: `You have an invitation to join ${fromUser?.name}'s team for ${events?.title} event as a ${role}.`,
          from_user_id: fromUser?.id,
          from_user_name: fromUser?.name,
          link: `${import.meta.env.VITE_WEBSITE_URL}/event/${id}`,
        });
      } else if (deleteInvitation && user.joined) {
        await deleteInvitation({ eventId: events?.id, memberId: user.id });
        toast.success("Invitation deleted");
        toggleShowUsers();
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2 p-4 border-l border-neutral-300 bg-gray-100/95 backdrop-blur shadow lg:shadow-none fixed top-0 right-0 overflow-auto min-w-[25vw]">
      <button onClick={toggleShowUsers} className="absolute top-6 right-4 z-10">
        <IoClose />
      </button>
      <div className="w-full space-y-4">
        <div className="w-full px-3 rounded-[18px] bg-neutral-200 outline outline-1 outline-neutral-200 flex items-center justify-between">
          <input onChange={filterUsers} type="text" placeholder="Search name or email or role" className="w-full bg-transparent py-2 outline-none" />
          <IoSearch />
        </div>
      </div>
      {fetchingUsers ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-2 overflow-auto h-full">
          {(filteredUsers ?? users)?.map((u) => (
            <div key={u.id ?? u?.user_id} className="w-full px-3 pb-2 border-b border-neutral-200 flex items-center justify-between gap-2">
              <div className="mr-auto">
                <p className="text-sm text-left">{u?.name}</p>
                <p className="text-xs text-neutral-500 text-left">{u?.email}</p>
              </div>
              {u?.role?.includes("owner") && <IoPerson title="Owner" className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-neutral-100 rounded-full text-3xl flex" />}
              {u?.role?.includes("collaborator") && <MdHandshake title="Collaborator" className="p-2 bg-gradient-to-br from-primary/80 to-primary text-neutral-100 rounded-full text-3xl flex" />}
              {u?.role?.includes("volunteer") && <MdPeople title="Volunteer" className="p-2 bg-gradient-to-br from-accent/80 to-accent text-neutral-100 rounded-full text-3xl flex" />}
              <button
                onClick={async (e) => {
                  e?.preventDefault();
                  toast.custom((t) =>
                    typeof createMembership === "function" ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = Object.fromEntries(new FormData(e.target));
                          await handleInvite(u, formData.role);
                          toast.dismiss(t.id);
                        }}
                        className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-lg rounded-[18px] overflow-hidden pointer-events-auto grid grid-cols-3`}
                      >
                        <div className="flex-1 col-span-2 p-4 w-full">
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">What role would you like to assign?</p>
                            <select name="role">
                              <option value="collaborator">Collaborator</option>
                              <option value="volunteer">Volunteer</option>
                              <option value="attendee">Attendee</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col border-l border-gray-200">
                          <button type="submit" className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-primary hover:bg-primary hover:text-white">Invite</button>
                          <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none border-t border-neutral-300 p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:bg-indigo-500 hover:text-white">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-lg rounded-[18px] overflow-hidden pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                          <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this invite?</p>
                        </div>
                        <div className="flex flex-col border-l border-gray-200">
                          <button onClick={async () => { await handleInvite(u); toast.dismiss(t.id); }} className="w-full p-4 text-red-600 hover:bg-red-600 hover:text-white">Delete</button>
                          <button onClick={() => toast.dismiss(t.id)} className="w-full border-t border-neutral-300 p-4 text-indigo-600 hover:bg-indigo-500 hover:text-white">Cancel</button>
                        </div>
                      </div>
                    )
                  );
                }}
                className="sidebar-link focus:primary-btn"
              >
                {typeof checkMembership === "function" ? checkMembership(u?.id || u?.user_id) : "Invite"}
              </button>
              {pathname.includes("rsvp") && (
                <div className="inline-flex gap-1 items-center">
                  <button disabled={u?.approved} onClick={async (e) => { e?.preventDefault(); await approveRsvp(u); }} className="sidebar-link disabled:bg-green-500 disabled:text-white disabled:cursor-not-allowed">
                    Approve{u?.approved ? "d" : ""}
                  </button>
                  <button onClick={async (e) => { e?.preventDefault(); await rejectRsvp(u); }} className="sidebar-link">
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;
