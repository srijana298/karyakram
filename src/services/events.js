import { api } from "./api";

export const eventService = {
  create: (data) => api.post("/events", data),

  list: (params) => api.get("/events", params),

  getById: (id) => api.get(`/events/${id}`),

  update: (id, data) => api.patch(`/events/${id}`, data),

  delete: (id) => api.delete(`/events/${id}`),

  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post(`/events/${id}/image`, formData, { isFormData: true });
  },
};
