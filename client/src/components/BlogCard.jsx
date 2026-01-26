import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

function BlogCard({ blog, user, setUser, onLike, onFollow, index }) {
    const isLiked = user && blog.likes?.some(likeId => likeId.toString() === user._id);
    const isFollowed = user && blog.author?._id !== user._id && user.following?.includes(blog.author?._id);
    const isOwner = user && blog.author?._id === user._id;
    const isSaved = user?.savedBlogs?.includes(blog._id);

    // Fallback for isFollowing prop if passed from parent
    const showFollow = blog.isFollowing !== undefined ? blog.isFollowing : isFollowed;

    const contentPreview = blog.content?.substring(0, 400);
    const hasMore = blog.content?.length > 400;

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to save stories');
            return;
        }

        try {
            const { data } = await api.post(`/blogs/${blog._id}/save`);

            // Update local user state to reflect change instantly
            if (setUser) {
                setUser(prev => {
                    if (!prev) return prev;
                    const newSaved = data.isSaved
                        ? [...(prev.savedBlogs || []), blog._id]
                        : (prev.savedBlogs || []).filter(id => id !== blog._id);
                    return { ...prev, savedBlogs: newSaved };
                });
            }
            toast.success(data.isSaved ? 'Story saved to library' : 'Story removed from library');
        } catch (error) {
            toast.error('Failed to update library');
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/blog/${blog._id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative rounded-[28px] overflow-hidden group bg-white dark:bg-transparent border border-gray-100 dark:border-transparent"
        >
            {/* Blurred Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={blog.coverImage || '/images/default-cover.png'}
                    alt=""
                    className="w-full h-full object-cover filter blur-xl scale-125 opacity-0 dark:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-white dark:bg-black/70 backdrop-blur-sm transition-colors duration-300"></div>
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-4 group/author">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-white/20 shadow-lg group-hover/author:border-indigo-500/50 transition-colors">
                            {blog.author?.profilePicture ? (
                                <img src={blog.author.profilePicture} alt={blog.author.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                                    {blog.author?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-base group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-300 transition-colors">{blog.author?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-white/50">
                                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </Link>

                    {!isOwner && user && (
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                    const res = await api.post(`/users/${blog.author._id}/follow`);
                                    toast.success(res.data.isFollowing ? `Followed ${blog.author.name}!` : `Unfollowed ${blog.author.name}`);
                                    if (onFollow) onFollow(res.data);
                                } catch (err) {
                                    toast.error('Follow action failed');
                                }
                            }}
                            className={`px-5 py-2 text-sm font-bold border rounded-full transition-all duration-300 min-w-[100px] overflow-hidden group/follow ${blog.isFollowing
                                ? 'bg-white/10 backdrop-blur-xl border-gray-200 dark:border-white/20 text-gray-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/20'
                                : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {blog.isFollowing ? (
                                    <>
                                        <span className="group-hover/follow:hidden">Following</span>
                                        <span className="hidden group-hover/follow:inline text-red-300 transition-colors">Unfollow</span>
                                    </>
                                ) : (
                                    'Follow'
                                )}
                            </span>
                        </button>
                    )}
                </div>

                {/* Title */}
                <Link to={`/blog/${blog._id}`}>
                    <h2 className="text-3xl md:text-4xl font-heading italic font-medium text-gray-900 dark:text-white leading-tight mb-5 drop-shadow-lg hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors">
                        {blog.title}
                    </h2>
                </Link>

                {/* Content Preview */}
                <p className="text-gray-600 dark:text-white/80 font-display text-lg leading-relaxed mb-6">
                    {contentPreview}{hasMore && '...'}
                </p>

                {/* Read More */}
                <Link
                    to={`/blog/${blog._id}`}
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-300 font-bold text-base hover:text-indigo-500 dark:hover:text-indigo-200 transition-colors group/link mb-6"
                >
                    Read full story <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onLike();
                            }}
                            className={`flex items-center gap-2 text-base font-medium transition-colors ${isLiked ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
                            {blog.likes?.length || 0}
                        </button>
                        <Link
                            to={`/blog/${blog._id}#comment-section`}
                            className="flex items-center gap-2 text-base text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                        >
                            <MessageCircle size={22} />
                            {blog.comments?.length || 0}
                        </Link>
                        <button
                            onClick={handleShare}
                            className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <Share2 size={22} />
                        </button>
                    </div>
                    <button
                        onClick={handleBookmark}
                        className={`transition-colors ${isSaved ? 'text-blue-500 fill-current' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Bookmark size={22} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

export default BlogCard;
