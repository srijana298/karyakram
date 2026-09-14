import { api } from "./api";

export const adminService = {
  stats: () => api.get("/admin/stats"),
  events: (params) => api.get("/admin/events", params),
  groups: () => api.get("/admin/groups"),
  users: (params) => api.get("/admin/users", params),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  deleteGroup: (id) => api.delete(`/admin/groups/${id}`),
};
