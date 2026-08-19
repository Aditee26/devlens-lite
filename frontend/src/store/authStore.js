import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../api/client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      hydrate: () => {
        const { token } = get();
        if (token) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      },

      setAuth: ({ user, token }) => {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (user) => set({ user }),

      clearAuth: () => {
        delete apiClient.defaults.headers.common["Authorization"];
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "devlens-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
