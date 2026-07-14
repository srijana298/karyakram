import { api } from "./api";

export const rsvpService = {
  create: (eventId, data) => api.post(`/rsvps/${eventId}`, data),

  listForEvent: (eventId) => api.get(`/rsvps/${eventId}/rsvps`),

  listMine: (params) => api.get("/rsvps", params),

  approve: (rsvpId) => api.patch(`/rsvps/${rsvpId}/approve`),

  reject: (rsvpId) => api.patch(`/rsvps/${rsvpId}/reject`),
};
