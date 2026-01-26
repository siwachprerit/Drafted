import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function FollowListModal({ isOpen, onClose, userId, initialTab = 'followers', currentUser, onAction }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'followers' or 'following'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            fetchList(initialTab);
        }
    }, [isOpen, initialTab, userId]);

    useEffect(() => {
        if (isOpen) {
            fetchList(activeTab);
        }
    }, [activeTab]);

    const fetchList = async (type) => {
        setLoading(true);
        try {
            const response = await api.get(`/users/${userId}/${type}`);
            setUsers(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (targetUser) => {
        if (!currentUser) return; // Should not happen if protected

        try {
            const res = await api.post(`/users/${targetUser._id}/follow`);
            const isNowFollowing = res.data.isFollowing;

            setUsers(prevUsers => prevUsers.map(u => {
                if (u._id === targetUser._id) {
                    return { ...u, isFollowing: isNowFollowing };
                }
                return u;
            }));

            // Optional: If un-following in "Following" tab, keep it until refresh or remove immediately?
            // "next times we open list that user goes away only current following shows"
            // So we keep it in state for now, but update UI

            if (onAction) {
                onAction(targetUser._id, isNowFollowing);
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-[#0f1117] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[600px]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('followers')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'followers' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Followers
                        </button>
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'following' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Following
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 font-display text-sm">
                            No {activeTab} yet.
                        </div>
                    ) : (
                        users.map(userItem => (
                            <div key={userItem._id} className="flex items-center justify-between">
                                <Link to={`/profile/${userItem._id}`} onClick={onClose} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-white/10">
                                        {userItem.profilePicture ? (
                                            <img src={userItem.profilePicture} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                {userItem.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{userItem.name}</span>
                                        <span className="text-xs text-gray-500">@{userItem.username}</span>
                                    </div>
                                </Link>

                                {/* Follow/Unfollow Button - Only for Following tab OR if we enable follow back in followers tab */}
                                {activeTab === 'following' && (
                                    <button
                                        onClick={() => handleFollowToggle(userItem)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all w-24 border ${userItem.isFollowing
                                            ? 'bg-transparent border-gray-200 dark:border-white/20 text-gray-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-400/50 group/btn'
                                            : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                                            }`}
                                    >
                                        {userItem.isFollowing ? (
                                            <>
                                                <span className="group-hover/btn:hidden">Following</span>
                                                <span className="hidden group-hover/btn:inline">Unfollow</span>
                                            </>
                                        ) : (
                                            'Follow'
                                        )}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default FollowListModal;
