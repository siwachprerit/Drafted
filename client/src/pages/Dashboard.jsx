// Dashboard.jsx - Premium "Writer's Studio" Dashboard
import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, Edit2, Calendar, FileText, CheckCircle, Clock,
    TrendingUp, Layout, Plus, Search, Filter, AlertTriangle, X, Bookmark
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function Dashboard({ user, setUser }) {
    const [blogs, setBlogs] = useState([]);
    const [savedBlogs, setSavedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft', 'saved'
    const [searchQuery, setSearchQuery] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    useEffect(() => {
        document.title = 'Dashboard | Drafted';
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (filter === 'saved') {
                const response = await api.get('/blogs/saved');
                setBlogs(response.data);
            } else {
                const response = await api.get('/blogs/my');
                setBlogs(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            toast.error('Failed to load stories');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (blogId) => {
        try {
            await api.post(`/blogs/${blogId}/save`);
            setBlogs(blogs.filter((blog) => blog._id !== blogId));
            if (setUser) {
                setUser((prev) => ({
                    ...prev,
                    savedBlogs: (prev.savedBlogs || []).filter((id) => id !== blogId),
                }));
            }
            toast.success('Removed from library');
        } catch (error) {
            console.error('Unsave failed:', error);
            toast.error('Failed to update library');
        }
    };

    // Open Modal
    const requestDelete = (blogId) => {
        setBlogToDelete(blogId);
        setShowDeleteModal(true);
    };

    // Confirm Delete Action
    const confirmDelete = async () => {
        if (!blogToDelete) return;

        try {
            await api.delete(`/blogs/${blogToDelete}`);
            setBlogs(blogs.filter((blog) => blog._id !== blogToDelete));
            toast.success('Story deleted successfully');
            setShowDeleteModal(false);
            setBlogToDelete(null);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete story');
        }
    };

    // Calculate Stats
    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.isPublished).length,
        drafts: blogs.filter(b => !b.isPublished).length,
        saved: user?.savedBlogs?.length || 0
    };

    // Filter Logic
    const filteredBlogs = blogs.filter(blog => {
        let matchesFilter;
        if (filter === 'saved') {
            matchesFilter = true; // We already fetched only saved blogs
        } else {
            matchesFilter =
                filter === 'all' ? true :
                    filter === 'published' ? blog.isPublished :
                        !blog.isPublished;
        }

        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FileText size={20} className="text-indigo-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-5xl font-heading italic font-medium text-gray-900 dark:text-white mb-2">
                        Writer's Studio
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats.drafts} drafts</span> waiting to be finished.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        to="/create-blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-semibold shadow-lg shadow-gray-200/50 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        New Story
                    </Link>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    label="Total Stories"
                    value={stats.total}
                    icon={Layout}
                    color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                />
                <StatCard
                    label="Published"
                    value={stats.published}
                    icon={TrendingUp}
                    color="text-green-600 bg-green-50 dark:bg-green-900/20"
                />
                <StatCard
                    label="Drafts"
                    value={stats.drafts}
                    icon={FileText}
                    color="text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                />
                <StatCard
                    label="Saved"
                    value={stats.saved}
                    icon={Bookmark}
                    color="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                />
            </motion.div>

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-gray-200 dark:border-white/10">
                    <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        {['all', 'published', 'draft', 'saved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f
                                    ? 'bg-white text-black shadow-lg shadow-white/5'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {f === 'draft' ? 'Drafts' : f === 'saved' ? 'Saved' : f}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search stories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {filteredBlogs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800"
                    >
                        <div className="inline-flex justify-center items-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <Filter size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No stories found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or write something new.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredBlogs.map((blog) => (
                                <BlogCard
                                    key={blog._id}
                                    blog={blog}
                                    user={user}
                                    setUser={setUser}
                                    onDelete={requestDelete}

                                    onUnsave={handleUnsave}
                                    isSavedMock={filter === 'saved'}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg overflow-hidden"
                        >
                            {/* Decorative Background Blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex flex-col gap-6 relative">
                                <div className="flex items-start gap-5">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete this story?</h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                            This action cannot be undone. This will permanently delete the story from our database.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-5 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                    >
                                        Delete Story
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

// Sub-component: Stat Card
function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-8 rounded-[40px] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 backdrop-blur-md border border-white/5`}>
                    <Icon size={28} />
                </div>
                <span className="text-5xl font-heading italic font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 font-display font-medium uppercase tracking-wider relative z-10">{label}</h3>
        </div>
    );
}

// Sub-component: Blog Card
function BlogCard({ blog, onDelete, onUnsave, isSavedMock }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[40px] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col"
        >
            <div className="h-48 w-full relative overflow-hidden">
                <img
                    src={blog.coverImage || '/images/default-cover.png'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${blog.isPublished
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            }`}
                    >
                        {blog.isPublished ? (
                            <><CheckCircle size={10} className="stroke-[3px]" /> Published</>
                        ) : (
                            <><Clock size={10} className="stroke-[3px]" /> Draft</>
                        )}
                    </span>

                    {/* Action Menu (Visible on Hover) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSavedMock ? (
                            <button
                                onClick={() => onUnsave(blog._id)}
                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Remove from Saved"
                            >
                                <Bookmark size={16} fill="currentColor" className="text-blue-500" />
                            </button>
                        ) : (
                            <>
                                <Link
                                    to={`/edit-blog/${blog._id}`}
                                    className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </Link>
                                <button
                                    onClick={() => onDelete(blog._id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <Link to={`/blog/${blog._id}`} className="block flex-grow group-hover:cursor-pointer">
                    <h3 className="text-2xl font-heading italic font-medium text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-display line-clamp-3 text-sm mb-6 leading-relaxed">
                        {blog.content ? blog.content.substring(0, 150) : 'No content preview available...'}
                    </p>
                </Link>

                <div className="flex items-center gap-4 pt-5 mt-auto border-t border-gray-200 dark:border-white/10 text-[10px] text-gray-500 font-display font-bold uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2">
                        <Calendar size={12} className="text-indigo-400" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    {blog.tags && blog.tags.length > 0 && (
                        <span className="flex items-center gap-2">• <span className="text-indigo-400">{blog.tags[0]}</span></span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default Dashboard;
