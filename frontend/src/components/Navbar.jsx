import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="Solemates Logo" className="h-10 w-10 object-cover rounded-full" />
                        <span className="font-bold text-xl tracking-wider uppercase hidden sm:block">Solemates</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Trang Chủ</Link>
                        <a href="/#about" className="text-gray-300 hover:text-white transition-colors">Giới Thiệu</a>
                        <a href="/#team" className="text-gray-300 hover:text-white transition-colors">Đội Ngũ</a>
                        <a href="/#features" className="text-gray-300 hover:text-white transition-colors">Tính Năng</a>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-cyan-400 font-medium flex items-center gap-2">
                                    <User size={18} /> {user.email?.split('@')[0]}
                                </span>
                                <button
                                    onClick={handleLogoutClick}
                                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
                                    title="Đăng xuất"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-violet-500/20 cursor-pointer"
                            >
                                Đăng Nhập
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden glass border-t border-white/10"
                >
                    <div className="px-4 pt-4 pb-8 space-y-4 flex flex-col items-center">
                        <Link to="/" className="text-gray-300 hover:text-white text-lg" onClick={() => setIsOpen(false)}>Trang Chủ</Link>
                        <a href="/#about" className="text-gray-300 hover:text-white text-lg" onClick={() => setIsOpen(false)}>Giới Thiệu</a>
                        <a href="/#team" className="text-gray-300 hover:text-white text-lg" onClick={() => setIsOpen(false)}>Đội Ngũ</a>
                        <a href="/#features" className="text-gray-300 hover:text-white text-lg" onClick={() => setIsOpen(false)}>Tính Năng</a>

                        {user ? (
                            <div className="w-full flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                                <span className="text-cyan-400 font-medium flex items-center gap-2">
                                    <User size={18} /> {user.email}
                                </span>
                                <button
                                    onClick={() => { handleLogoutClick(); setIsOpen(false); }}
                                    className="w-full bg-red-500/20 text-red-200 px-6 py-3 rounded-full font-medium hover:bg-red-500/30 transition-colors"
                                >
                                    Đăng Xuất
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { handleLoginClick(); setIsOpen(false); }}
                                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-6 py-3 rounded-full font-medium"
                            >
                                Đăng Nhập
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
