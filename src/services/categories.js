import { api } from "./api";

export const categoryService = {
  // Returns [{ id, label, slug, icon, color, event_count }]
  list: () => api.get("/categories"),
};
