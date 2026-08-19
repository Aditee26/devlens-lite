import axios from "axios";
import toast from "react-hot-toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("devlens-auth");
      delete apiClient.defaults.headers.common["Authorization"];
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (error.response?.status >= 500) {
      toast.error("Server error – please try again");
    }

    return Promise.reject(error);
  }
);
