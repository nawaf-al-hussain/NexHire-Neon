import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Smartphone, Calendar, Briefcase, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const PushNotifications = ({ notifications: initialNotifications, loading: initialLoading, onRefresh, showHeader = true }) => {
    const { toast } = useToast();
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(true);
 const [deviceToken, setDeviceToken] = useState(null);
 const [registered, setRegistered] = useState(false);

 useEffect(() => {
 if (initialNotifications) {
 setNotifications(initialNotifications);
 setLoading(initialLoading || false);
 } else {
 fetchNotifications();
 }
 }, [initialNotifications, initialLoading]);

 const fetchNotifications = async () => {
 try {
 setLoading(true);
 const res = await axios.get(`${API_BASE}/candidates/notifications`);
 setNotifications(res.data);
 } catch (err) {
 console.error("Fetch Notifications Error:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleRegisterDevice = async () => {
 try {
 // Generate a simple device token (in production, use proper push service)
 const token = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 setDeviceToken(token);

 await axios.post(`${API_BASE}/candidates/notifications/register-device`, {
 deviceToken: token,
 platform: 'web',
 deviceType: 'browser'
 });
 setRegistered(true);
 toast("Device registered.");
 } catch (err) {
 console.error("Register Device Error:", err);
 toast("Failed to register device for notifications.");
 }
 };

 const handleMarkAsRead = async (notificationIDs) => {
 try {
 await axios.post(`${API_BASE}/candidates/notifications/mark-read`, {
 notificationIDs: notificationIDs
 });
 fetchNotifications();
 if (onRefresh) onRefresh();
 } catch (err) {
 console.error("Mark Read Error:", err);
 }
 };

 const handleMarkAllAsRead = async () => {
 try {
 await axios.post(`${API_BASE}/candidates/notifications/mark-read`, {});
 fetchNotifications();
 if (onRefresh) onRefresh();
 } catch (err) {
 console.error("Mark All Read Error:", err);
 }
 };

 const getNotificationIcon = (type) => {
 switch (type) {
 case 'Interview':
 return <Calendar className="w-5 h-5 text-[var(--accent)]" />;
 case 'JobMatch':
 case 'JobAlert':
 return <Briefcase className="w-5 h-5 text-[var(--success)]" />;
 case 'Application':
 return <TrendingUp className="w-5 h-5 text-[var(--accent)]" />;
 case 'Reminder':
 return <AlertCircle className="w-5 h-5 text-[var(--warning)]" />;
 default:
 return <Bell className="w-5 h-5 text-[var(--text-muted)]" />;
 }
 };

 const formatTimeAgo = (dateString) => {
 const date = new Date(dateString);
 const now = new Date();
 const diffMs = now - date;
 const diffMins = Math.floor(diffMs / 60000);
 const diffHours = Math.floor(diffMs / 3600000);
 const diffDays = Math.floor(diffMs / 86400000);

 if (diffMins < 1) return 'Just now';
 if (diffMins < 60) return `${diffMins}m ago`;
 if (diffHours < 24) return `${diffHours}h ago`;
 if (diffDays < 7) return `${diffDays}d ago`;
 return date.toLocaleDateString();
 };

 const unreadCount = notifications.filter(n => !n.IsRead).length;

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
 <p className="text-xs font-semibold text-[var(--text-muted)]">Loading notifications...</p>
 </div>
 );
 }

 return (
 <div className="p-4">
 {showHeader && (
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="relative">
 <Bell className="w-6 h-6 text-[var(--accent)]" />
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
 {unreadCount}
 </span>
 )}
 </div>
 <h2 className="text-lg sm:text-xl font-semibold">Notifications</h2>
 </div>
 <div className="flex items-center gap-3">
 {unreadCount > 0 && (
 <button
 onClick={handleMarkAllAsRead}
 className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-xl text-xs font-bold hover:bg-[var(--bg-primary)] transition-colors"
 >
 <CheckCheck className="w-4 h-4" />
 Mark all read
 </button>
 )}
 <button
 onClick={handleRegisterDevice}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${registered
 ? 'bg-[var(--success)]/10 border border-emerald-500/20 text-[var(--success)]'
 : 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]'
 }`}
 >
 <Smartphone className="w-4 h-4" />
 {registered ? 'Device Registered' : 'Enable Push'}
 </button>
 </div>
 </div>
 )}

 {/* Notifications List */}
 {notifications.length === 0 ? (
 <div className="text-center py-8 border-2 border-dashed border-[var(--border-primary)] rounded-xl">
 <Bell className="w-10 h-10 text-[var(--text-muted)] opacity-20 mx-auto mb-2" />
 <p className="text-xs font-bold text-[var(--text-muted)]">No notifications yet</p>
 </div>
 ) : (
 <div className="space-y-2">
 {notifications.map((notification) => (
 <div
 key={notification.NotificationID}
 className={`p-3 rounded-xl border transition-all cursor-pointer ${notification.IsRead
 ? 'bg-[var(--bg-accent)] border-[var(--border-primary)] hover:border-[var(--accent)]'
 : 'bg-[var(--accent)]/5 border-[var(--accent)] hover:border-[var(--accent)]'
 }`}
 onClick={() => !notification.IsRead && handleMarkAsRead([notification.NotificationID])}
 >
 <div className="flex items-start gap-3">
 <div className={`p-2 rounded-lg ${notification.IsRead ? 'bg-[var(--bg-primary)]' : 'bg-[var(--accent)]/10'}`}>
 {getNotificationIcon(notification.NotificationType)}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <h4 className={`font-bold text-xs ${!notification.IsRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
 {notification.Title}
 </h4>
 <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
 {formatTimeAgo(notification.CreatedAt)}
 </span>
 </div>
 <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
 {notification.Message}
 </p>
 {notification.JobTitle && (
 <p className="text-xs font-bold text-[var(--accent)] mt-1">
 📌 {notification.JobTitle}
 </p>
 )}
 </div>
 {!notification.IsRead && (
 <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-1"></div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Notification Preferences Info */}
 <div className="mt-4 p-3 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-primary)]">
 <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
 <Bell className="w-3 h-3 text-[var(--accent)]" />
 Notification Settings
 </h4>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>
 <span className="text-[var(--text-muted)]">Interview Updates</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>
 <span className="text-[var(--text-muted)]">Job Matches</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>
 <span className="text-[var(--text-muted)]">Application Status</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-[var(--warning)] rounded-full"></div>
 <span className="text-[var(--text-muted)]">Reminders</span>
 </div>
 </div>
 </div>
 </div>
 );
};

export default PushNotifications;
