import React, { useCallback, useState } from "react";
import { IoClose, IoPerson, IoSearch } from "react-icons/io5";
import Loading from "./Loading";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { resolveImage } from "../lib/resolveImage";
import { MdHandshake, MdPeople } from "react-icons/md";
import { useNotifications } from "../context/notificationContext";
import RsvpLogic from "../Logic/Explore/rsvp.logic";
import Avatar from "./Avatar";

const roleConfig = {
  owner: {
    icon: IoPerson,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    label: "Owner",
  },
  collaborator: {
    icon: MdHandshake,
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    label: "Collaborator",
  },
  volunteer: {
    icon: MdPeople,
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    label: "Volunteer",
  },
};

function getRoleConfig(role) {
  if (!role) return null;
  for (const [key, config] of Object.entries(roleConfig)) {
    if (role.includes(key)) return { ...config, key };
  }
  return null;
}

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
  const [search, setSearch] = useState("");
  const { pathname } = useLocation();
  const { sendNotification } = useNotifications();
  const { approveRsvp, rejectRsvp } = RsvpLogic(events);

  const displayedUsers = filteredUsers ?? users;

  const filterUsers = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      setSearch(value);
      if (!value) {
        setFilteredUsers(null);
        return;
      }
      const filtered = users.filter((user) => {
        return (
          (user?.name ?? "").toLowerCase().includes(value) ||
          (user?.email ?? "").toLowerCase().includes(value) ||
          (user?.role ?? "").toLowerCase().includes(value)
        );
      });
      setFilteredUsers(filtered);
    },
    [users]
  );

  const handleInvite = async (user, role) => {
    const fromUser = JSON.parse(localStorage.getItem("Mahotsav-user"));
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

  const getMembershipStatus = (user) => {
    if (typeof checkMembership === "function") {
      return checkMembership(user?.id || user?.user_id);
    }
    return "Invite";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={toggleShowUsers}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">Invite People</h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {users?.length ?? 0} member{users?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={toggleShowUsers}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            >
              <IoClose className="text-lg" />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2.5 bg-stone-50 rounded-xl px-3.5 py-2.5 border border-stone-100 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <IoSearch className="text-stone-400 text-sm shrink-0" />
            <input
              onChange={filterUsers}
              type="text"
              placeholder="Search name, email, or role..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400 text-stone-700"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-auto">
          {fetchingUsers ? (
            <div className="flex items-center justify-center py-20">
              <Loading />
            </div>
          ) : displayedUsers?.length > 0 ? (
            <div className="px-4 py-3 space-y-1">
              {displayedUsers.map((u) => {
                const rc = getRoleConfig(u?.role);
                const status = getMembershipStatus(u);
                const RoleIcon = rc?.icon;

                return (
                  <div
                    key={u.id ?? u?.user_id}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {u?.avatar || u?.image ? (
                        <img
                          src={resolveImage(u.avatar || u.image)}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-sm font-bold">
                          {u?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-800 truncate">
                          {u?.name}
                        </p>
                        {rc && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${rc.bg} ${rc.text}`}
                          >
                            {RoleIcon && <RoleIcon className="text-[10px]" />}
                            {rc.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate">
                        {u?.email}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {/* Status / invite button */}
                      {status === "Joined" ? (
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                          Joined
                        </span>
                      ) : status === "Pending" ? (
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e?.preventDefault();
                            toast.custom((t) => (
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const formData = Object.fromEntries(
                                    new FormData(e.target)
                                  );
                                  await handleInvite(u, formData.role);
                                  toast.dismiss(t.id);
                                }}
                                className={`${
                                  t.visible ? "animate-enter" : "animate-leave"
                                } max-w-xs w-full bg-white shadow-xl rounded-2xl pointer-events-auto overflow-hidden`}
                              >
                                <div className="p-5">
                                  <p className="text-sm font-semibold text-stone-800 mb-3">
                                    Assign a role to {u?.name?.split(" ")[0]}
                                  </p>
                                  <select
                                    name="role"
                                    className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                                  >
                                    <option value="collaborator">
                                      Collaborator
                                    </option>
                                    <option value="volunteer">Volunteer</option>
                                    <option value="attendee">Attendee</option>
                                  </select>
                                </div>
                                <div className="flex border-t border-stone-100">
                                  <button
                                    type="button"
                                    onClick={() => toast.dismiss(t.id)}
                                    className="flex-1 py-3 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="flex-1 py-3 text-xs font-semibold text-primary border-l border-stone-100 hover:bg-primary/5 transition-colors"
                                  >
                                    Send Invite
                                  </button>
                                </div>
                              </form>
                            ));
                          }}
                          className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                          Invite
                        </button>
                      )}

                      {/* RSVP actions */}
                      {pathname.includes("rsvp") && (
                        <>
                          <button
                            disabled={u?.approved}
                            onClick={async (e) => {
                              e?.preventDefault();
                              await approveRsvp(u);
                            }}
                            className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-lg hover:bg-primary hover:text-white disabled:bg-primary disabled:text-white disabled:cursor-not-allowed transition-colors"
                          >
                            {u?.approved ? "✓" : "Approve"}
                          </button>
                          <button
                            onClick={async (e) => {
                              e?.preventDefault();
                              await rejectRsvp(u);
                            }}
                            className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <IoSearch className="text-stone-400 text-lg" />
              </div>
              <p className="text-sm font-medium text-stone-500">
                {search ? "No users found" : "No members yet"}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {search
                  ? "Try a different search term"
                  : "Invite people to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserList;
