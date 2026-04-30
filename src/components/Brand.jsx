import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/mahotsav_logo.png";

function Brand({ size }) {
  const { pathname } = useLocation();

  return (
    <Link
      title="Home"
      className={`font-extrabold gap-3 capitalize inline-flex items-center ${
        (pathname.includes("dashboard") || pathname.includes("auth"))
          ? "text-primary text-3xl"
          : "text-3xl"
      } font-geist`}
      to={"/"}
    >
      <img
        alt="Logo"
        className={size ?? "w-12"}
        src={Logo}
      />
      <span
        className={
          pathname.includes("dashboard") || pathname.includes("auth")
            ? "hidden"
            : "block"
        }
      >
        Mahotsav
      </span>
    </Link>
  );
}

export default Brand;
