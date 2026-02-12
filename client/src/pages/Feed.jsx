// Feed.jsx - Premium two-column feed with interactive sidebar
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, ArrowRight, TrendingUp, Users, Sparkles, Zap, Star, Coffee, PenTool, X } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';

function Feed({ user, setUser }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        document.title = searchQuery ? `Search: ${searchQuery} | Drafted` : 'Feed | Drafted';
        // Reset feed on search change or initial load
        setBlogs([]);
        setPage(1);
        setHasMore(true);
        fetchBlogs(1, true);
    }, [searchQuery]);

    const fetchBlogs = async (pageNum, isReset = false) => {
        if (pageNum === 1) setLoading(true);
        else setIsFetchingMore(true);

        try {
            const endpoint = searchQuery
                ? `/blogs?search=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=6`
                : `/blogs?page=${pageNum}&limit=6`;

            const response = await api.get(endpoint);

            let newBlogs = [];
            let totalPages = 1;

            if (Array.isArray(response.data)) {
                newBlogs = response.data;
            } else {
                newBlogs = response.data.blogs || [];
                totalPages = response.data.totalPages || 1;
            }

            // Randomize sort only on initial load if no search
            let data = newBlogs;
            if (!searchQuery && pageNum === 1) {
                data = newBlogs.sort(() => Math.random() - 0.5);
            }

            setBlogs(prev => isReset ? data : [...prev, ...data]);
            setHasMore(pageNum < totalPages);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBlogs(nextPage);
    };

    const handleLike = async (blogId, index) => {
        if (!user) {
            toast.error('Sign in to like');
            return;
        }
        try {
            const response = await api.post(`/blogs/${blogId}/like`);
            setBlogs(prev => prev.map((blog, i) =>
                i === index ? { ...blog, likes: response.data } : blog
            ));
        } catch (error) {
            toast.error('Failed to like');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            {/* Left Column - Feed Posts */}
            <div className="lg:col-span-7 space-y-8">
                {/* Feed Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4"
                >
                    {searchQuery ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-heading italic font-medium text-gray-900 dark:text-white mb-2">
                                    Results for "{searchQuery}"
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 font-display">{blogs.length} stories found</p>
                            </div>
                            <Link to="/feed" className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                                <X size={20} className="text-gray-700 dark:text-white" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-4xl font-heading italic font-medium text-gray-900 dark:text-white mb-2">Your Feed</h1>
                            <p className="text-gray-600 dark:text-gray-400 font-display">Discover stories from the community</p>
                        </>
                    )}
                </motion.div>

                {/* Posts */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {blogs.map((blog, index) => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                user={user}
                                setUser={setUser}
                                onLike={() => handleLike(blog._id, index)}
                                onFollow={(data) => {
                                    // Update all blogs by this author in the local state
                                    setBlogs(prev => prev.map(b =>
                                        b.author?._id === blog.author._id
                                            ? { ...b, isFollowing: data.isFollowing }
                                            : b
                                    ));
                                }}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                    {/* Load More Button */}
                    {!loading && hasMore && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={isFetchingMore}
                                className="px-8 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase hover:bg-white dark:hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isFetchingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Load More Stories
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Interactive Sidebar */}
            <aside className="lg:col-span-5 hidden lg:block">
                <div className="sticky top-32 space-y-6">
                    {/* Trending Topics */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] p-8 hover:bg-white dark:hover:bg-white/[0.07] transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="font-heading italic text-xl text-gray-900 dark:text-white">Trending</h3>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Now</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {['Technology', 'Lifestyle', 'Design', 'AI', 'Writing', 'Creativity', 'Startups'].map((topic, i) => (
                                <Link
                                    key={topic}
                                    to={`/feed?search=${topic}`}
                                    className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-300 inline-block"
                                >
                                    #{topic}
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Community Pulse Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[32px] p-8"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-600/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:rotate-12 transition-transform duration-500">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="font-heading italic text-xl text-gray-900 dark:text-white">Community</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <StatBox icon={PenTool} label="Stories" value={blogs.length} color="text-indigo-400" bgColor="bg-indigo-400/10" />
                                <StatBox icon={Users} label="Writers" value={new Set(blogs.map(b => b.author?._id)).size} color="text-amber-400" bgColor="bg-amber-400/10" />
                                <StatBox icon={Heart} label="Likes" value={blogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0)} color="text-rose-400" bgColor="bg-rose-400/10" />
                                <StatBox icon={MessageCircle} label="Debates" value={blogs.reduce((acc, b) => acc + (b.comments?.length || 0), 0)} color="text-emerald-400" bgColor="bg-emerald-400/10" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Create Story CTA - More Premium */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative overflow-hidden group p-[1px] rounded-[32px] bg-gradient-to-br from-indigo-500/30 via-transparent to-violet-500/30 border border-gray-200 dark:border-transparent"
                    >
                        <div className="relative bg-white dark:bg-[#0a0a0b] rounded-[31px] p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-600/40 transition-all duration-700" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="mb-6 p-4 bg-indigo-600/10 rounded-[24px] text-indigo-400 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-2xl font-heading italic text-gray-900 dark:text-white mb-3">Shape the Narrative</h3>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">
                                    Your perspective is the missing piece. Share your thoughts and spark a new conversation today.
                                </p>
                                <Link
                                    to="/create-blog"
                                    className="w-full group/btn relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold text-sm rounded-2xl overflow-hidden transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Open Dashboard <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Daily Inspiration Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] p-8 text-center"
                    >
                        <div className="mb-6 inline-flex p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                            <Coffee size={24} />
                        </div>
                        <p className="text-gray-900 dark:text-white font-heading italic text-2xl leading-[1.4] mb-4">
                            "The art of writing is the art of discovering what you believe."
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-white/10" />
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Gustave Flaubert</p>
                            <div className="h-px w-8 bg-white/10" />
                        </div>
                    </motion.div>

                    {/* Floating Decorative Orbs */}
                    <div className="relative h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-white/5">
                        <motion.div
                            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-4 left-8 w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 blur-xl opacity-60"
                        />
                        <motion.div
                            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-10 right-12 w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-50"
                        />
                        <motion.div
                            animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-6 left-1/3 w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 blur-xl opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Star className="text-gray-400 dark:text-white/20" size={48} />
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, color, bgColor }) {
    return (
        <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-5 group/stat hover:bg-white dark:hover:bg-white/10 transition-all duration-300 text-center border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10">
            <div className={`w-10 h-10 ${bgColor} ${color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/stat:scale-110 transition-transform duration-500`}>
                <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
        </div>
    );
}



export default Feed;

