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

                <div className="p-4 flex items-start gap-4">
                    {/* Avatar with Badge */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-sm">
                            {notification.sender?.profilePicture ? (
                                <img src={notification.sender.profilePicture} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {notification.sender?.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <motion.div
                            className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {getIcon()}
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0 pt-1">
                        <p className="text-sm text-gray-900 dark:text-white leading-snug">
                            <span className="font-bold text-gray-900 dark:text-white">{notification.sender?.name}</span>
                            <span className="text-gray-600 dark:text-gray-300"> {getMessage()}</span>
                        </p>
                        {notification.blog?.title && (
                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                                "{notification.blog.title}"
                            </p>
                        )}
                        {notification.content && notification.type === 'comment' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                                "{notification.content}"
                            </p>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 -mr-2 -mt-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* View action */}
                {(notification.blog?._id || notification.type === 'follow' || notification.type === 'unfollow') && (
                    <Link
                        to={notification.blog?._id ? `/blog/${notification.blog.slug || notification.blog._id}` : `/profile/${notification.sender?._id}`}
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
