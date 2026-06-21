import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../api/client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      hydrate: () => {
        const { accessToken } = get();
        if (accessToken) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
      },

      setAuth: ({ user, accessToken, refreshToken }) => {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      updateUser: (user) => set({ user }),

      clearAuth: () => {
        delete apiClient.defaults.headers.common["Authorization"];
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "devlens-auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
