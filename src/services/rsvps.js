import { api } from "./api";

export const rsvpService = {
  create: (eventId) => api.post(`/rsvps/${eventId}`),

  listForEvent: (eventId) => api.get(`/rsvps/${eventId}/rsvps`),

  listMine: (params) => api.get("/rsvps", params),

  approve: (rsvpId) => api.patch(`/rsvps/${rsvpId}/approve`),

  reject: (rsvpId) => api.patch(`/rsvps/${rsvpId}/reject`),
};
