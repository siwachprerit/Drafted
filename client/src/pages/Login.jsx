// Login.jsx - Login page component with Glassmorphism and Animations
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthBackground from '../components/AuthBackground';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.title = 'Login';
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { identifier, password });
            localStorage.setItem('token', response.data.token);
            toast.success('Welcome back!');
            window.location.href = '/dashboard';
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed';
            console.error('Login failed:', errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] relative">
            <AuthBackground />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-10 md:p-12">
                    <div className="text-center mb-10">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                        >
                            <LogIn size={28} />
                        </motion.div>
                        <h1 className="text-4xl font-heading italic font-medium text-gray-900 dark:text-white mb-3">Welcome back</h1>
                        <p className="text-gray-600 dark:text-gray-400 font-display">Sign in to continue to Drafted</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email or Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    id="identifier"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none font-display"
                                    placeholder="Enter your email or username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none font-display"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-white/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                            {!isLoading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-gray-900 dark:text-white font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Create one
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
