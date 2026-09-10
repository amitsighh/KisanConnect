import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const NotificationBell = () => {
  const { isAuthenticated, isFarmer } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if not authenticated
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      await API.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleRespond = async (notif, action) => {
    try {
      const res = await API.post('/notifications/respond', {
        notificationId: notif.id,
        action,
        poolId: notif.poolId,
        contributionQuantity: notif.suggestedQty || 50
      });

      if (res.data.success) {
        if (action === 'JOIN') {
          alert(res.data.message || 'Joined pool!');
        }
        fetchNotifications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process request.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition flex items-center justify-center"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <h3 className="font-extrabold">Notifications & Alerts</h3>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-400/30">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Bell size={24} className="mx-auto text-slate-300" />
                <p className="font-medium text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 space-y-2 transition ${
                    notif.isRead ? 'bg-white opacity-80' : 'bg-emerald-50/40 border-l-4 border-emerald-500 font-medium'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{notif.message}</p>

                  {/* Interactive Action Buttons for Pool Match */}
                  {notif.type === 'POOL_MATCH' && isFarmer && !notif.isRead && (
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(notif, 'JOIN')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1"
                      >
                        <Check size={12} /> JOIN POOL ({notif.suggestedQty || 50} kg)
                      </button>
                      <button
                        onClick={() => handleRespond(notif, 'IGNORE')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                      >
                        <X size={12} /> IGNORE
                      </button>
                    </div>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[10px] text-emerald-700 font-bold hover:underline block pt-1"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationBell;
