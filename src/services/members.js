import { api } from "./api";

export const memberService = {
  list: (eventId) => api.get(`/events/${eventId}/members`),

  remove: (eventId, memberId) =>
    api.delete(`/events/${eventId}/members/${memberId}`),

  markAttendance: (eventId, memberId) =>
    api.patch(`/events/${eventId}/members/${memberId}/attend`),
};
