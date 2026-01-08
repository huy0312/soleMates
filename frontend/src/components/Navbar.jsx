import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, ChevronDown, Pentagon, Smartphone, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
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
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 focus:outline-none"
                                >
                                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 overflow-hidden flex items-center justify-center">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-cyan-400" />
                                        )}
                                    </div>
                                    <span className="text-white font-medium flex items-center gap-1">
                                        {user.fullName || user.email?.split('@')[0]} <ChevronDown size={14} className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-80 glass rounded-xl overflow-hidden shadow-2xl border border-white/10"
                                        >
                                            {/* Rank Card */}
                                            <div className="p-4 border-b border-white/10 bg-white/5">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 shadow-inner">
                                                        <Pentagon size={24} className="text-slate-300 fill-slate-500/50" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white mb-2">Bạc</h4>
                                                        <div className="relative h-2 w-full bg-slate-700/50 rounded-full overflow-hidden mb-1">
                                                            <div className="absolute left-0 top-0 h-full bg-red-500 w-[42%] rounded-full"></div>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-400">
                                                            <span>42%</span>
                                                            <span>1270/3000</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <User size={18} className="text-gray-400" /> Trang cá nhân
                                                </Link>
                                                <Link
                                                    to="#"
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <Smartphone size={18} className="text-gray-400" /> Liên kết ứng dụng đồng bộ kết quả
                                                </Link>
                                                <Link
                                                    to="#"
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <HelpCircle size={18} className="text-gray-400" /> Hướng dẫn người mới
                                                </Link>
                                                <div className="border-t border-white/10 my-1"></div>
                                                <button
                                                    onClick={handleLogoutClick}
                                                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
                                                >
                                                    <LogOut size={18} /> Đăng xuất
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-violet-500/20 cursor-pointer"
                            >
                                Tham Gia
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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 overflow-hidden flex items-center justify-center">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-cyan-400" />
                                        )}
                                    </div>
                                    <span className="text-cyan-400 font-medium">
                                        {user.fullName || user.email?.split('@')[0]}
                                    </span>
                                </div>

                                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors">Hồ Sơ Cá Nhân</Link>
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
                                Tham Gia
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
