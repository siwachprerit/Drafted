// Home.jsx - Home page component with Advanced Graphics and Extended Content
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import heroBackground from '../assets/hero-bg.jpg';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock, User, Sparkles, Feather, TrendingUp, Zap, Shield, Globe, Users, PenTool, Layout } from 'lucide-react';

function Home() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 1.1]);
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    useEffect(() => {
        document.title = 'Home';
        const fetchBlogs = async () => {
            try {
                const response = await api.get('/blogs');
                setBlogs(response.data);
            } catch (error) {
                console.error('Failed to fetch blogs:', error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const FloatingCard = ({ icon: Icon, delay, className }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -15, 0],
            }}
            transition={{
                y: {
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: delay
                },
                opacity: { duration: 0.5, delay: delay }
            }}
            className={`absolute p-4 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/20 shadow-xl ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Icon size={20} />
                </div>
                <div>
                    <div className="h-2 w-20 bg-gray-200 dark:bg-white/20 rounded mb-1.5" />
                    <div className="h-2 w-12 bg-gray-100 dark:bg-white/10 rounded" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="relative">
            {/* Global Fixed Background */}
            <div className="fixed inset-0 z-0">
                <img
                    src={heroBackground}
                    alt="Texture"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/30 dark:bg-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-100/50 to-white/30 dark:from-gray-950 dark:via-gray-900/50 dark:to-black/30" />
            </div>

            {/* Premium Hero Splash */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden z-10">

                {/* Interactive Content */}
                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
                            <span className="h-px w-12 bg-indigo-600/50 dark:bg-indigo-400/50"></span>
                            <span className="text-indigo-700 dark:text-indigo-300 font-sans tracking-[0.2em] text-sm uppercase">The New Standard</span>
                            <span className="h-px w-12 bg-indigo-600/50 dark:bg-indigo-400/50"></span>
                        </div>

                        <h1 className="font-heading italic text-8xl md:text-[11rem] font-medium text-gray-900 dark:text-white tracking-tighter mb-8 drop-shadow-2xl">
                            Drafted<span className="text-indigo-600 dark:text-indigo-500">.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-display font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                            Where words find their weight. A premium publishing platform for the modern storyteller.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/create-blog"
                                className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                            >
                                Start Writing
                            </Link>
                            <a
                                href="#latest"
                                className="px-10 py-4 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-full font-bold text-lg hover:bg-gray-100 dark:hover:bg-white/10 backdrop-blur-md transition-all"
                            >
                                Read Stories
                            </a>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: heroOpacity }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-gray-400 dark:text-white/30"
                >
                    <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
                        <div className="w-1 h-3 bg-current rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Main Content Container */}
            <div className="relative z-10">

                {/* Ambient Background for Content */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] overflow-hidden -z-10 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 45, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/05 dark:bg-indigo-500/05 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            x: [0, 50, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-violet-500/05 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">

                    {/* Hero Section (Legacy - Adjusted) */}
                    <section className="relative grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center md:text-left z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-800">
                                    <Sparkles size={14} />
                                    <span>AI-Powered Storytelling</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-heading italic font-medium tracking-tight leading-tight">
                                    <span className="block text-gray-900 dark:text-white">Craft</span>
                                    <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent bg-[200%_auto] animate-gradient">
                                        your narrative.
                                    </span>
                                </h2>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 leading-relaxed"
                            >
                                Drafted isn't just a blog. It's a canvas for your thoughts, designed for clarity and connection.
                            </motion.p>
                        </div>

                        {/* Right Side Graphics */}
                        <div className="relative h-[500px] hidden md:block perspective-1000">
                            <motion.div style={{ y: y2 }} className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-80 h-[420px]">
                                    {/* Main Card */}
                                    <motion.div
                                        animate={{ rotateY: [0, 8, 0], rotateX: [0, 5, 0] }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-2xl p-6 transform rotate-[-6deg] z-10"
                                    >
                                        <div className="space-y-6 opacity-60">
                                            <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-2xl w-full" />
                                            <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg w-3/4" />
                                            <div className="space-y-3">
                                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Floating Elements */}
                                    <FloatingCard icon={Feather} delay={0} className="-top-8 -right-8 z-20" />
                                    <FloatingCard icon={TrendingUp} delay={1.5} className="top-1/2 -left-12 z-20" />
                                    <FloatingCard icon={User} delay={2.5} className="-bottom-4 -right-4 z-20" />

                                    {/* Decorative Blur */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/20 blur-[80px] -z-10" />
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <ParallaxSection className="relative">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-6xl font-heading italic font-medium text-gray-900 dark:text-white mb-6">Designed for Focus</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">Everything you need to write your best work, and nothing you don't.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={Zap}
                                title="Lightning Fast"
                                description="Built on modern tech for instant page loads and seamless interactions."
                                delay={0}
                            />
                            <FeatureCard
                                icon={Shield}
                                title="Secure & Private"
                                description="Your data is encrypted and ownership stays 100% with you."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={Globe}
                                title="Global Reach"
                                description="Publish to a worldwide audience with one click."
                                delay={0.2}
                            />
                        </div>
                    </ParallaxSection>

                    {/* Community Stats */}
                    <ParallaxSection className="py-20 rounded-[40px] bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px]" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center px-8 lg:px-16">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-heading italic font-medium mb-6 text-gray-900 dark:text-white">Join a growing community of writers.</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">Connect with thinkers, creators, and storytellers from around the globe. Drafted is where ideas find their home.</p>
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">
                                            <User size={20} />
                                        </div>
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                                        +2k
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <StatBox number="10k+" label="Stories Published" />
                                <StatBox number="50k+" label="Monthly Readers" />
                                <StatBox number="150+" label="Countries" />
                                <StatBox number="24/7" label="Uptime" />
                            </div>
                        </div>
                    </ParallaxSection>

                    {/* Blog List */}
                    <ParallaxSection id="latest" className="space-y-12 scroll-mt-24">
                        <div className="flex items-end justify-between border-b border-gray-400 dark:border-white/10 pb-4">
                            <div>
                                <h2 className="text-3xl font-heading italic font-medium text-gray-900 dark:text-white">Latest Stories</h2>
                                <p className="text-gray-900 dark:text-gray-300 mt-2">Discover what the world is thinking</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-white/20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 mb-4">
                                    <Feather size={24} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quiet in here...</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Be the first to break the silence.</p>
                                <Link to="/create-blog" className="inline-block mt-4 text-indigo-500 dark:text-indigo-400 font-medium hover:underline">Start Writing</Link>
                            </div>
                        ) : (
                            <div
                                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                            >
                                {blogs.map((blog) => (
                                    <motion.div variants={item} key={blog._id}>
                                        <Link
                                            to={`/blog/${blog._id}`}
                                            className="group relative block h-full bg-white dark:bg-white/5 dark:backdrop-blur-md rounded-[32px] overflow-hidden hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/20"
                                        >
                                            {/* Blog Cover Image */}
                                            <div className="h-56 w-full relative overflow-hidden">
                                                <img
                                                    src={blog.coverImage || '/images/default-cover.png'}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/0 transition-colors" />
                                            </div>

                                            <div className="p-8 flex flex-col relative">
                                                <div className="mb-4">
                                                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 text-xs font-semibold tracking-wider uppercase group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition-colors">
                                                        Read Story
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                                    {blog.title}
                                                </h3>

                                                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed text-sm">
                                                    {blog.content}
                                                </p>

                                                <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-white/10 mt-auto group/author">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 overflow-hidden border border-gray-200 dark:border-white/10 group-hover/author:border-indigo-500/50 transition-colors">
                                                        {blog.author?.profilePicture ? (
                                                            <img src={blog.author.profilePicture} alt={blog.author.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            blog.author?.name?.charAt(0) || 'A'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-300 transition-colors">
                                                            {blog.author?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200))} min read • {new Date(blog.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </ParallaxSection>

                    {/* CTA Section */}
                    <ParallaxSection className="py-24 text-center">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <h2 className="text-5xl md:text-7xl font-heading italic font-medium text-gray-900 dark:text-white tracking-tight">
                                Ready to tell <span className="text-indigo-600 dark:text-indigo-400">your story?</span>
                            </h2>
                            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                Join thousands of writers who found their voice on Drafted. Completely free, forever.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    to="/create-blog"
                                    className="px-10 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 transition-all transform hover:-translate-y-1"
                                >
                                    Get Started Now
                                </Link>
                            </div>
                        </div>
                    </ParallaxSection>
                </div>
            </div>
        </div>
    );
}

// Helper Components
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        viewport={{ once: true }}
        className="p-8 rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl transition-all group"
    >
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

const StatBox = ({ number, label }) => (
    <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
        <div className="text-3xl font-heading font-bold mb-1 text-gray-900 dark:text-white">{number}</div>
        <div className="text-sm font-display text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
);

// Utility for generic gradients
const getGradient = (id) => {
    const gradients = [
        'from-pink-500 to-rose-500',
        'from-indigo-500 to-purple-500',
        'from-blue-400 to-emerald-400',
        'from-orange-400 to-amber-400',
    ];
    // basic hash to pick a gradient
    const index = id ? id.charCodeAt(id.length - 1) % gradients.length : 0;
    return gradients[index];
};

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

export default Home;
