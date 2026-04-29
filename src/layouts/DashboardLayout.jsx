import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Notifications from "../components/Notifications";

function DashboardLayout() {
  return (
    <div className="w-full flex h-full bg-dashboard-bg p-4">
      <div className="dashboard-shell w-full flex overflow-hidden">
        <Sidebar />
        <Notifications />
        <div className="dashboard-content overflow-auto w-full p-6 bg-dashboard-surface">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
