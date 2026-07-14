import { api } from "./api";

export const eventService = {
  create: (data) => api.post("/events", data),

  list: (params) => api.get("/events", params),

  getById: (id) => api.get(`/events/${id}`),

  resolveCode: (code) => api.get(`/events/code/${code}`),

  update: (id, data) => api.patch(`/events/${id}`, data),

  delete: (id) => api.delete(`/events/${id}`),

  listInvitations: (id) => api.get(`/events/${id}/invitations`),

  inviteGuests: (id, emails) => api.post(`/events/${id}/invitations`, { emails }),

  acceptInvitation: (token) => api.patch(`/events/invitations/${token}/accept`),

  rejectInvitation: (token) => api.patch(`/events/invitations/${token}/reject`),

  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post(`/events/${id}/image`, formData, { isFormData: true });
  },
};
