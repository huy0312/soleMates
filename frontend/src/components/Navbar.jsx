
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, ChevronDown, Pentagon, Smartphone, HelpCircle, LayoutDashboard, Bell, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
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
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Trang Chủ</Link>
                        <Link to="/challenges" className="text-gray-300 hover:text-white transition-colors">Giải Đấu</Link>
                        {user && <Link to="/forum" className="text-gray-300 hover:text-white transition-colors">Diễn đàn</Link>}
                        <a href="/#about" className="text-gray-300 hover:text-white transition-colors">Giới Thiệu</a>
                        <a href="/#team" className="text-gray-300 hover:text-white transition-colors">Đội Ngũ</a>
                        <a href="/#features" className="text-gray-300 hover:text-white transition-colors">Tính Năng</a>

                        {user ? (
                            <div className="flex items-center gap-4 lg:gap-6">
                                {/* Points */}
                                <div className="hidden xl:flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 whitespace-nowrap">
                                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-black">
                                        P
                                    </div>
                                    <span className="font-bold text-yellow-500">{user.points || 0}</span>
                                </div>

                                {/* Notifications */}
                                <div className="flex items-center gap-3">
                                    <div className="relative" ref={notificationRef}>
                                        <button
                                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                            className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors focus:outline-none"
                                        >
                                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></div>
                                            <Bell size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {isNotificationOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-2 w-80 glass rounded-xl overflow-hidden shadow-2xl border border-white/10 max-h-96 overflow-y-auto"
                                                >
                                                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                                        <h4 className="font-bold text-white text-sm">Thông Báo</h4>
                                                        <span className="text-xs text-gray-400">Đánh dấu đã đọc</span>
                                                    </div>
                                                    <div className="p-8 text-center text-gray-500 text-sm">
                                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                        <p>Bạn chưa có thông báo mới nào.</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                                    >
                                        {cartItemCount > 0 && (
                                            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-slate-900">
                                                {cartItemCount}
                                            </div>
                                        )}
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>

                                <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

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
                                        <span className="text-white font-medium flex items-center gap-1 max-w-[150px] truncate">
                                            {user.fullName || user.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown size={14} className={`transform transition-transform text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                                                            <h4 className="font-bold text-white mb-2">{user.rank}</h4>
                                                            <div className="relative h-2 w-full bg-slate-700/50 rounded-full overflow-hidden mb-1">
                                                                <div
                                                                    className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all duration-500 ease-out"
                                                                    style={{ width: `${user.rankProgress || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-gray-400">
                                                                <span>{Math.round(user.rankProgress || 0)}%</span>
                                                                <span>
                                                                    {user.points || 0}
                                                                    {user.nextRankThreshold ? `/${user.nextRankThreshold}` : ''}
                                                                </span>
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

                                                {/* Admin Link */}
                                                {user.role === 'ADMIN' && (
                                                    <div className="border-t border-white/10 pt-1 pb-2">
                                                        <Link
                                                            to="/admin"
                                                            className="flex items-center gap-3 px-4 py-3 text-sm text-cyan-400 hover:bg-white/10 hover:text-cyan-300 transition-colors font-medium"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                        >
                                                            <LayoutDashboard size={18} /> Admin Portal
                                                        </Link>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                        <Link to="/challenges" className="text-gray-300 hover:text-white text-lg" onClick={() => setIsOpen(false)}>Giải Đấu</Link>
                        {user && <Link to="/forum" className="text-gray-300 hover:text-white text-lg" onClick={() => setIsOpen(false)}>Diễn đàn</Link>}
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
