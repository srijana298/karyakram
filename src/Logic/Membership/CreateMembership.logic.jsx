import { useCallback, useEffect, useState } from "react";
import { memberService } from "../../services/members";

export default function CreateMembershipLogic(teamId) {
  const [teamMembers, setTeamMembers] = useState(null);
  const [memberCount, setMemberCount] = useState(0);

  const createMembership = async ({ eventId, userId, name, email, role }) => {
    const res = await memberService.invite(eventId, userId, role);
    if (!res.ok) throw new Error(res.error);

    // Refresh members
    await getTeamMembers(teamId);
    return res.data;
  };

  const getTeamMembers = useCallback(async (teamId) => {
    if (!teamId) return;
    const res = await memberService.list(teamId);
    if (res.ok) {
      setTeamMembers(res.data);
      setMemberCount(res.data.length);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) getTeamMembers(teamId);
  }, [getTeamMembers, teamId]);

  return {
    createMembership,
    teamMembers,
    memberCount,
  };
}
