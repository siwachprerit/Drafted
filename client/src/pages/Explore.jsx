// Explore.jsx - Tag exploration page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Hash, TrendingUp, Compass, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Explore = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await api.get('/blogs/tags');
                setTags(response.data);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                toast.error('Failed to load topics');
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.01
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="text-center mb-16 pt-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase mb-6"
                >
                    <Compass size={16} />
                    <span>Discover</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-heading italic font-bold text-gray-900 dark:text-white mb-6"
                >
                    Explore Topics
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
                >
                    Dive into a universe of ideas. Find the stories that matter to you.
                </motion.p>
            </div>

            {/* Tag Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                {tags.map((tagObj, index) => (
                    <motion.div
                        key={tagObj._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.3, delay: index % 4 * 0.1 }}
                    >
                        <Link
                            to={`/feed?search=${encodeURIComponent(tagObj._id)}`}
                            className="group relative block h-48 rounded-[32px] overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                            <div className="relative h-full p-8 flex flex-col justify-between z-10">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-2xl text-gray-900 dark:text-white group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                        <Hash size={24} />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <TrendingUp size={12} />
                                        {tagObj.count} Posts
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {tagObj._id}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                        Browse stories <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {tags.length === 0 && !loading && (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No topics found yet.</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
