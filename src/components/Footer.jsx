import React from "react";
import { Link, NavLink } from "react-router-dom";
import Brand from "./Brand";
import { footerLinks } from "../static/footerLinks";

function Footer() {
  return (
    <div className="flex flex-col gap-6 py-12 bg-stone-900 text-stone-300 font-sans">
      <div className="w-full flex flex-row items-start uppercase gap-4 justify-between container">
        <div className="flex flex-col items-start gap-2">
          <Brand />
        </div>
        <ul className="flex flex-col items-start gap-2">
          <NavLink className="font-light text-sm normal-case hover:text-white transition-colors" to={"/explore"}>
            Explore
          </NavLink>
          <NavLink className="font-light text-sm normal-case hover:text-white transition-colors" to={`/dashboard`}>
            Dashboard
          </NavLink>
        </ul>
      </div>
      <hr className="bg-stone-700 border-stone-700 opacity-100"></hr>
      <ul className="md:w-full flex flex-row flex-wrap items-center justify-center gap-3">
        {footerLinks.map((link, index) => (
          <li className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 p-2.5 text-xl hover:text-white transition-all">
            <Link
              className=""
              target={"_blank"}
              to={link.link}
              title={link.title}
            >
              {link.icon}
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-stone-500 text-xs md:text-sm text-center">
          &copy; Mahotsav {new Date().getFullYear()} | All rights reserved
        </p>
      </div>
    </div>
  );
}

export default Footer;
