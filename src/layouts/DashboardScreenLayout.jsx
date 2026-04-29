import React from "react";

function DashboardScreenLayout({ children, title }) {
  return (
    <div className="space-y-4">
      <div className="dashboard-panel px-5 py-4">
        <h2 className="text-[28px] leading-tight font-semibold text-dashboard-text">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default DashboardScreenLayout;
