import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { API, getFileUrl } from '../api/api';

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const result = await API.notifications.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.count);
      }
    } catch (error) { }
  };

  const fetchRecentNotifications = async () => {
    try {
      const result = await API.notifications.getMy();
      if (result.success) {
        setNotifications(result.data.slice(0, 5));
      }
    } catch (error) { }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.notifications.markAsRead(id);
      fetchUnreadCount();
      fetchRecentNotifications();
    } catch (error) { }
  };

  useEffect(() => {
    fetchUnreadCount();
    if (showNotifications) {
      fetchRecentNotifications();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const displayName = user?.profile?.full_name || user?.username;

  return (
    <header className="px-8 py-4 sticky top-0 z-20 bg-white backdrop-blur-md flex justify-end">
      <div className="flex items-center space-x-5">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#FDFDFF] text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-0 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
                <span className="font-bold">Notifications</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.notification_id || n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative ${!n.is_read ? 'bg-purple-50/30' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 mb-0.5">{n.title || 'Notification'}</p>
                          <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.notification_id || n.id)}
                          className="absolute top-4 right-4 text-[10px] text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>

              <Link
                to="/announcements"
                onClick={() => setShowNotifications(false)}
                className="block p-3 text-center text-xs font-bold text-purple-600 hover:bg-purple-50 transition-colors"
              >
                View All Announcements
              </Link>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 pl-5 border-l border-slate-200 hover:opacity-80 transition-all group"
          >
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-100 group-hover:scale-105 transition-transform overflow-hidden">
              {user?.profile?.profile_photo ? (
                <img src={getFileUrl(user.profile.profile_photo)} alt="" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">{displayName}</p>
              <p className="text-[10px] text-purple-600 capitalize font-bold tracking-wider">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors mx-2 rounded-xl group"
              >
                <User size={18} className="text-slate-400 group-hover:text-purple-500" />
                <span className="font-semibold">My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors mx-2 rounded-xl group"
              >
                <Settings size={18} className="text-slate-400 group-hover:text-purple-500" />
                <span className="font-semibold">Settings</span>
              </Link>

              <div className="h-px bg-slate-50 my-1 mx-4"></div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mx-2 rounded-xl group"
              >
                <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                <span className="font-bold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}