// EditBlog.jsx - Premium "Writer's Canvas" Editor (Edit Mode)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Save, Tag, AlignLeft, X } from 'lucide-react';

function EditBlog() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMeta, setShowMeta] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await api.get(`/blogs/${id}/edit`);
                const blog = response.data;
                setTitle(blog.title);
                setContent(blog.content);
                setTags(blog.tags.join(', '));
                setCoverImage(blog.coverImage || '');
                setIsPublished(blog.isPublished);
                document.title = 'Edit Story | Drafted';
            } catch (error) {
                console.error('Failed to fetch blog:', error);
                toast.error('Failed to load story');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id, navigate]);

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setSaving(true);
        try {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
            await api.put(`/blogs/${id}`, { title, content, tags: tagsArray, isPublished, coverImage });
            toast.success('Story updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to update blog:', error);
            toast.error('Failed to update story');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Top Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-24 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto pointer-events-none"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors pointer-events-auto bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 bg-white/50 dark:bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 dark:border-white/10 pointer-events-auto shadow-2xl">
                    <span className={isPublished ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500'}>
                        {isPublished ? 'Public' : 'Draft'}
                    </span>
                    <span className="opacity-20">•</span>
                    <span>{wordCount} words</span>
                    <span className="opacity-20">•</span>
                    <span>{readTime} min read</span>
                </div>
            </motion.div>

            {/* Main Editor Canvas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto pt-24 px-6 space-y-8"
            >
                <div className="relative group rounded-3xl overflow-hidden mb-8 shadow-2xl">
                    <div className="w-full h-64 md:h-80 relative">
                        <img
                            src={coverImage || '/images/default-cover.png'}
                            alt="Cover"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

                        {/* Upload Controls Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-4">
                            <label className="cursor-pointer px-6 py-3 bg-white/90 text-gray-900 rounded-full font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                                <span className="text-sm">Change Cover</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append('image', file);

                                        const toastId = toast.loading('Uploading image...');
                                        try {
                                            const res = await api.post('/upload', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            setCoverImage(res.data.imageUrl);
                                            toast.success('Cover updated', { id: toastId });
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Upload failed', { id: toastId });
                                        }
                                    }}
                                />
                            </label>

                            {coverImage && coverImage !== '/images/default-cover.png' && (
                                <button
                                    onClick={() => setCoverImage('/images/default-cover.png')}
                                    className="px-6 py-3 bg-red-500/90 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all text-sm"
                                >
                                    Reset Default
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full bg-transparent text-5xl md:text-7xl font-heading italic font-medium text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 outline-none leading-tight"
                    autoFocus
                />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell your story..."
                    className="w-full min-h-[60vh] bg-transparent text-2xl leading-relaxed text-gray-700 dark:text-gray-400 placeholder-gray-400 dark:placeholder-white/10 outline-none resize-none font-display"
                    style={{ fieldSizing: 'content' }}
                />
            </motion.div>

            {/* Floating Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40"
            >
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-full shadow-2xl p-2 flex items-center gap-2">

                    {/* Meta Toggle */}
                    <button
                        onClick={() => setShowMeta(!showMeta)}
                        className={`p-4 rounded-full transition-all ${showMeta ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        title="Settings & Tags"
                    >
                        {showMeta ? <X size={22} /> : <Tag size={22} />}
                    </button>

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                    {/* Publish Toggle */}
                    <button
                        onClick={() => setIsPublished(!isPublished)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isPublished
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                    >
                        {isPublished ? 'Public' : 'Draft'}
                    </button>

                    {/* Submit Action */}
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !title}
                        className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-xl shadow-gray-200/50 dark:shadow-white/5 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={20} />}
                        Update
                    </button>
                </div>
            </motion.div>

            {/* Meta Drawer (Tags) */}
            <AnimatePresence>
                {showMeta && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 w-80 bg-white/90 dark:bg-black/60 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[32px] shadow-2xl p-8 z-30"
                    >
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Story Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Tags</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="tech, life, ai..."
                                    className="w-full px-5 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:border-indigo-500 font-display text-gray-900 dark:text-white text-sm"
                                />
                                <p className="text-[10px] text-gray-500 mt-3 font-display">Comma separated tags to help readers find your story.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EditBlog;
