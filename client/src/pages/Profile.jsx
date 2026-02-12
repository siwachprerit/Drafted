import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, PenTool, Sparkles, Star, Shield, ArrowRight, TrendingUp, Heart, MessageCircle, Twitter, Linkedin, Globe, Instagram, X, Camera, LogOut } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import { formatDistanceToNow } from 'date-fns';
import FollowListModal from '../components/FollowListModal';

function Profile({ user: currentUser, setUser: setCurrentUser }) {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Follow Modal State
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followModalTab, setFollowModalTab] = useState('followers');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        profilePicture: '',
        coverImage: '',
        bio: '',
        socialLinks: { twitter: '', linkedin: '', instagram: '', website: '' }
    });

    // Account Settings & Upload State
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'account'
    const [accountForm, setAccountForm] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const fileInputRef = useRef({
        profile: null,
        cover: null
    });

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const userRes = await api.get(`/users/${userId}`);
            setProfileUser(userRes.data.user);
            setBlogs(userRes.data.blogs || []);
            document.title = `${userRes.data.user.name} | Drafted`;

            // Initialize edit form if it's the current user
            if (currentUser?._id === userRes.data.user._id) {
                setEditForm({
                    name: userRes.data.user.name || '',
                    bio: userRes.data.user.bio || '',
                    profilePicture: userRes.data.user.profilePicture || '',
                    coverImage: userRes.data.user.coverImage || '',
                    socialLinks: {
                        twitter: userRes.data.user.socialLinks?.twitter || '',
                        linkedin: userRes.data.user.socialLinks?.linkedin || '',
                        website: userRes.data.user.socialLinks?.website || '',
                        instagram: userRes.data.user.socialLinks?.instagram || ''
                    }
                });
            }
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
                const currentCount = prev.followersCount || prev.followers?.length || 0;
                const newCount = isNowFollowing ? currentCount + 1 : Math.max(0, currentCount - 1);

                return {
                    ...prev,
                    isFollowing: isNowFollowing,
                    followersCount: newCount,
                    followers: isNowFollowing
                        ? [...(prev.followers || []), currentUser._id]
                        : (prev.followers || []).filter(id => id !== currentUser._id)
                };
            });

            setBlogs(prev => prev.map(blog => ({
                ...blog,
                isFollowing: res.data.isFollowing
            })));

            toast.success(res.data.isFollowing ? `Followed ${profileUser.name}!` : `Unfollowed ${profileUser.name}`);
        } catch (err) {
            toast.error('Follow request failed');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/profile', {
                name: editForm.name,
                bio: editForm.bio,
                profilePicture: editForm.profilePicture,
                coverImage: editForm.coverImage,
                socialLinks: editForm.socialLinks
            });

            // Update local state
            setProfileUser(prev => ({ ...prev, ...res.data }));
            if (setCurrentUser) setCurrentUser(prev => ({ ...prev, ...res.data })); // Update global user state
            setShowEditModal(false);
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Failed to update profile');
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

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        const loadingToast = toast.loading('Uploading image...');

        try {
            // 1. Upload logic
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadRes.data.imageUrl;

            // 2. Update User Profile
            const updateData = type === 'profile' ? { profilePicture: imageUrl } : { coverImage: imageUrl };
            const userRes = await api.put('/auth/profile', updateData);

            if (setCurrentUser) setCurrentUser(userRes.data);
            setProfileUser(prev => ({ ...prev, ...userRes.data }));
            toast.dismiss(loadingToast);
            toast.success(`${type === 'profile' ? 'Profile picture' : 'Cover image'} updated`);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to upload image: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const handleAccountUpdate = async (e) => {
        e.preventDefault();
        if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            const res = await api.put('/auth/profile', {
                username: accountForm.username || undefined,
                password: accountForm.newPassword || undefined
            });
            if (setCurrentUser) setCurrentUser(res.data);
            // Update local profileUser if it's the same user
            setProfileUser(prev => ({ ...prev, ...res.data }));
            toast.success('Account details updated');
            setAccountForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update account');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

        try {
            await api.delete('/auth/me');
            localStorage.removeItem('token');
            if (setCurrentUser) setCurrentUser(null);
            toast.success('Account deleted successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (setCurrentUser) setCurrentUser(null);
        toast.success('Logged out successfully');
        navigate('/login');
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
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-12 mt-6"
            >
                {/* Cover Image */}
                <div className="h-48 md:h-80 w-full rounded-[40px] overflow-hidden bg-gray-100 dark:bg-white/5 relative z-0 group">
                    {profileUser.coverImage ? (
                        <img src={profileUser.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                    )}

                    {isOwnProfile && (
                        <>
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                onClick={() => fileInputRef.current.cover.click()}>
                                <div className="bg-black/50 backdrop-blur-md p-3 rounded-full text-white">
                                    <Camera size={24} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={el => fileInputRef.current.cover = el}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'cover')}
                            />
                        </>
                    )}
                </div>

                {/* Profile Info Card */}
                <div className="relative z-10 w-[95%] md:w-[90%] lg:w-[85%] mx-auto -mt-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 shadow-2xl">

                    {/* Avatar */}
                    <div className="relative -mt-20 md:-mt-24 shrink-0 group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl relative bg-white dark:bg-gray-800">
                            {profileUser.profilePicture ? (
                                <img src={profileUser.profilePicture} className="w-full h-full object-cover" alt={profileUser.name} />
                            ) : (
                                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-5xl font-bold">
                                    {profileUser.name?.charAt(0)}
                                </div>
                            )}

                            {isOwnProfile && (
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current.profile.click()}>
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        {isOwnProfile && (
                            <input
                                type="file"
                                ref={el => fileInputRef.current.profile = el}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'profile')}
                            />
                        )}
                        {/* Status Indicator */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full shadow-lg" title="Online" />
                    </div>
                    {/* Details */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-heading italic font-medium text-gray-900 dark:text-white mb-2">{profileUser.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">@{profileUser.username}</p>
                        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 font-display mb-6">
                            {profileUser.bio || "Passionate storywriter on Drafted"}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            {profileUser.socialLinks?.twitter && (
                                <a href={profileUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors">
                                    <Twitter size={18} />
                                </a>
                            )}
                            {profileUser.socialLinks?.linkedin && (
                                <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors">
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {profileUser.socialLinks?.instagram && (
                                <a href={profileUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors">
                                    <Instagram size={18} />
                                </a>
                            )}
                            {profileUser.socialLinks?.website && (
                                <a href={profileUser.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors">
                                    <Globe size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex flex-col items-center md:items-end gap-6 shrink-0 border-t md:border-t-0 border-gray-100 dark:border-white/5 pt-6 md:pt-0 w-full md:w-auto">
                        <div className="flex items-center gap-8">
                            <button onClick={() => { setShowFollowModal(true); setFollowModalTab('followers'); }} className="text-center group">
                                <span className="block text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">{profileUser.followersCount || profileUser.followers?.length || 0}</span>
                                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Followers</span>
                            </button>
                            <button onClick={() => { setShowFollowModal(true); setFollowModalTab('following'); }} className="text-center group">
                                <span className="block text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">{profileUser.followingCount || profileUser.following?.length || 0}</span>
                                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Following</span>
                            </button>
                            <div className="text-center">
                                <span className="block text-xl font-bold text-gray-900 dark:text-white">{blogs.length}</span>
                                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Posts</span>
                            </div>
                        </div>

                        {isOwnProfile ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <PenTool size={16} /> Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-2"
                                    title="Log Out"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            currentUser && (
                                <button
                                    onClick={handleFollow}
                                    className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 min-w-[140px] ${profileUser.isFollowing
                                        ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                                        }`}
                                >
                                    {profileUser.isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </motion.div>

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

                {/* Right: Sidebar */}
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
                    {/* ... other widgets ... */}
                    <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-[32px] p-8 text-center group">
                        <div className="mx-auto w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={32} />
                        </div>
                        <p className="text-gray-900 dark:text-white font-heading italic text-xl mb-2">Verified Storyteller</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Recognized for consistent high-quality contributions since Day 1.</p>
                    </div>
                </aside>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-heading italic text-gray-900 dark:text-white">Edit Profile</h2>
                                    <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-6 border-b border-gray-100 dark:border-white/5 mb-8">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        Profile Details
                                        {activeTab === 'profile' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('account')}
                                        className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'account' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        Account Settings
                                        {activeTab === 'account' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                                    </button>
                                </div>

                                {activeTab === 'profile' ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                    placeholder="Your name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Picture URL</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={editForm.profilePicture}
                                                        onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white pr-10"
                                                        placeholder="https://..."
                                                    />
                                                    {editForm.profilePicture && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-white/10">
                                                            <img src={editForm.profilePicture} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cover Image URL</label>
                                            <input
                                                type="text"
                                                value={editForm.coverImage}
                                                onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                                            <textarea
                                                value={editForm.bio}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white min-h-[100px] resize-none"
                                                placeholder="Tell your story..."
                                                maxLength={150}
                                            />
                                            <div className="text-right text-xs text-gray-400">
                                                {editForm.bio.length}/150
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Social Links</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={editForm.socialLinks.twitter}
                                                        onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, twitter: e.target.value } })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                        placeholder="Twitter Profile URL"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={editForm.socialLinks.linkedin}
                                                        onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, linkedin: e.target.value } })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                        placeholder="LinkedIn Profile URL"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={editForm.socialLinks.instagram}
                                                        onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, instagram: e.target.value } })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                        placeholder="Instagram Profile URL"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={editForm.socialLinks.website}
                                                        onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, website: e.target.value } })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                        placeholder="Personal Website URL"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-8">
                                        <form onSubmit={handleAccountUpdate} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                                                <input
                                                    type="text"
                                                    value={accountForm.username}
                                                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                    placeholder={currentUser?.username || "New username"}
                                                />
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Change Password</h3>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={accountForm.newPassword}
                                                        onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                        placeholder="New password"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={accountForm.confirmNewPassword}
                                                        onChange={(e) => setAccountForm({ ...accountForm, confirmNewPassword: e.target.value })}
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-end gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={!accountForm.username && !accountForm.newPassword}
                                                    className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Update Account
                                                </button>
                                            </div>
                                        </form>

                                        <div className="pt-8 border-t border-red-100 dark:border-red-900/30">
                                            <h3 className="text-red-600 dark:text-red-400 font-bold mb-2">Danger Zone</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 font-bold text-sm hover:bg-red-500 hover:text-white transition-all duration-300"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                            if (isOwnProfile) {
                                setProfileUser(prev => {
                                    let newFollowingCount = prev.followingCount || prev.following?.length || 0;
                                    if (isFollowing) newFollowingCount++;
                                    else newFollowingCount = Math.max(0, newFollowingCount - 1);

                                    return {
                                        ...prev,
                                        followingCount: newFollowingCount,
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
