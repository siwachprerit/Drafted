import { NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon, Feather, LayoutDashboard, LogOut, LogIn, UserPlus, Home as HomeIcon, User, Rss } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Footer from '../components/Footer';
import NotificationBell from '../components/NotificationBell';

const NavItem = ({ to, icon: Icon, label }) => {
    const { pathname } = useLocation();
    const isActive = pathname === to;
    return (
        <NavLink
            to={to}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300 ${isActive
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="nav-pill"
                    layout="position"
                    className="absolute inset-0 bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    style={{ zIndex: -1 }}
                />
            )}
            <Icon size={18} />
            <span className="text-sm">{label}</span>
        </NavLink>
    );
};

function MainLayout({ children, user, theme, toggleTheme }) {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-500 font-inter selection:bg-indigo-500/30">
            {/* Glass Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50">
                <div className="mx-4 mt-4">
                    <nav className="flex items-center justify-between px-6 py-3 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-800/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20">
                        {/* App Name - Left */}
                        <NavLink to="/" className="flex items-center group">
                            <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                                Drafted<span className="text-indigo-500">.</span>
                            </span>
                        </NavLink>

                        {/* Nav Links - Right */}
                        <LayoutGroup id="navbar">
                            <div className="flex items-center gap-2">
                                <NavItem to="/" icon={HomeIcon} label="Home" />
                                <NavItem to="/feed" icon={Rss} label="Feed" />

                                {user ? (
                                    <>
                                        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                                        <NavItem to={`/profile/${user._id}`} icon={User} label="Profile" />
                                        <NotificationBell user={user} />
                                        <button
                                            onClick={handleLogout}
                                            className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                            title="Logout"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavItem to="/login" icon={LogIn} label="Login" />
                                        <NavItem to="/register" icon={UserPlus} label="Register" />
                                    </>
                                )}

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="ml-2 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    aria-label="Toggle Theme"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={theme}
                                            initial={{ y: -20, opacity: 0, rotate: -90 }}
                                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                                            exit={{ y: 20, opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                        </motion.div>
                                    </AnimatePresence>
                                </button>
                            </div>
                        </LayoutGroup>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pt-32 pb-10 flex-grow w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
            <Toaster position="bottom-right" toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white border dark:border-gray-700',
                style: { borderRadius: '12px', padding: '16px' }
            }} />
            <Footer />
        </div>
    );
}

export default MainLayout;
