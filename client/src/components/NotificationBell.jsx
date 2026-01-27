// NotificationBell.jsx - Interactive notification bell with glassmorphic dropdown
import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, Heart, X, ExternalLink, UserPlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import NotificationToast from './NotificationToast';

const NotificationBell = ({ user, socket }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [liveNotification, setLiveNotification] = useState(null);
    const [isShaking, setIsShaking] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setHasUnread(response.data.some(n => !n.isRead));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds as backup
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Real-time Socket.IO listener
    useEffect(() => {
        if (!user) return;

        // Use socket prop or get from global
        const activeSocket = socket || getSocket();

        if (!activeSocket) {
            console.log('[Socket.IO] NotificationBell: No socket available yet');
            return;
        }

        console.log('[Socket.IO] NotificationBell using socket:', activeSocket.id || 'connecting...');

        const handleNewNotification = (notification) => {
            console.log('[Socket.IO] New notification received:', notification);

            // Show live popup
            setLiveNotification(notification);

            // Shake the bell
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 1000);

            // Add to list and set unread
            setNotifications(prev => [notification, ...prev]);
            setHasUnread(true);

            // Auto-dismiss popup after 4 seconds
            setTimeout(() => {
                setLiveNotification(null);
            }, 4000);
        };

        const handleRemoveNotification = (notificationId) => {
            console.log('[Socket.IO] Removing notification:', notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));

            // If it was the live one, hide it
            setLiveNotification(prev => (prev && prev._id === notificationId ? null : prev));
        };

        const registerListeners = () => {
            activeSocket.on('new_notification', handleNewNotification);
            activeSocket.on('remove_notification', handleRemoveNotification);
            console.log('[Socket.IO] Listener registered for user:', user._id);
        };

        // Register listeners immediately if connected
        if (activeSocket.connected) {
            registerListeners();
        }

        // Also register on connect (handles reconnection)
        activeSocket.on('connect', registerListeners);

        return () => {
            activeSocket.off('new_notification', handleNewNotification);
            activeSocket.off('remove_notification', handleRemoveNotification);
            activeSocket.off('connect', registerListeners);
            console.log('[Socket.IO] Listener unregistered');
        };
    }, [user, socket]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = async () => {
        if (!showDropdown && hasUnread) {
            try {
                await api.patch('/notifications/read');
                setHasUnread(false);
                // Mark local state as read
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error('Failed to mark notifications as read:', error);
            }
        }
        setShowDropdown(!showDropdown);
    };

    const formatTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now - past) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Live Notification Toast */}
            <AnimatePresence>
                {liveNotification && (
                    <NotificationToast
                        notification={liveNotification}
                        onClose={() => setLiveNotification(null)}
                    />
                )}
            </AnimatePresence>

            {/* Bell Button */}
            <motion.button
                onClick={toggleDropdown}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isShaking ? {
                    rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
                    transition: { duration: 0.8 }
                } : {}}
                className="relative p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none"
            >
                <Bell size={20} className={showDropdown ? 'text-indigo-500' : ''} />

                {/* Bright Yellow Dot */}
                <AnimatePresence>
                    {hasUnread && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                boxShadow: [
                                    "0 0 0px rgba(250,204,21,0)",
                                    "0 0 12px rgba(250,204,21,0.6)",
                                    "0 0 0px rgba(250,204,21,0)"
                                ]
                            }}
                            transition={{
                                boxShadow: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 border-2 border-white dark:border-gray-900 rounded-full"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute right-0 mt-3 w-80 max-h-[450px] overflow-hidden rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full font-medium">
                                    {notifications.length}
                                </span>
                                {notifications.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            try {
                                                await api.delete('/notifications/all');
                                                setNotifications([]);
                                                toast.success('All notifications cleared');
                                            } catch (err) {
                                                console.error('Clear all error details:', {
                                                    message: err.message,
                                                    response: err.response?.data,
                                                    status: err.response?.status,
                                                    url: err.config?.url
                                                });
                                                toast.error(`Failed: ${err.response?.data?.message || err.message}`);
                                            }
                                        }}
                                        className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full font-bold hover:bg-red-500/30 transition-colors cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        <motion.div
                            className="overflow-y-auto flex-grow custom-scrollbar"
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                        >
                            {notifications.length > 0 ? (
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            layout
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 30, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className="bg-transparent"
                                        >
                                            <Link
                                                to={notification.blog?._id ? `/blog/${notification.blog._id}` : `/profile/${notification.sender?._id}`}
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border-b border-gray-100 dark:border-white/10 last:border-0 relative group"
                                            >
                                                <div className="flex-shrink-0 mt-1">
                                                    {notification.type === 'like' ? (
                                                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                                                            <Heart size={14} fill="currentColor" />
                                                        </div>
                                                    ) : notification.type === 'follow' ? (
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <UserPlus size={14} />
                                                        </div>
                                                    ) : notification.type === 'unfollow' ? (
                                                        <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500">
                                                            <UserPlus size={14} className="opacity-50" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                            <MessageSquare size={14} fill="currentColor" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                        <span className="font-bold">{notification.sender?.name}</span>
                                                        {notification.type === 'like' ? ' liked your story ' :
                                                            notification.type === 'comment' ? ' commented on ' :
                                                                notification.type === 'follow' ? ' started following you' :
                                                                    ' unfollowed you'}
                                                        {notification.blog && (
                                                            <span className="font-medium text-indigo-600 dark:text-indigo-400 italic"> "{notification.blog.title}"</span>
                                                        )}
                                                    </p>
                                                    {notification.content && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                                                            "{notification.content}"
                                                        </p>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 mt-2 block font-medium uppercase tracking-wider">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        try {
                                                            await api.delete(`/notifications/${notification._id}`);
                                                            setNotifications(prev => prev.filter(n => n._id !== notification._id));
                                                        } catch (err) {
                                                            toast.error('Failed to delete');
                                                        }
                                                    }}
                                                    className="flex-shrink-0 p-1.5 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Bell size={20} />
                                    </div>
                                    <p className="text-sm text-gray-400">No notifications yet</p>
                                </div>
                            )}
                        </motion.div>

                        <div className="p-3 border-t border-gray-100 dark:border-white/10 text-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fetchNotifications();
                                }}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
                            >
                                Refresh
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
