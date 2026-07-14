import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

function LandingLayout() {
  const { pathname } = useLocation();

  // The landing page ("/") ships its own dark header, so hide the global navbar there.
  const hideNavbar = pathname.includes("auth") || pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0b] text-stone-900 dark:text-white">
      {!hideNavbar && <Navbar />}
      <div className="flex-1">
        <Outlet />
      </div>
      {/* {!pathname.includes('auth') && <Footer/>} */}
    </div>
  );
}

export default LandingLayout;
