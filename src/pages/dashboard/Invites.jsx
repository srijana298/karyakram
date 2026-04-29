import React, { useState } from "react";
import { IoPeopleOutline } from "react-icons/io5";
import GetMembershipLogic from "../../Logic/Membership/GetMembership.logic";
import UserList from "../../components/UserList";
import Loading from "../../components/Loading";

function Invites() {
  const { loading, error, teams, deleteInvitation } = GetMembershipLogic();
  const [teamId, setTeamId] = useState(null);

  if (loading) return <Loading />;

  return (
    <>
      {error && <p>{error}</p>}
      {teams && teams?.length > 0 ? (
        <div className="flex w-full flex-col py-6 group">
          {teams.map((team) => (
            <div key={team.id} className="flex py-4 justify-between border-b border-neutral-300 group gap-2 items-center">
              <h3 onClick={(e) => { e?.preventDefault(); setTeamId(team.id); }} className="font-semibold cursor-pointer">
                {team.title}
              </h3>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">You don't have any invites yet</p>
      )}
    </>
  );
}

export default Invites;
