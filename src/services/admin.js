import { api } from "./api";

export const adminService = {
  // Platform analytics
  stats: () => api.get("/admin/stats"),

  // All events across organizers
  listEvents: (params) => api.get("/admin/events", params),

  // All groups
  listGroups: () => api.get("/admin/groups"),

  // User management
  listUsers: (params) => api.get("/admin/users", params),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};
