import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Hash, Share2, Twitter, Linkedin, Facebook, Heart, MessageCircle, ArrowLeft, Send, X, Copy, Mail, Edit2, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

function BlogDetails({ user, setUser }) {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);

    // Check if saved
    const isSaved = user?.savedBlogs?.includes(id);

    const { scrollY, scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Ambient Background Transforms
    const bgOpacity = useTransform(scrollY, [0, 400], [0, 1]);
    const bgScale = useTransform(scrollY, [0, 400], [1.1, 1]); // Subtle zoom out for background

    // Hero Section Transforms
    const heroScale = useTransform(scrollY, [0, 500], [1, 1.2]); // Zoom in effect
    const heroY = useTransform(scrollY, [0, 500], [0, 200]); // Parallax
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]); // Fade out

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await api.get(`/blogs/${id}`);
                const data = response.data;
                setBlog(data);
                setComments(data.comments || []);
                setLikesCount(data.likes?.length || 0);

                if (data.title) {
                    document.title = `${data.title} | Drafted`;
                }
            } catch (error) {
                console.error('Failed to fetch blog:', error.response?.data?.message || error.message);
                if (error.response?.status === 404) {
                    setNotFound(true);
                }
            }
        };

        fetchBlog();
    }, [id]);

    // Update isLiked when blog or user changes
    useEffect(() => {
        if (blog && user) {
            setIsLiked(blog.likes?.some(likeId => likeId.toString() === user._id.toString()));
        } else {
            setIsLiked(false);
        }
    }, [blog, user]);

    const handleLike = async () => {
        if (!user) {
            toast.error('Sign in to like this story');
            return;
        }
        try {
            const response = await api.post(`/blogs/${id}/like`);
            const updatedLikes = response.data;
            setLikesCount(updatedLikes.length);

            // Check if user is in the new likes array
            const liked = updatedLikes.some(likeId => likeId.toString() === user._id.toString());
            setIsLiked(liked);
            toast.success(liked ? 'Added to liked' : 'Removed from liked');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update like');
        }
    };

    const handleBookmark = async () => {
        if (!user) {
            toast.error('Sign in to save this story');
            return;
        }

        try {
            const { data } = await api.post(`/blogs/${id}/save`);

            // Update local user state
            if (setUser) {
                setUser(prev => {
                    if (!prev) return prev;
                    const newSaved = data.isSaved
                        ? [...(prev.savedBlogs || []), id]
                        : (prev.savedBlogs || []).filter(savedId => savedId !== id);
                    return { ...prev, savedBlogs: newSaved };
                });
            }
            toast.success(data.isSaved ? 'Story saved to library' : 'Story removed from library');
        } catch (error) {
            toast.error('Failed to update library');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Sign in to join the discussion');
            return;
        }

        const wordCount = commentText.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount > 30) {
            toast.error('Comment too long (max 30 words)');
            return;
        }

        try {
            const response = await api.post(`/blogs/${id}/comment`, { content: commentText });
            setComments(response.data);
            setCommentText('');
            toast.success('Comment posted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post comment');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
    };

    if (notFound) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[12rem] leading-none font-bold text-gray-200 dark:text-gray-800 absolute -z-10 select-none"
                >
                    404
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">Story not found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md relative z-10">The story you are looking for has vanished into the digital void.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:scale-105 transition-transform relative z-10">
                    <ArrowLeft size={18} /> Back to Home
                </Link>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse font-medium">Loading story...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-32">
            {/* Global Ambient Background - Fades in on scroll */}
            <motion.div
                style={{ opacity: bgOpacity, scale: bgScale }}
                className="fixed inset-0 z-0 pointer-events-none"
            >
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 z-10 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-100/80 via-white/20 to-transparent dark:from-gray-900/80 dark:via-black/20 dark:to-transparent z-10 transition-colors duration-500" />
                <img
                    src={blog.coverImage || '/images/default-cover.png'}
                    alt="Ambient Background"
                    className="w-full h-full object-cover blur-2xl scale-110"
                />
            </motion.div>

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowShareModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-heading italic text-gray-900 dark:text-white font-medium">Share Story</h3>
                                    <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                    <img src={blog.coverImage} className="w-full h-32 object-cover opacity-50" />
                                    <div className="p-4">
                                        <div className="text-sm font-display text-indigo-400 uppercase tracking-widest mb-1">In Drafted</div>
                                        <div className="text-lg font-heading italic text-gray-900 dark:text-white line-clamp-1">{blog.title}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white group-hover:bg-indigo-50 dark:group-hover:bg-white/10 transition-colors">
                                            <Copy size={20} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Copy</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 group">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white group-hover:bg-indigo-50 dark:group-hover:bg-white/10 transition-colors">
                                            <Twitter size={20} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">X</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 group">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white group-hover:bg-indigo-50 dark:group-hover:bg-white/10 transition-colors">
                                            <Linkedin size={20} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Linked</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 group">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white group-hover:bg-indigo-50 dark:group-hover:bg-white/10 transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Email</span>
                                    </button>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl flex items-center justify-between gap-4">
                                    <span className="text-xs text-gray-400 truncate">{window.location.href}</span>
                                    <button onClick={handleCopyLink} className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors shrink-0">Copy</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Immersive Hero Section */}
            <header className="relative h-[75vh] w-full overflow-hidden flex items-end justify-center pb-20 px-4 lg:px-8">
                <div className="absolute inset-0 mx-4 lg:mx-8 rounded-[40px] overflow-hidden shadow-2xl">
                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
                        className="absolute inset-0 z-0 origin-center"
                    >
                        <img
                            src={blog.coverImage || '/images/default-cover.png'}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                    </motion.div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 w-full text-center md:text-left transition-transform duration-700">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {/* Status Pill */}
                            <span className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-sm font-semibold flex items-center gap-2 ${blog.isPublished
                                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                                : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                                }`}>
                                {blog.isPublished ? (
                                    <>
                                        <Calendar size={14} />
                                        Published {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </>
                                ) : (
                                    <>
                                        <Clock size={14} />
                                        Draft
                                    </>
                                )}
                            </span>

                            {blog.tags && blog.tags.map((tag, index) => (
                                <span key={index} className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide">
                                    #{tag}
                                </span>
                            ))}
                            <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-sm font-semibold flex items-center gap-2">
                                <Clock size={14} /> {Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200))} min read
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading italic font-medium text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                            {blog.title}
                        </h1>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-300 pt-4">
                            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-lg rounded-full pr-6 pl-2 py-2 border border-white/10">
                                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden">
                                    {blog.author?.profilePicture ? (
                                        <img src={blog.author.profilePicture} alt={blog.author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold ml-0">
                                            {blog.author?.name?.charAt(0) || 'A'}
                                        </div>
                                    )}
                                </div>
                                <div className="text-left leading-tight">
                                    <div className="font-bold text-white text-sm">{blog.author?.name}</div>
                                    <div className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Edit Button - Only for Author */}
                            {user && blog.author?._id === user._id && (
                                <Link
                                    to={`/edit-blog/${blog._id}`}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                                >
                                    <Edit2 size={16} />
                                    Edit Story
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content Column */}
                <ParallaxSection className="lg:col-span-9 lg:col-start-1">
                    <article className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[40px] shadow-2xl border border-gray-200 dark:border-white/10 p-8 md:p-12 lg:p-16">
                        <div className="prose prose-xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-loose space-y-8 font-display">
                            <p className="first-letter:text-7xl first-letter:font-heading first-letter:italic first-letter:font-medium first-letter:text-gray-900 dark:first-letter:text-white first-letter:mr-4 first-letter:float-left first-letter:leading-none">
                                {blog.content.split('\n')[0]}
                            </p>
                            {blog.content.split('\n').slice(1).map((paragraph, idx) => (
                                paragraph.trim() && <p key={idx} className="text-gray-700 dark:text-gray-300/90">{paragraph}</p>
                            ))}
                        </div>

                        {/* Engagement Area */}
                        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-white/10">
                            <h3 className="text-3xl font-heading italic font-medium text-gray-900 dark:text-white mb-8">Enjoyed this story?</h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={handleLike}
                                    className={`flex-1 py-4 px-6 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold transition-all flex items-center justify-center gap-3 group border border-gray-200 dark:border-white/10 ${isLiked ? 'border-red-500/50 bg-red-500/10 dark:bg-red-500/5' : 'hover:border-indigo-500/50'}`}
                                >
                                    <Heart className={`transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:scale-110 group-hover:text-red-400 text-gray-400 dark:text-white'}`} size={24} />
                                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                                </button>
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold transition-all flex items-center justify-center gap-3 group border border-gray-200 dark:border-white/10 hover:border-indigo-500/50"
                                >
                                    <Share2 className="group-hover:scale-110 transition-transform text-gray-400 dark:text-white" />
                                    <span>Share</span>
                                </button>
                                <button
                                    onClick={handleBookmark}
                                    className={`flex-1 py-4 px-6 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold transition-all flex items-center justify-center gap-3 group border border-gray-200 dark:border-white/10 ${isSaved ? 'border-blue-500/50 bg-blue-500/10 dark:bg-blue-500/5' : 'hover:border-indigo-500/50'}`}
                                >
                                    <Bookmark className={`transition-all ${isSaved ? 'fill-blue-500 text-blue-500 scale-110' : 'group-hover:scale-110 group-hover:text-blue-400 text-gray-400 dark:text-white'}`} size={24} />
                                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div id="comment-section" className="mt-20">
                            <h3 className="text-3xl font-heading italic font-medium text-gray-900 dark:text-white mb-8">Discussion ({comments.length})</h3>

                            <form onSubmit={handleComment} className="mb-12">
                                <div className="relative">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add your thoughts... (max 30 words)"
                                        className="w-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 text-gray-900 dark:text-white text-lg placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none min-h-[120px] font-display"
                                    />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                                        <span className={`text-xs font-bold tracking-widest uppercase ${commentText.trim().split(/\s+/).filter(Boolean).length > 30 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {commentText.trim().split(/\s+/).filter(Boolean).length}/30 Words
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim()}
                                            className="p-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-6">
                                <h3 className="text-xl font-heading text-gray-500 dark:text-white/50 mb-4">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</h3>

                                {comments.length > 0 ? (
                                    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={index}
                                            className="relative p-4 rounded-xl bg-gray-50 dark:bg-black/10 backdrop-blur-sm border border-gray-200 dark:border-white/5 flex gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/5 flex-shrink-0">
                                                {comment.user?.profilePicture ? (
                                                    <img src={comment.user.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white/50 text-[10px] font-bold">
                                                        {comment.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white/80 text-xs mb-0.5">{comment.user?.name}</span>
                                                    <p className="text-gray-600 dark:text-gray-400 font-display text-[13px] leading-relaxed pr-16">{comment.content}</p>
                                                </div>
                                                <div className="absolute top-4 right-4 text-[9px] text-gray-600 uppercase font-bold tracking-tighter">
                                                    {formatTimeElapsed(comment.createdAt)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-white/5 text-gray-500 dark:text-gray-600 font-display text-sm">
                                        No comments yet. Start the conversation.
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                </ParallaxSection>

                {/* Sidebar */}
                <aside className="lg:col-span-3 lg:col-start-10 hidden lg:block space-y-8 pt-20">
                    <div className="sticky top-32 space-y-8">
                        {/* Author Card */}
                        <ParallaxSection className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl text-center">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white/50 dark:border-white/10 shadow-xl overflow-hidden">
                                    {blog.author?.profilePicture ? (
                                        <img src={blog.author.profilePicture} alt={blog.author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-3xl font-bold">
                                            {blog.author?.name?.charAt(0) || 'A'}
                                        </div>
                                    )}
                                </div>
                                <Link to={`/profile/${blog.author?._id}`} className="group/author-link">
                                    <h3 className="text-xl font-heading italic font-medium text-gray-900 dark:text-white mb-1 group-hover/author-link:text-indigo-600 dark:group-hover/author-link:text-indigo-300 transition-colors">{blog.author?.name}</h3>
                                    <p className="text-sm font-display text-indigo-500 dark:text-indigo-400 font-medium mb-4">@DraftedWriter</p>
                                </Link>
                                {/* Hide Follow button for own profile */}
                                {(!user || blog.author?._id === user._id) && (
                                    <button
                                        onClick={async () => {
                                            if (!user) return toast.error('Sign in to follow');
                                            try {
                                                const res = await api.post(`/users/${blog.author._id}/follow`);
                                                setBlog(prev => ({
                                                    ...prev,
                                                    isFollowing: res.data.isFollowing
                                                }));
                                                toast.success(res.data.isFollowing ? `Followed ${blog.author.name}!` : `Unfollowed ${blog.author.name}`);
                                            } catch (err) {
                                                toast.error('Follow failed');
                                            }
                                        }}
                                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 border group/follow overflow-hidden 
                                            ${blog.isFollowing
                                                ? 'bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20'
                                                : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-blue-500/20'
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {blog.isFollowing ? (
                                                <>
                                                    <span className="group-hover/follow:hidden">Following</span>
                                                    <span className="hidden group-hover/follow:inline text-red-300">Unfollow</span>
                                                </>
                                            ) : (
                                                'Follow'
                                            )}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </ParallaxSection>
                    </div>
                </aside>
            </div>

            {/* Mobile Floating Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 1 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden"
            >
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-full shadow-2xl p-2 flex items-center gap-1">
                    <button
                        onClick={handleLike}
                        className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={() => document.getElementById('comment-section').scrollIntoView({ behavior: 'smooth' })}
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <MessageCircle size={20} />
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <Share2 size={20} />
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <button
                        onClick={handleBookmark}
                        className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </motion.div>
        </div >
    );
}

const ParallaxSection = ({ children, className = "", id }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <motion.div
            id={id}
            ref={ref}
            style={{ y, opacity }}
            className={`relative ${className}`}
        >
            {children}
        </motion.div>
    );
};

const formatTimeElapsed = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInSecs = Math.max(0, Math.floor(diffInMs / 1000));
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    if (diffInMonths > 0) return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    if (diffInDays > 0) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    if (diffInHours > 0) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInMins > 0) return `${diffInMins} ${diffInMins === 1 ? 'min' : 'mins'} ago`;
    return 'just now';
};

export default BlogDetails;
