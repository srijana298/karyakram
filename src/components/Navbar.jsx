import { useEffect, useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";
import { RiMenu3Line } from "react-icons/ri";
import { NavLink } from "react-router-dom";
import LogoutLogic from "../Logic/UserLogic.js/Logout.logic";
import Brand from "./Brand";

function Navbar() {
  const [toggleMenu, setToggleMenu] = useState(false);

  const [navData, setNavData] = useState([]);

  let token = localStorage.getItem("token");

  useEffect(() => {
    setNavData((prev) => [
      { title: "Explore", link: "/explore", show: true },
      { title: "Dashboard", link: "/dashboard", show: token ? true : false },
      { title: "Login", link: "/auth/login", show: token ? false : true },
      { title: "Signup", link: "/auth/signup", show: token ? false : true },
    ]);
  }, [token]);

  const { logout } = LogoutLogic();

  return (
    <div className="app">
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200/60 text-sm sticky top-0 z-50">
        <div className="container">
          <div className="flex mx-auto justify-between">
            <div className="flex items-center justify-between w-full gap-16 my-4">
              <div>
                <Brand />
              </div>
              <div className="hidden lg:flex items-center gap-1">
                {navData?.map(
                  (item, index) =>
                    item.show && (
                      <NavLink
                        onClick={() => setToggleMenu((prev) => false)}
                        key={index}
                        to={item.link}
                        className={({ isActive }) =>
                          `px-4 py-2 rounded-lg font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                          }`
                        }
                      >
                        {item.title}
                      </NavLink>
                    )
                )}
                {token && (
                  <button
                    onClick={logout}
                    className="ml-2 px-4 py-2 rounded-lg font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="lg:hidden flex items-center">
                <button onClick={() => setToggleMenu(!toggleMenu)} className="text-stone-700">
                  {toggleMenu ? <IoClose size={24} /> : <RiMenu3Line size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile navigation */}
        <div
          className={`fixed z-40 w-full bg-white/95 backdrop-blur-md overflow-hidden flex flex-col lg:hidden gap-8 origin-top duration-500 font-sans border-b border-stone-200 ${
            !toggleMenu ? "h-0 border-0" : "h-full"
          }`}
        >
          <div className="px-8 py-6">
            <div className="flex flex-col gap-2">
              {navData?.map(
                (item, index) =>
                  item.show && (
                    <NavLink
                      onClick={() => setToggleMenu((prev) => false)}
                      key={index}
                      to={item.link}
                      className="px-4 py-3 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      {item.title}
                    </NavLink>
                  )
              )}
              {token && (
                <button
                  className="px-4 py-3 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-100 transition-colors text-left"
                  onClick={logout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
