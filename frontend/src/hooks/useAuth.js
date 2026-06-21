import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Login failed"),
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      setAuth(data);
      toast.success("Account created!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Registration failed"),
  });
}

export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(refreshToken),
    onSettled: () => {
      clearAuth();
      qc.clear();
      navigate("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email) => authApi.forgotPassword(email),
    onSuccess: () => toast.success("Reset link sent – check your email"),
    onError: (err) => toast.error(err.response?.data?.message || "Request failed"),
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ token, password }) => authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password reset! Please log in.");
      navigate("/login");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Reset failed"),
  });
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    select: (d) => d.data.user,
  });
}
