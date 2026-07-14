import { api } from "./api";

export const calendarService = {
  // { featured: true } → only calendars flagged for the Discover page.
  list: (params) => api.get("/calendars", params),
  getById: (id) => api.get(`/calendars/${id}`),
  create: (formData) => api.post("/calendars", formData, { isFormData: true }),
  follow: (id) => api.post(`/calendars/${id}/follow`),
  unfollow: (id) => api.delete(`/calendars/${id}/follow`),
};
