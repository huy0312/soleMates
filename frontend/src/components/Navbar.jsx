
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
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="Solemates Logo" className="h-10 w-10 object-cover rounded-full" />
                        <span className={`font-bold text-xl tracking-wider uppercase hidden sm:block ${scrolled ? 'text-slate-900' : 'text-white'}`}>Solemates</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={`font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-orange-500' : 'text-white/90 hover:text-white'}`}>Trang Chủ</Link>
                        <Link to="/challenges" className={`font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-orange-500' : 'text-white/90 hover:text-white'}`}>Giải Đấu</Link>
                        {user && <Link to="/forum" className={`font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-orange-500' : 'text-white/90 hover:text-white'}`}>Diễn đàn</Link>}
                        <a href="/#about" className={`font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-orange-500' : 'text-white/90 hover:text-white'}`}>Giới Thiệu</a>
                        <a href="/#features" className={`font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-orange-500' : 'text-white/90 hover:text-white'}`}>Tính Năng</a>

                        {user ? (
                            <div className="flex items-center gap-4 lg:gap-6">
                                {/* Points */}
                                <div className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border whitespace-nowrap ${scrolled ? 'bg-orange-50 border-orange-100' : 'bg-white/10 border-white/20'}`}>
                                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                                        P
                                    </div>
                                    <span className={`font-bold ${scrolled ? 'text-orange-600' : 'text-orange-400'}`}>{user.points || 0}</span>
                                </div>

                                {/* Notifications */}
                                <div className="flex items-center gap-3">
                                    <div className="relative" ref={notificationRef}>
                                        <button
                                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                            className={`relative p-2 rounded-full transition-colors focus:outline-none ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}
                                        >
                                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                                            <Bell size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {isNotificationOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-100 max-h-96 overflow-y-auto"
                                                >
                                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                                        <h4 className="font-bold text-slate-900 text-sm">Thông Báo</h4>
                                                        <span className="text-xs text-slate-500 cursor-pointer hover:text-orange-500">Đánh dấu đã đọc</span>
                                                    </div>
                                                    <div className="p-8 text-center text-slate-400 text-sm">
                                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                        <p>Bạn chưa có thông báo mới nào.</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        onClick={() => navigate('/cart')}
                                        className={`relative p-2 rounded-full transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}
                                    >
                                        {cartItemCount > 0 && (
                                            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-white">
                                                {cartItemCount}
                                            </div>
                                        )}
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>

                                <div className={`w-px h-8 hidden lg:block ${scrolled ? 'bg-slate-200' : 'bg-white/20'}`}></div>

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-3 focus:outline-none"
                                    >
                                        <div className={`w-10 h-10 rounded-full border overflow-hidden flex items-center justify-center ${scrolled ? 'border-slate-200 bg-slate-100' : 'border-white/20 bg-white/10'}`}>
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} className={scrolled ? 'text-slate-400' : 'text-white/80'} />
                                            )}
                                        </div>
                                        <span className={`font-medium flex items-center gap-1 max-w-[150px] truncate ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                            {user.fullName || user.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown size={14} className={`transform transition-transform ${scrolled ? 'text-slate-400' : 'text-white/60'} ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-100 ring-1 ring-black/5"
                                            >
                                                {/* Rank Card */}
                                                <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                                                            <Pentagon size={24} className="text-orange-500 fill-orange-100" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-slate-900 mb-2">{user.rank}</h4>
                                                            <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                                                                <div
                                                                    className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                                                                    style={{ width: `${user.rankProgress || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-slate-500">
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
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <User size={18} className="text-slate-400" /> Trang cá nhân
                                                    </Link>
                                                    <Link
                                                        to="#"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <Smartphone size={18} className="text-slate-400" /> Liên kết ứng dụng
                                                    </Link>
                                                    <Link
                                                        to="#"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <HelpCircle size={18} className="text-slate-400" /> Hướng dẫn người mới
                                                    </Link>
                                                    <div className="border-t border-slate-100 my-1"></div>
                                                    <button
                                                        onClick={handleLogoutClick}
                                                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut size={18} /> Đăng xuất
                                                    </button>
                                                </div>

                                                {/* Admin Link */}
                                                {user.role === 'ADMIN' && (
                                                    <div className="border-t border-slate-100 pt-1 pb-2">
                                                        <Link
                                                            to="/admin"
                                                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors font-medium"
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
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-orange-500/20 cursor-pointer"
                            >
                                Tham Gia
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className={`${scrolled ? 'text-slate-900' : 'text-white'} focus:outline-none`}>
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
                    className="md:hidden bg-white border-t border-slate-100 shadow-xl"
                >
                    <div className="px-4 pt-4 pb-8 space-y-4 flex flex-col items-center">
                        <Link to="/" className="text-slate-600 hover:text-orange-500 text-lg font-medium" onClick={() => setIsOpen(false)}>Trang Chủ</Link>
                        <Link to="/challenges" className="text-slate-600 hover:text-orange-500 text-lg font-medium" onClick={() => setIsOpen(false)}>Giải Đấu</Link>
                        {user && <Link to="/forum" className="text-slate-600 hover:text-orange-500 text-lg font-medium" onClick={() => setIsOpen(false)}>Diễn đàn</Link>}
                        <a href="/#about" className="text-slate-600 hover:text-orange-500 text-lg font-medium" onClick={() => setIsOpen(false)}>Giới Thiệu</a>
                        <a href="/#features" className="text-slate-600 hover:text-orange-500 text-lg font-medium" onClick={() => setIsOpen(false)}>Tính Năng</a>

                        {user ? (
                            <div className="w-full flex flex-col items-center gap-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-slate-400" />
                                        )}
                                    </div>
                                    <span className="text-slate-900 font-bold">
                                        {user.fullName || user.email?.split('@')[0]}
                                    </span>
                                </div>

                                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-orange-500 transition-colors">Hồ Sơ Cá Nhân</Link>
                                <button
                                    onClick={() => { handleLogoutClick(); setIsOpen(false); }}
                                    className="w-full bg-red-50 text-red-500 px-6 py-3 rounded-full font-medium hover:bg-red-100 transition-colors"
                                >
                                    Đăng Xuất
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { handleLoginClick(); setIsOpen(false); }}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20"
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
