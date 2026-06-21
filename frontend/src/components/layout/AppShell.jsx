import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/dashboard":    "Dashboard",
  "/repositories": "Repositories",
  "/reports":      "Reports",
  "/settings":     "Settings",
  "/profile":      "Profile",
  "/admin":        "Admin – Overview",
  "/admin/users":  "Admin – Users",
  "/admin/repos":  "Admin – Repositories",
};

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.includes("/chat"))         return "AI Chat";
  if (pathname.includes("/dependencies")) return "Dependency Graph";
  if (pathname.includes("/security"))     return "Security Scanner";
  if (pathname.includes("/deadcode"))     return "Dead Code";
  if (pathname.includes("/analysis"))     return "Repository Analysis";
  if (pathname.includes("/repositories/")) return "Repository Detail";
  return "DevLens Lite";
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
