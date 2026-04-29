import { api } from "./api";

export const groupService = {
  create: (data) => api.post("/groups", data),
  list: (params) => api.get("/groups", params),
  getById: (id) => api.get(`/groups/${id}`),
  update: (id, data) => api.patch(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  stats: (id) => api.get(`/groups/${id}/stats`),
  conflicts: (id) => api.get(`/groups/${id}/conflicts`),
  attendanceSummary: (id) => api.get(`/groups/${id}/attendance-summary`),
};
