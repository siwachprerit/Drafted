import { motion } from 'framer-motion';
import heroBackground from '../assets/hero-bg.jpg';

function AuthBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Global Fixed Background */}
            <div className="absolute inset-0">
                <img
                    src={heroBackground}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/30 dark:bg-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-100/50 to-white/30 dark:from-gray-950 dark:via-gray-900/50 dark:to-black/30" />
            </div>

            {/* Mesh Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen"
            />
        </div>
    );
}

export default AuthBackground;
