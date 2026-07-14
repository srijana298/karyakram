import { api } from "./api";

export const authService = {
  signup: (name, email, password, avatar) =>
    api.post("/auth/signup", { name, email, password, avatar }),

  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  getMe: () => api.get("/auth/me"),

  updateMe: (data) => api.patch("/auth/me", data),
};
