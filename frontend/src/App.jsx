import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

import AppShell        from "./components/layout/AppShell";
import AuthLayout      from "./components/layout/AuthLayout";
import ProtectedRoute  from "./components/layout/ProtectedRoute";
import AdminRoute      from "./components/layout/AdminRoute";

// Auth pages
import LoginPage           from "./pages/auth/LoginPage";
import RegisterPage        from "./pages/auth/RegisterPage";
import ForgotPasswordPage  from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage   from "./pages/auth/ResetPasswordPage";

// App pages
import DashboardPage       from "./pages/dashboard/DashboardPage";
import RepositoriesPage    from "./pages/repository/RepositoriesPage";
import RepositoryDetailPage from "./pages/repository/RepositoryDetailPage";
import AnalysisPage        from "./pages/analysis/AnalysisPage";
import DependencyGraphPage from "./pages/analysis/DependencyGraphPage";
import SecurityPage        from "./pages/analysis/SecurityPage";
import DeadCodePage        from "./pages/analysis/DeadCodePage";
import ChatPage            from "./pages/chat/ChatPage";
import ReportsPage         from "./pages/reports/ReportsPage";
import SettingsPage        from "./pages/settings/SettingsPage";
import ProfilePage         from "./pages/settings/ProfilePage";

// Admin pages
import AdminDashboardPage  from "./pages/admin/AdminDashboardPage";
import AdminUsersPage      from "./pages/admin/AdminUsersPage";
import AdminReposPage      from "./pages/admin/AdminReposPage";

export default function App() {
  const { theme } = useThemeStore();
  const { hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Routes>
      {/* ── Public auth routes ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
      </Route>

      {/* ── Protected app routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index                           element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"               element={<DashboardPage />} />
          <Route path="/repositories"            element={<RepositoriesPage />} />
          <Route path="/repositories/:id"        element={<RepositoryDetailPage />} />
          <Route path="/repositories/:id/analysis"    element={<AnalysisPage />} />
          <Route path="/repositories/:id/dependencies" element={<DependencyGraphPage />} />
          <Route path="/repositories/:id/security"    element={<SecurityPage />} />
          <Route path="/repositories/:id/deadcode"    element={<DeadCodePage />} />
          <Route path="/repositories/:id/chat"        element={<ChatPage />} />
          <Route path="/reports"                 element={<ReportsPage />} />
          <Route path="/settings"                element={<SettingsPage />} />
          <Route path="/profile"                 element={<ProfilePage />} />

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"            element={<AdminDashboardPage />} />
            <Route path="/admin/users"      element={<AdminUsersPage />} />
            <Route path="/admin/repos"      element={<AdminReposPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
