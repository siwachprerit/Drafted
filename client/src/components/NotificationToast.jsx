// NotificationToast.jsx - Animated toast for real-time notifications
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationToast = ({ notification, onClose, onAnimationComplete }) => {
    if (!notification) return null;

    const getIcon = () => {
        switch (notification.type) {
            case 'like':
                return <Heart size={18} fill="currentColor" className="text-pink-500" />;
            case 'comment':
                return <MessageSquare size={18} fill="currentColor" className="text-indigo-500" />;
            case 'follow':
                return <UserPlus size={18} className="text-blue-500" />;
            case 'unfollow':
                return <UserPlus size={18} className="text-gray-500 opacity-50" />;
            default:
                return <Heart size={18} className="text-pink-500" />;
        }
    };

    const getMessage = () => {
        switch (notification.type) {
            case 'like':
                return 'liked your story';
            case 'comment':
                return 'commented on your story';
            case 'follow':
                return 'started following you';
            case 'unfollow':
                return 'unfollowed you';
            default:
                return 'interacted with you';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -100, x: 100, scale: 0.8 }}
            animate={{
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }
            }}
            exit={{
                opacity: 0,
                y: -20,
                x: 50,
                scale: 0.5,
                transition: { duration: 0.3 }
            }}
            onAnimationComplete={(definition) => {
                if (definition === 'exit' && onAnimationComplete) {
                    onAnimationComplete();
                }
            }}
            className="fixed top-24 right-6 z-[100] max-w-sm"
        >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
                {/* Animated gradient bar */}
                <motion.div
                    className="h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 4, ease: "linear" }}
                    style={{ transformOrigin: "left" }}
                />

                <div className="p-4 flex items-start gap-3">
                    {/* Icon with pulse */}
                    <motion.div
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
                        animate={{
                            scale: [1, 1.2, 1],
                            boxShadow: [
                                "0 0 0 0 rgba(139, 92, 246, 0)",
                                "0 0 0 10px rgba(139, 92, 246, 0.3)",
                                "0 0 0 0 rgba(139, 92, 246, 0)"
                            ]
                        }}
                        transition={{ duration: 1.5, repeat: 1 }}
                    >
                        {getIcon()}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white leading-snug">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{notification.sender?.name}</span>
                            {' '}{getMessage()}
                        </p>
                        {notification.blog?.title && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                "{notification.blog.title}"
                            </p>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* View action */}
                {(notification.blog?._id || notification.type === 'follow' || notification.type === 'unfollow') && (
                    <Link
                        to={notification.blog?._id ? `/blog/${notification.blog._id}` : `/profile/${notification.sender?._id}`}
                        onClick={onClose}
                        className="block px-4 py-2 bg-gray-50 dark:bg-white/5 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all uppercase tracking-wider"
                    >
                        {notification.blog?._id ? 'View Story' : 'View Profile'}
                    </Link>
                )}
            </div>
        </motion.div>
    );
};

export default NotificationToast;
