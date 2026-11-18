import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiClock,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';

const NotificationsPage = () => {
  const { fetchUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications/');
      setNotifications(res.data.results || res.data || []);
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notif) => {
    if (notif.is_read) return;
    try {
      await api.patch(`/api/notifications/${notif.id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      fetchUnreadCount();
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim_received':
        return <FiShield className="w-5 h-5 text-amber-600" />;
      case 'claim_accepted':
        return <FiCheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'claim_rejected':
        return <FiAlertCircle className="w-5 h-5 text-rose-600" />;
      case 'item_resolved':
        return <FiCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <FiBell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time updates regarding claims, inquiries, and status changes for your items.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <FiCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n)}
              className={`p-5 sm:p-6 transition-colors flex items-start gap-4 ${
                !n.is_read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                {getNotificationIcon(n.notification_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {n.message}
                </p>

                {n.item && (
                  <div className="mt-3">
                    <Link
                      to={`/items/${n.item}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>View Item Details</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400">
            <FiBell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-sm">No notifications found.</p>
            <p className="text-xs text-slate-400 mt-1">
              You will receive alerts when someone interacts with your reported items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
