import React from "react";
import { Outlet, Link } from "react-router-dom";
import { IoSparkles } from "../components/icons";
import { RiInstagramLine, RiTwitterLine } from "../components/icons";
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

      <footer className="border-t border-stone-200 dark:border-white/10">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-stone-500 dark:text-white/50">
            <IoSparkles className="text-accent" />
            <Link to="/explore" className="hover:text-stone-900 dark:hover:text-white transition-colors">Discover</Link>
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Help</a>
          </div>
          <div className="flex items-center gap-4 text-stone-400 dark:text-white/40">
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors"><RiInstagramLine /></a>
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors"><RiTwitterLine /></a>
            <span className="px-4 py-1.5 rounded-full border border-stone-300 dark:border-white/15 text-xs font-medium text-stone-600 dark:text-white/70">Get the App</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout;
