import { api } from "./api";

export const attendanceService = {
  list: (eventId) => api.get(`/events/${eventId}/attendance`),
  mark: (eventId, payload) => api.post(`/events/${eventId}/attendance`, payload),
  bulk: (eventId, payload) => api.post(`/events/${eventId}/attendance/bulk`, payload),
  generateCode: (eventId) => api.post(`/events/${eventId}/checkin/code`, {}),
  selfCheckIn: (eventId, payload) => api.post(`/events/${eventId}/checkin`, payload),
};
