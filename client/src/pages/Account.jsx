// Account.jsx - Account management page with interactive 3D card
import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, AtSign, Save, Loader, Shield, LogOut, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';
import FollowListModal from '../components/FollowListModal';

function Account() {
    const [user, setUser] = useState({
        name: '',
        username: '',
        email: '',
        profilePicture: '',
        followers: [],
        following: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Follow Modal State
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followModalTab, setFollowModalTab] = useState('followers');

    useEffect(() => {
        document.title = 'My Account | Drafted';
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser({
                _id: response.data._id,
                name: response.data.name,
                username: response.data.username,
                email: response.data.email,
                profilePicture: response.data.profilePicture,
                followers: response.data.followers || [],
                following: response.data.following || []
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Could not load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put('/auth/profile', user);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/auth/me');
            localStorage.removeItem('token');
            toast.success('Account deleted successfully');
            window.location.href = '/register';
        } catch (error) {
            console.error('Delete account failed:', error);
            toast.error('Failed to delete account');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto relative">
            <div className="mb-12">
                <h1 className="text-5xl font-heading italic font-medium text-gray-900 dark:text-white mb-2">Account Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 font-display">Manage your identity and preferences</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">

                {/* Left Column: Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-2xl font-heading italic font-medium text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                            <User size={24} className="text-indigo-600 dark:text-indigo-400" /> Personal Information
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        id="name"
                                        value={user.name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none font-display"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-400">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        id="username"
                                        value={user.username}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none font-display"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-400">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        id="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none font-display"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl shadow-gray-200/50 dark:shadow-white/5 flex items-center gap-3 disabled:opacity-70 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={20} />}
                                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                                <LogOut size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-heading italic font-medium text-gray-900 dark:text-white leading-none mb-1">Sign Out</h3>
                                <p className="text-xs text-gray-500 font-display">End your current session safely</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold dark:hover:bg-white/10 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[32px]">
                        <h3 className="text-2xl font-heading italic font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                            Danger Zone
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 font-display text-sm mb-6 leading-relaxed">
                            Permanently delete your account and all of your content. This action cannot be undone.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold shadow-lg shadow-red-500/5 transition-all"
                        >
                            Delete Account
                        </button>
                    </div>
                </motion.div>

                {/* Right Column: Interactive Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="sticky top-32 perspective-1000 hidden lg:block"
                >
                    <div className="relative w-full max-w-sm mx-auto h-[500px] preserve-3d">
                        {/* Card Background */}
                        <div className="absolute inset-0 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center pt-16 pb-8 px-8 text-center text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all duration-500">

                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-50" />

                            {/* Avatar */}
                            {/* Avatar with Upload */}
                            <div className="relative mb-6 group cursor-pointer w-28 h-28 mx-auto z-10">
                                <label className="block w-full h-full">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('image', file);

                                            const toastId = toast.loading('Uploading avatar...');
                                            try {
                                                const res = await api.post('/upload', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                // Update local state immediately for preview
                                                setUser(prev => ({ ...prev, profilePicture: res.data.imageUrl }));

                                                // Save to backend immediately
                                                await api.put('/auth/profile', { profilePicture: res.data.imageUrl });

                                                toast.success('Avatar updated!', { id: toastId });
                                            } catch (err) {
                                                console.error(err);
                                                toast.error('Upload failed', { id: toastId });
                                            }
                                        }}
                                    />
                                    <div className="w-full h-full rounded-[32px] bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 flex items-center justify-center text-5xl font-heading italic font-medium shadow-2xl overflow-hidden relative transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Update</div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-xl border-2 border-[#0a0a0b] shadow-xl flex items-center justify-center z-10 transform -rotate-12 transition-transform group-hover:rotate-0">
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                    </div>
                                </label>
                            </div>

                            {/* Info */}
                            <div className="relative z-10 w-full mb-8">
                                <h2 className="text-3xl font-heading italic font-medium mb-1 truncate">{user.name || 'Your Name'}</h2>
                                <p className="text-indigo-400 font-display font-medium">@{user.username || 'username'}</p>
                            </div>

                            <div className="relative z-20 w-full bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-gray-200 dark:border-white/10 mb-8 py-8">
                                <div className="grid grid-cols-3 gap-2 px-2">
                                    <button
                                        onClick={() => {
                                            setFollowModalTab('followers');
                                            setShowFollowModal(true);
                                        }}
                                        className="flex flex-col items-center hover:bg-white/5 rounded-xl p-2 transition-colors cursor-pointer group/stat"
                                    >
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-2 group-hover/stat:text-gray-900 dark:group-hover/stat:text-white transition-colors">Followers</div>
                                        <div className="text-xl font-heading italic font-bold text-gray-900 dark:text-white leading-none">
                                            {user.followers?.length || 0}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setFollowModalTab('following');
                                            setShowFollowModal(true);
                                        }}
                                        className="flex flex-col items-center hover:bg-white/5 rounded-xl p-2 transition-colors cursor-pointer group/stat"
                                    >
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-2 group-hover/stat:text-gray-900 dark:group-hover/stat:text-white transition-colors">Following</div>
                                        <div className="text-xl font-heading italic font-bold text-gray-900 dark:text-white leading-none">
                                            {user.following?.length || 0}
                                        </div>
                                    </button>

                                    <div className="flex flex-col items-center p-2">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-2">Status</div>
                                        <div className="text-sm font-display font-black flex items-center gap-2 text-indigo-400">
                                            <Shield size={12} fill="currentColor" /> MEMBER
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                                <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                                <span className="text-[9px] text-gray-600 font-display font-bold tracking-[0.4em] uppercase">ID: 8829-1092-3829</span>
                            </div>
                        </div>

                        {/* Back Glow */}
                        <div className="absolute top-10 left-10 w-full h-full bg-indigo-500/10 rounded-[40px] blur-3xl -z-10" />
                    </div>
                </motion.div>
            </div>

            {/* Delete Account Modal (Replaces Browser Alert) */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-gray-900 border border-red-500/20 rounded-3xl shadow-2xl p-8 w-full max-w-lg overflow-hidden"
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex flex-col items-center text-center gap-6 relative z-10">
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full shadow-inner">
                                    <AlertOctagon size={48} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete your account?</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        This action is <span className="font-bold text-red-500">irreversible</span>. All your personal data, stories, and drafts will be permanently deleted.
                                    </p>
                                </div>

                                <div className="w-full flex items-center gap-3 mt-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Yes, Delete Everything
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Account;
