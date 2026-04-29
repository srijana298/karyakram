import { api } from "./api";

export const certificateService = {
  templates: () => api.get("/certificates/templates"),
  getTemplate: (id) => api.get(`/certificates/templates/${id}`),
  createTemplate: (formData) =>
    api.post("/certificates/templates", formData, { isFormData: true }),
  updateTemplate: (id, formData) =>
    api.patch(`/certificates/templates/${id}`, formData, { isFormData: true }),
  deleteTemplate: (id) => api.delete(`/certificates/templates/${id}`),
  generateForEvent: (eventId, payload) =>
    api.post(`/certificates/events/${eventId}/generate`, payload),
  listForEvent: (eventId) => api.get(`/certificates/events/${eventId}`),
  mine: () => api.get("/certificates/mine"),
  verify: (code) => api.get(`/certificates/verify/${code}`),
};
