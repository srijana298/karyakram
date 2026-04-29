import { api } from "./api";

export const notificationService = {
  list: () => api.get("/notifications"),

  create: (data) => api.post("/notifications", data),

  markRead: (id) => api.patch(`/notifications/${id}/read`),
};
