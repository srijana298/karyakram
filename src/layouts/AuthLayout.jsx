import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import BackBtn from "../components/BackBtn";
import Brand from "../components/Brand";

function AuthLayout() {
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");
  const isLogin = pathname.includes("login");
  const button = {
    text: isLogin ? "Create account" : "Sign in",
    link: isLogin ? "/auth/signup" : "/auth/login",
  };
  const pageTitle = isLogin ? "Welcome back" : "Create your account";

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-stone-950 lg:p-3">
      <div className="min-h-screen lg:min-h-[calc(100vh-1.5rem)] overflow-hidden lg:rounded-[28px] lg:border lg:border-stone-950/10 bg-[#f4f2ed]">
        <section className="relative flex flex-col min-h-screen lg:min-h-0">
          <header className="h-20 px-6 sm:px-10 lg:px-14 flex items-center justify-between">
            {!token ? <BackBtn to="/" /> : <span />}
            <Brand size="w-12" />
          </header>

          <div className="flex-1 flex items-center px-6 sm:px-10 lg:px-14 py-8">
            <div className="w-full max-w-[480px] mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mb-3">
                {isLogin ? "Good to see you again" : "Join Mahotsav"}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{pageTitle}</h1>
              <p className="mt-3 mb-8 text-sm leading-relaxed text-stone-600">
                {isLogin
                  ? "Sign in to manage your events and invitations."
                  : "Create events, invite your people, and make something memorable."}
              </p>

              <Outlet />

              {!token && (
                <p className="mt-6 text-sm text-stone-600">
                  {isLogin ? "New to Mahotsav?" : "Already have an account?"}{" "}
                  <Link className="font-semibold text-stone-950 hover:text-stone-700 hover:underline underline-offset-4" to={button.link}>
                    {button.text}
                  </Link>
                </p>
              )}
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

export default AuthLayout;
