import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IoCalendarClearOutline,
  IoHomeOutline,
  IoLayersOutline,
  IoLogOutOutline,
  IoNotificationsOutline,
  IoPersonOutline,
  IoSearchOutline,
} from "./icons";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import LogoutLogic from '../Logic/UserLogic.js/Logout.logic';
import { authService } from '../services/auth';
import { useNotifications } from '../context/notificationContext';
import { useUser } from '../context/userContext';

function Sidebar() {
  const { logout } = LogoutLogic();
  const { userInfo, setUserInfo } = useUser();
  const { unreadNotifications } = useNotifications();
  const navigate = useNavigate();

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

  const token = localStorage.getItem('token');

  const { data: me, isError } = useQuery({
    queryKey: ['me'],
    enabled: !!token,
    queryFn: async () => {
      const res = await authService.getMe();
      if (!res.ok) throw new Error(res.error || 'Failed to load user');
      return res.data;
    },
  });

  useEffect(() => {
    if (!me) return;
    localStorage.setItem('Mahotsav-user', JSON.stringify(me));
    setUserInfo(me);
  }, [me, setUserInfo]);

  useEffect(() => {
    if (!isError) return;
    localStorage.removeItem('Mahotsav-user');
    localStorage.removeItem('token');
    navigate('/');
  }, [isError, navigate]);

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#edf3ee] text-[#1f6d3d] border border-[#d8e6da]'
        : 'text-dashboard-muted hover:bg-dashboard-active hover:text-dashboard-text'
    }`;

  return (
    <aside className="flex flex-col w-72 shrink-0 border-r border-dashboard-border bg-dashboard-panel h-full">
      <div className="px-5 h-[72px] border-b border-dashboard-border flex items-center">
        <Link to="/" className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-dashboard-text">
          <img src="/logo192.png" alt="Logo" className="w-10 h-10 rounded" />
          Mahotsav
        </Link>
      </div>

      <div className="p-2 border-b border-dashboard-border">
        <div className="flex items-center gap-2 h-9 bg-white border border-dashboard-border rounded-md px-2.5">
          <IoSearchOutline className="text-stone-400 text-[15px] shrink-0" />
          <input
            placeholder="Search"
            className="bg-transparent outline-none text-sm leading-none h-full flex-1 placeholder:text-stone-400"
          />
          <span className="ml-auto mr-2 h-6 inline-flex items-center whitespace-nowrap leading-none text-[10px] font-semibold text-stone-500 border border-stone-300 rounded px-1.5">
            ⌘K
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 flex flex-col gap-1 overflow-auto">
        <p className="text-xs font-medium text-dashboard-subtle px-1 mb-1">Main Menu</p>
        <NavLink className={linkClass} to="/dashboard" end>
          <IoHomeOutline className="text-[18px]" /> Home
        </NavLink>
        <NavLink className={linkClass} to="events?filter=total">
          <IoCalendarClearOutline className="text-[18px]" /> Events
        </NavLink>

        {/* Any member can organize events & groups */}
        <NavLink className={linkClass} to="groups">
          <IoLayersOutline className="text-[18px]" /> Groups
        </NavLink>

        <NavLink className={linkClass} to="notifications">
          <div className="relative">
            <IoNotificationsOutline className="text-[18px]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-accent text-secondary rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </div>
          Notifications
        </NavLink>

      </nav>

      <div className="p-2 border-t border-dashboard-border">
        <div className="bg-white border border-dashboard-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-900 text-white flex items-center justify-center text-xs font-bold uppercase">
            {userInfo?.avatar ? <img src={userInfo.avatar} alt={`${fullName || 'User'} avatar`} className="w-full h-full object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dashboard-text truncate">
              {fullName}
            </p>
            <p className="text-[11px] text-dashboard-muted truncate">{userInfo?.email || ''}</p>
          </div>

          <NavLink
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-dashboard-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            to="account"
            title="Account"
          >
            <IoPersonOutline className="text-[18px]" />
          </NavLink>
        </div>

        <button
          className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-dashboard-muted hover:bg-red-50 hover:text-red-500 transition-colors"
          onClick={logout}
        >
          <IoLogOutOutline className="text-lg" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
