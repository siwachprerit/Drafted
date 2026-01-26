// Footer.jsx - Global application footer
import { Link } from 'react-router-dom';
import { Feather, Twitter, Github, Linkedin, Mail, Heart } from 'lucide-react';

function Footer() {
    return (
        <div className="mx-4 mb-4 mt-20 relative z-10">
            <footer className="rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 dark:border-gray-800/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        {/* Brand Column */}
                        <div className="col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center mb-4 group">
                                <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                                    Drafted<span className="text-indigo-500">.</span>
                                </span>
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                                A minimal, AI-powered platform for writers and thinkers to share their stories with the world.
                            </p>
                            <div className="flex items-center gap-4">
                                <SocialLink icon={Twitter} href="#" label="Twitter" />
                                <SocialLink icon={Github} href="#" label="GitHub" />
                                <SocialLink icon={Linkedin} href="#" label="LinkedIn" />
                                <SocialLink icon={Mail} href="mailto:hello@drafted.com" label="Email" />
                            </div>
                        </div>

                        {/* Links Column 1 */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <FooterLink to="#">Features</FooterLink>
                                <FooterLink to="#">Integrations</FooterLink>
                                <FooterLink to="#">Pricing</FooterLink>
                                <FooterLink to="#">Changelog</FooterLink>
                            </ul>
                        </div>

                        {/* Links Column 2 */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <FooterLink to="#">About</FooterLink>
                                <FooterLink to="#">Careers</FooterLink>
                                <FooterLink to="#">Blog</FooterLink>
                                <FooterLink to="#">Contact</FooterLink>
                            </ul>
                        </div>

                        {/* Links Column 3 */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <FooterLink to="#">Privacy</FooterLink>
                                <FooterLink to="#">Terms</FooterLink>
                                <FooterLink to="#">Cookie Policy</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                            © {new Date().getFullYear()} Drafted Inc. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by <span className="text-gray-900 dark:text-white font-medium">Prerit Siwach</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Helper Components
const SocialLink = ({ icon: Icon, href, label }) => (
    <a
        href={href}
        aria-label={label}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
        <Icon size={18} />
    </a>
);

const FooterLink = ({ to, children }) => (
    <li>
        <Link
            to={to}
            className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
            {children}
        </Link>
    </li>
);

export default Footer;
