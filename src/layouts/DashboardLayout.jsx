import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

// Unified app shell (Luma-style), theme-aware via the `dark:` variant.
function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-[#0a0a0b] dark:text-white">
      <Navbar />
      <main className="flex-1">
        <div className="container py-10">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

export default DashboardLayout;
