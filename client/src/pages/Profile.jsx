import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, PenTool, Sparkles, Star, Shield, ArrowRight, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import FollowListModal from '../components/FollowListModal';

function Profile({ user: currentUser }) {
    const { userId } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Follow Modal State
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followModalTab, setFollowModalTab] = useState('followers');

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const [userRes, blogsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/blogs?author=${userId}`)
            ]);
            setProfileUser(userRes.data.user);
            setBlogs(blogsRes.data);
            document.title = `${userRes.data.user.name} | Drafted`;
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) return toast.error('Sign in to follow');
        try {
            const res = await api.post(`/users/${userId}/follow`);
            setProfileUser(prev => {
                const isNowFollowing = res.data.isFollowing;
                // Since backend doesn't return count, update manually
                const currentCount = prev.followersCount || prev.followers?.length || 0;
                const newCount = isNowFollowing ? currentCount + 1 : Math.max(0, currentCount - 1);

                return {
                    ...prev,
                    isFollowing: isNowFollowing,
                    followersCount: newCount,
                    // Also update followers array if it exists to keep it consistent
                    followers: isNowFollowing
                        ? [...(prev.followers || []), currentUser._id]
                        : (prev.followers || []).filter(id => id !== currentUser._id)
                };
            });

            // Sync all blogs in the list to match the new follow state
            setBlogs(prev => prev.map(blog => ({
                ...blog,
                isFollowing: res.data.isFollowing
            })));

            toast.success(res.data.isFollowing ? `Followed ${profileUser.name}!` : `Unfollowed ${profileUser.name}`);
        } catch (err) {
            toast.error('Follow request failed');
        }
    };

    const handleLike = async (blogId, index) => {
        if (!currentUser) return toast.error('Sign in to like');
        try {
            const response = await api.post(`/blogs/${blogId}/like`);
            setBlogs(prev => prev.map((blog, i) =>
                i === index ? { ...blog, likes: response.data } : blog
            ));
        } catch (error) {
            toast.error('Failed to like');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );

    if (!profileUser) return (
        <div className="text-center py-20">
            <h2 className="text-2xl text-gray-900 dark:text-white">User not found</h2>
            <Link to="/feed" className="text-indigo-400 mt-4 inline-block">Back to Feed</Link>
        </div>
    );

    const isOwnProfile = currentUser?._id === profileUser._id;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Instagram Style Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center gap-12 mb-16 pt-8"
            >
                {/* Avatar Left */}
                <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 rounded-[42px] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[40px] overflow-hidden border-2 border-gray-200 dark:border-white/20 shadow-2xl bg-white dark:bg-gray-900">
                        {profileUser.profilePicture ? (
                            <img src={profileUser.profilePicture} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl font-heading italic text-white bg-gradient-to-br from-indigo-600 to-violet-700">
                                {profileUser.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Right */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8 mt-4">
                        <h1 className="text-4xl md:text-5xl font-heading italic font-medium text-gray-900 dark:text-white tracking-tight">
                            {profileUser.username}
                        </h1>
                        {!isOwnProfile && currentUser && (
                            <button
                                onClick={handleFollow}
                                className={`px-8 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 min-w-[120px] overflow-hidden group/follow ${profileUser.isFollowing
                                    ? 'bg-white/80 dark:bg-white/10 backdrop-blur-md border-gray-200 dark:border-white/20 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20'
                                    : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                                    }`}
                            >
                                <span className="relative z-10">
                                    {profileUser.isFollowing ? (
                                        <span className="group-hover/follow:hidden">Following</span>
                                    ) : (
                                        'Follow'
                                    )}
                                    {profileUser.isFollowing && (
                                        <span className="hidden group-hover/follow:inline">Unfollow</span>
                                    )}
                                </span>
                            </button>
                        )}
                        {isOwnProfile && (
                            <Link to="/account" className="px-8 py-2.5 bg-red-600 text-white border border-red-500 rounded-full font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                                Manage Account
                            </Link>
                        )}
                    </div>

                    <div className="flex justify-center md:justify-start gap-10 mb-8">
                        <div className="text-center md:text-left">
                            <span className="block text-2xl font-bold text-gray-900 dark:text-white">{blogs.length}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Posts</span>
                        </div>
                        <button
                            onClick={() => {
                                setFollowModalTab('followers');
                                setShowFollowModal(true);
                            }}
                            className="text-center md:text-left hover:opacity-80 transition-opacity"
                        >
                            <span className="block text-2xl font-bold text-gray-900 dark:text-white">{profileUser.followersCount || profileUser.followers?.length || 0}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Followers</span>
                        </button>
                        <button
                            onClick={() => {
                                setFollowModalTab('following');
                                setShowFollowModal(true);
                            }}
                            className="text-center md:text-left hover:opacity-80 transition-opacity"
                        >
                            <span className="block text-2xl font-bold text-gray-900 dark:text-white">{profileUser.followingCount || profileUser.following?.length || 0}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Following</span>
                        </button>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{profileUser.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400 font-display italic">Passionate storywriter on Drafted • Since 2026</p>
                    </div>
                </div>
            </motion.header>

            <div className="h-px w-full bg-gray-200 dark:bg-white/10 mb-16" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Blog Feed */}
                <div className="lg:col-span-7 space-y-8">
                    <h3 className="text-2xl font-heading italic text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                        <PenTool className="text-indigo-600 dark:text-indigo-400" /> Recent Stories
                    </h3>
                    <div className="space-y-8">
                        {blogs.length > 0 ? blogs.map((blog, idx) => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                user={currentUser}
                                onLike={() => handleLike(blog._id, idx)}
                                onFollow={(data) => {
                                    setProfileUser(prev => ({
                                        ...prev,
                                        isFollowing: data.isFollowing,
                                        isFollowing: data.isFollowing,
                                        followersCount: data.isFollowing
                                            ? (prev.followersCount || 0) + 1
                                            : Math.max(0, (prev.followersCount || 0) - 1)
                                    }));
                                }}
                                index={idx}
                            />
                        )) : (
                            <div className="p-12 text-center rounded-[32px] bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 border-dashed">
                                <p className="text-gray-500 italic">No public stories yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Premium Premium elements */}
                <aside className="lg:col-span-5 space-y-8">
                    {/* Contributor Card */}
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400">
                                    <Star size={22} />
                                </div>
                                <h4 className="font-heading italic text-xl text-gray-900 dark:text-white">Contributor Stats</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span className="text-sm text-gray-400">Appreciation</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-bold">{blogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0)} Likes</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <span className="text-sm text-gray-400">Reach</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-bold">{Math.floor(blogs.length * 12.5)} Reads</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-sm text-gray-400">Rank</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-bold flex items-center gap-1">Top 5% <Sparkles size={12} className="text-amber-400" /></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Community Active Widget */}
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                    <Users size={22} />
                                </div>
                                <h4 className="font-heading italic text-xl text-gray-900 dark:text-white">Active in</h4>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['Philosophy', 'Technology', 'Deep Dives', 'Future'].map(tag => (
                                <span key={tag} className="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-xs text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-[32px] p-8 text-center group">
                        <div className="mx-auto w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={32} />
                        </div>
                        <p className="text-gray-900 dark:text-white font-heading italic text-xl mb-2">Verified Storyteller</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Recognized for consistent high-quality contributions since Day 1.</p>
                    </div>
                </aside>
            </div>
            {/* Follow List Modal */}
            <AnimatePresence>
                {showFollowModal && profileUser && (
                    <FollowListModal
                        isOpen={showFollowModal}
                        onClose={() => setShowFollowModal(false)}
                        userId={profileUser._id}
                        initialTab={followModalTab}
                        currentUser={currentUser}
                        onAction={(targetId, isFollowing) => {
                            // If looking at own profile, update counts real-time
                            if (isOwnProfile) {
                                setProfileUser(prev => {
                                    // Logic depends on data structure (count vs array)
                                    // Profile page seems to rely on .followersCount and .followingCount (from followUser backend response?)
                                    // Or does it rely on .followers and .following arrays?
                                    // fetchProfileData uses /users/:id which returns user object.
                                    // getUserProfile in backend returns ...user.toObject(). User model has arrays.
                                    // But typically we render length.

                                    // If we are modifying MY following list:
                                    let newFollowingCount = prev.followingCount || prev.following?.length || 0;
                                    if (isFollowing) newFollowingCount++;
                                    else newFollowingCount = Math.max(0, newFollowingCount - 1);

                                    return {
                                        ...prev,
                                        followingCount: newFollowingCount,
                                        // Update array if it exists to be safe
                                        following: isFollowing ? [...(prev.following || []), targetId] : (prev.following || []).filter(id => id !== targetId)
                                    };
                                });
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default Profile;
