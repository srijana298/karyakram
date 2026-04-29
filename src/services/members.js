import { api } from "./api";

export const memberService = {
  invite: (eventId, userId, role) =>
    api.post(`/events/${eventId}/members`, { user_id: userId, role }),

  list: (eventId) => api.get(`/events/${eventId}/members`),

  remove: (eventId, memberId) =>
    api.delete(`/events/${eventId}/members/${memberId}`),

  markAttendance: (eventId, memberId) =>
    api.patch(`/events/${eventId}/members/${memberId}/attend`),

  acceptInvite: (inviteToken) =>
    api.patch("/memberships/accept", { invite_token: inviteToken }),
};
