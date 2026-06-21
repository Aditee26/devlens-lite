import axios from "axios";
import toast from "react-hot-toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response interceptor – auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      // Get refresh token from zustand persisted storage
      const stored = JSON.parse(localStorage.getItem("devlens-auth") || "{}");
      const refreshToken = stored?.state?.refreshToken;

      if (!refreshToken) {
        // No refresh token – clear auth and redirect
        localStorage.removeItem("devlens-auth");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );
        const newAccess = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        // Update stored tokens
        const parsed = JSON.parse(localStorage.getItem("devlens-auth") || "{}");
        if (parsed.state) {
          parsed.state.accessToken = newAccess;
          parsed.state.refreshToken = newRefresh;
          localStorage.setItem("devlens-auth", JSON.stringify(parsed));
        }

        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        original.headers["Authorization"] = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        return apiClient(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("devlens-auth");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Show error toast for 5xx
    if (error.response?.status >= 500) {
      toast.error("Server error – please try again");
    }

    return Promise.reject(error);
  }
);
