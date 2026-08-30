import { useEffect, useRef, useState } from 'react';
import {
  IoClose,
  IoNotificationsOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoTicketOutline,
  IoCompassOutline,
  IoCalendarClearOutline,
  IoCalendarOutline,
  IoSparkles,
  IoAddOutline,
  IoSunnyOutline,
  IoMoonOutline
} from './icons';
import { RiMenu3Line } from './icons';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import LogoutLogic from '../Logic/UserLogic.js/Logout.logic';
import { useUser } from '../context/userContext';
import { useNotifications } from '../context/notificationContext';
import { useTheme } from '../context/themeContext';

function useNepalClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kathmandu',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function Navbar() {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { userInfo } = useUser();
  const { unreadNotifications } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { logout } = LogoutLogic();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const time = useNepalClock();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const fullName =
    userInfo?.fullName ||
    userInfo?.full_name ||
    userInfo?.name ||
    [userInfo?.firstName || userInfo?.first_name, userInfo?.lastName || userInfo?.last_name]
      .filter(Boolean)
      .join(' ') ||
    userInfo?.email?.split('@')?.[0] ||
    '';
  const initials = fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'U';

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const links = [
    {
      title: 'Events',
      link: '/dashboard/events?filter=total',
      icon: <IoTicketOutline />,
      show: !!token
    },
    {
      title: 'Calendars',
      link: '/dashboard/calendars',
      icon: <IoCalendarOutline />,
      show: !!token
    },
    { title: 'My RSVPs', link: '/my-rsvps', icon: <IoCalendarClearOutline />, show: !!token },
    { title: 'Discover', link: '/explore', icon: <IoCompassOutline />, show: true }
  ];

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-stone-900 dark:text-white bg-stone-100 dark:bg-transparent'
        : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
    }`;

  const iconBtn =
    'w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:text-white/70 dark:hover:bg-white/10 transition-colors';

  return (
    <nav className="w-full bg-white/85 dark:bg-[#0b0b0d]/85 backdrop-blur-md border-b border-stone-200/60 dark:border-white/10 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-5">
            <Link
              to={token ? '/dashboard/events?filter=total' : '/'}
              className="text-lg text-primary dark:text-white"
            >
              <IoSparkles className="text-accent" />
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {links
                .filter((l) => l.show)
                .map((l) => (
                  <NavLink key={l.title} to={l.link} className={linkClass}>
                    {l.icon} {l.title}
                  </NavLink>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-stone-400 dark:text-white/40 tabular-nums">
              {time} GMT+5:45
            </span>

            <button
              onClick={toggleTheme}
              className={iconBtn}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
              {theme === 'dark' ? (
                <IoSunnyOutline className="text-lg" />
              ) : (
                <IoMoonOutline className="text-lg" />
              )}
            </button>

            {token ? (
              <>
                <Link
                  to="/dashboard/create"
                  className="hidden sm:inline text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-white/80 dark:hover:text-white transition-colors"
                >
                  Create Event
                </Link>
                <Link
                  to="/dashboard/notifications"
                  className={`relative ${iconBtn}`}
                  title="Notifications"
                >
                  <IoNotificationsOutline className="text-lg" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-accent text-secondary rounded-full text-[9px] font-bold flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="w-8 h-8 rounded-full overflow-hidden bg-stone-700 text-white text-xs font-bold flex items-center justify-center ring-1 ring-black/5 dark:bg-stone-200 dark:text-stone-950 dark:ring-white/20"
                  >
                    {userInfo?.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#151517] rounded-xl border border-stone-200 dark:border-white/10 shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-stone-100 dark:border-white/10">
                        <p className="text-sm font-semibold text-stone-800 dark:text-white truncate">
                          {fullName}
                        </p>
                        <p className="text-xs text-stone-400 dark:text-white/40 truncate">
                          {userInfo?.email || ''}
                        </p>

                      </div>
                      {[
                        {
                          label: 'Create Event',
                          icon: <IoAddOutline />,
                          to: '/dashboard/create',
                          cls: 'sm:hidden'
                        },
                        { label: 'Account', icon: <IoPersonOutline />, to: '/dashboard/account' }
                      ].map((it) => (
                        <button
                          key={it.label}
                          onClick={() => {
                            setMenuOpen(false);
                            navigate(it.to);
                          }}
                          className={`${it.cls || ''} w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 dark:text-white/80 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors`}
                        >
                          {it.icon} {it.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <IoLogOutOutline /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <NavLink
                  to="/auth/login"
                  className="text-sm text-stone-600 hover:text-stone-900 dark:text-white/70 dark:hover:text-white transition-colors"
                >
                  Login
                </NavLink>
                <Link
                  to="/auth/signup"
                  className="px-4 py-1.5 rounded-full bg-primary text-white dark:bg-white/10 dark:border dark:border-white/15 text-sm font-medium hover:bg-emerald-600 dark:hover:bg-white/20 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={() => setToggleMenu(!toggleMenu)}
              className="lg:hidden text-stone-700 dark:text-white/80 w-9 h-9 flex items-center justify-center"
            >
              {toggleMenu ? <IoClose size={22} /> : <RiMenu3Line size={22} />}
            </button>
          </div>
        </div>
      </div>

      {toggleMenu && (
        <div className="lg:hidden border-t border-stone-200 dark:border-white/10 bg-white dark:bg-[#0b0b0d] px-4 py-4 flex flex-col gap-1">
          {links
            .filter((l) => l.show)
            .map((l) => (
              <NavLink
                key={l.title}
                to={l.link}
                onClick={() => setToggleMenu(false)}
                className={linkClass}
              >
                {l.icon} {l.title}
              </NavLink>
            ))}
          {!token && (
            <>
              <NavLink to="/auth/login" onClick={() => setToggleMenu(false)} className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/auth/signup" onClick={() => setToggleMenu(false)} className={linkClass}>
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
