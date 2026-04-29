import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BackBtn from "../components/BackBtn";
import Brand from "../components/Brand";
import Splash from "../assets/images/pattern1.jpg";

function AuthLayout() {
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");
  const button = {
    text: pathname.includes("login") ? "Sign Up" : "Login",
    link: pathname.includes("login") ? "/auth/signup" : "/auth/login",
  };
  const pageTitle = pathname.includes("login")
    ? "Sign in"
    : "Create an account";
  return (
    <div className="p-4 min-h-screen grid md:grid-cols-2 text-stone-800">
      <div>
        {!token && <BackBtn to={"/"} />}
        <div className="flex flex-col items-center md:items-start md:h-full justify-center p-8 md:p-16 gap-4">
          <Brand size={"w-16 md:hidden"} />
          <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
          <Outlet />
          {!token && (
            <p className="text-sm text-stone-500">
              {pageTitle === "Sign in" ? (
                <>
                  New to Mahotsav? Create an account{" "}
                  <Link className="font-medium text-primary hover:underline" to={button?.link}>
                    here
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link className="font-medium text-primary hover:underline" to={button.link}>
                    Login
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
      </div>
      <div
        className="rounded-2xl hidden md:block relative p-4 overflow-hidden"
        style={{
          backgroundImage: `url(${Splash})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
        {!token && (
          <Link
            to={button.link}
            className="absolute bg-white text-secondary p-4 py-2 rounded-lg text-sm font-semibold top-4 right-4 z-10"
          >
            {button.text}
          </Link>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-8">
          <h3 className="text-2xl font-bold">Welcome to Mahotsav</h3>
          <p className="mt-2 text-sm text-white/70 max-w-xs">
            Your campus events, simplified. Create, manage, and celebrate with ease.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
