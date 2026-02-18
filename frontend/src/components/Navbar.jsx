
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, ChevronDown, Pentagon, Smartphone, HelpCircle, LayoutDashboard, Bell, ShoppingCart, Check, UserPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../api/axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { MessageCircle, Grip, Search, MoreHorizontal, Video, Edit } from 'lucide-react';
import ChatBox from './ChatBox';
import chatApi from '../api/chatApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [processingRequest, setProcessingRequest] = useState({});
    const [stompClient, setStompClient] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMessengerOpen, setIsMessengerOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [messengerSearch, setMessengerSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Unread', 'Groups'
    const [selectedFriend, setSelectedFriend] = useState(null);
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const messengerRef = useRef(null);

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
            if (messengerRef.current && !messengerRef.current.contains(event.target)) {
                setIsMessengerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initial fetch of pending requests
    useEffect(() => {
        const fetchPending = async () => {
            if (!user) return;
            try {
                const res = await api.get('/friends/pending');
                setPendingRequests(res.data);
            } catch (err) {
                // silently fail
            }
        };
        fetchPending();
    }, [user]);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const res = await chatApi.getUnreadCount();
            setUnreadCount(res.data.count ?? 0);
        } catch (err) {
            // silently fail
        }
    };

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const res = await chatApi.getConversations();
            setConversations(res.data);
            setFilteredConversations(res.data);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            fetchConversations();
        }
    }, [user]);

    // Filter conversations based on search and tab
    useEffect(() => {
        let filtered = conversations;

        if (messengerSearch) {
            filtered = filtered.filter(c =>
                c.partnerName.toLowerCase().includes(messengerSearch.toLowerCase())
            );
        }

        if (activeTab === 'Unread') {
            filtered = filtered.filter(c => !c.amISender && !c.isRead);
        }

        setFilteredConversations(filtered);
    }, [messengerSearch, activeTab, conversations]);

    // WebSocket connection for real-time notifications
    useEffect(() => {
        if (!user || !user.id) return;

        const wsUrl = 'http://localhost:8080/ws';
        const socket = new SockJS(wsUrl);
        const client = Stomp.over(socket);
        // Disable debug logs
        client.debug = () => { };

        client.connect({}, () => {
            // Subscribe to notifications (Friend Requests / Accepts)
            client.subscribe(`/topic/notifications/${user.id}`, (message) => {
                const notification = JSON.parse(message.body);

                if (notification.type === 'FRIEND_ACCEPT') {
                    toast.success(`${notification.fullName || notification.username} đã đồng ý lời mời kết bạn của bạn`, {
                        id: `friend-accept-${notification.friendshipId}`
                    });
                } else {
                    // Default to FRIEND_REQUEST
                    // Check if already exists to avoid duplicates (though rare)
                    setPendingRequests(prev => {
                        if (prev.some(req => req.friendshipId === notification.friendshipId)) return prev;
                        return [notification, ...prev];
                    });
                    toast.success(`Bạn mới nhận được lời mời kết bạn từ ${notification.fullName || notification.username}`, {
                        id: `friend-req-${notification.friendshipId}`
                    });
                }
            });

            // Subscribe to Chat Messages for notifications
            client.subscribe(`/topic/messages/${user.id}`, (message) => {
                const msg = JSON.parse(message.body);

                // Ignore Read Receipts and own messages
                if (msg.type === 'READ_RECEIPT' || msg.senderId === user.id) return;

                // Increment unread count if not in current chat
                // For simplified logic, always increment, fetching fresh count is safer or handle locally
                if (msg.senderId !== user.id) {
                    setUnreadCount(prev => prev + 1);
                }
            });

            setStompClient(client);
        }, (error) => {
            console.error('WebSocket connection error:', error);
        });

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [user]); // Removed stompClient from dependency array as we use local 'client' for cleanup

    const handleAcceptRequest = async (friendshipId) => {
        setProcessingRequest(prev => ({ ...prev, [friendshipId]: 'accepting' }));
        try {
            await api.put(`/friends/${friendshipId}/accept`);
            setPendingRequests(prev => prev.filter(r => r.friendshipId !== friendshipId));
            toast.success('Đã chấp nhận lời mời kết bạn!');
        } catch (err) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setProcessingRequest(prev => ({ ...prev, [friendshipId]: null }));
        }
    };

    const handleDeclineRequest = async (friendshipId) => {
        setProcessingRequest(prev => ({ ...prev, [friendshipId]: 'declining' }));
        try {
            await api.put(`/friends/${friendshipId}/decline`);
            setPendingRequests(prev => prev.filter(r => r.friendshipId !== friendshipId));
            toast.success('Đã từ chối lời mời');
        } catch (err) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setProcessingRequest(prev => ({ ...prev, [friendshipId]: null }));
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
    };

    return (
        <>
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
                                        <span className={`font-bold ${scrolled ? 'text-red-600' : 'text-orange-400'}`}>{user.points || 0}</span>
                                    </div>

                                    {/* Grid Icon (Placeholder) */}
                                    <div className={`relative p-2 rounded-full transition-colors cursor-pointer ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}>
                                        <Grip size={20} />
                                    </div>

                                    {/* Messenger */}
                                    <div className="relative" ref={messengerRef}>
                                        <button
                                            onClick={() => setIsMessengerOpen(!isMessengerOpen)}
                                            className={`relative p-2 rounded-full transition-colors focus:outline-none ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}
                                        >
                                            {unreadCount > 0 && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-white">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </div>
                                            )}
                                            <MessageCircle size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {isMessengerOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-2 w-96 bg-[#242526] rounded-xl overflow-hidden shadow-2xl border border-white/10 max-h-[85vh] flex flex-col z-50 text-gray-200"
                                                >
                                                    {/* Header */}
                                                    <div className="p-4 border-b border-white/10">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h2 className="font-bold text-xl text-white">Đoạn chat</h2>
                                                            <div className="flex gap-2 text-gray-400">
                                                                <button className="p-1 hover:bg-white/10 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
                                                                <button className="p-1 hover:bg-white/10 rounded-full transition-colors"><Video size={20} /></button>
                                                                <button className="p-1 hover:bg-white/10 rounded-full transition-colors"><Edit size={20} /></button>
                                                            </div>
                                                        </div>

                                                        {/* Search */}
                                                        <div className="relative mb-3">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                            <input
                                                                type="text"
                                                                placeholder="Tìm kiếm trên Messenger"
                                                                value={messengerSearch}
                                                                onChange={(e) => setMessengerSearch(e.target.value)}
                                                                className="w-full bg-[#3A3B3C] border-none rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                            />
                                                        </div>

                                                        {/* Tabs */}
                                                        <div className="flex gap-2">
                                                            {['All', 'Unread', 'Groups'].map(tab => (
                                                                <button
                                                                    key={tab}
                                                                    onClick={() => setActiveTab(tab)}
                                                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors
                                                                    ${activeTab === tab
                                                                            ? 'bg-cyan-600/20 text-cyan-500'
                                                                            : 'hover:bg-white/10 text-gray-400'}`}
                                                                >
                                                                    {tab === 'All' ? 'Tất cả' : tab === 'Unread' ? 'Chưa đọc' : 'Nhóm'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Conversation List */}
                                                    <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                                                        {filteredConversations.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-60">
                                                                <MessageCircle size={48} className="mb-2" />
                                                                <p>Không tìm thấy cuộc trò chuyện nào</p>
                                                            </div>
                                                        ) : (
                                                            filteredConversations.map((conv) => (
                                                                <div
                                                                    key={conv.partnerId}
                                                                    onClick={() => {
                                                                        setSelectedFriend({
                                                                            id: conv.partnerId,
                                                                            fullName: conv.partnerName,
                                                                            avatarUrl: conv.partnerAvatar
                                                                        });
                                                                        setIsMessengerOpen(false);
                                                                    }}
                                                                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors relative"
                                                                >
                                                                    <div className="relative flex-shrink-0">
                                                                        <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden border border-white/5">
                                                                            {conv.partnerAvatar ? (
                                                                                <img src={conv.partnerAvatar} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-lg">
                                                                                    {conv.partnerName ? conv.partnerName.charAt(0).toUpperCase() : 'U'}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {/* Online indicator (mocked for now) */}
                                                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#242526]"></div>
                                                                    </div>

                                                                    <div className="flex-1 min-w-0 pr-6">
                                                                        <h4 className={`text-[15px] truncate mb-0.5 ${!conv.isRead && !conv.amISender ? 'font-bold text-white' : 'font-semibold text-gray-200'}`}>
                                                                            {conv.partnerName || 'Unknown User'}
                                                                        </h4>
                                                                        <div className="flex items-center gap-1 text-[13px]">
                                                                            <p className={`truncate max-w-[140px] ${!conv.isRead && !conv.amISender ? 'font-bold text-white' : 'text-gray-400'}`}>
                                                                                {conv.amISender ? `Bạn: ${conv.lastMessage}` : conv.lastMessage}
                                                                            </p>
                                                                            <span className="text-gray-500 text-[10px] mx-0.5">•</span>
                                                                            <span className={`whitespace-nowrap ${!conv.isRead && !conv.amISender ? 'font-bold text-cyan-400' : 'text-gray-500'}`}>
                                                                                {conv.createdAt ? formatDistanceToNow(new Date(conv.createdAt), { addSuffix: false, locale: vi }) : ''}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Unread indicator dot */}
                                                                    {!conv.isRead && !conv.amISender && (
                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50"></div>
                                                                    )}

                                                                    {/* Hover Actions (optional, like FB) */}
                                                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#242526] pl-2">
                                                                        <button className="p-2 hover:bg-white/10 rounded-full border border-white/5 shadow-sm text-gray-300">
                                                                            <MoreHorizontal size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="p-3 border-t border-white/10 text-center">
                                                        <Link to="/messages" className="text-cyan-500 font-semibold text-sm hover:underline">
                                                            Xem tất cả trong Messenger
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Notifications */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative" ref={notificationRef}>
                                            <button
                                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                                className={`relative p-2 rounded-full transition-colors focus:outline-none ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}
                                            >
                                                {pendingRequests.length > 0 && (
                                                    <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-white">
                                                        {pendingRequests.length}
                                                    </div>
                                                )}
                                                <Bell size={20} />
                                            </button>

                                            <AnimatePresence>
                                                {isNotificationOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-100 max-h-96 overflow-y-auto z-50"
                                                    >
                                                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                                            <h4 className="font-bold text-slate-900 text-sm">Thông Báo</h4>
                                                            {pendingRequests.length > 0 && (
                                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                                                    {pendingRequests.length} mới
                                                                </span>
                                                            )}
                                                        </div>

                                                        {pendingRequests.length > 0 ? (
                                                            <div className="divide-y divide-slate-100">
                                                                {pendingRequests.map((req) => (
                                                                    <div key={req.friendshipId} className="p-3 hover:bg-slate-50 transition-colors">
                                                                        <div className="flex items-start gap-3">
                                                                            <div
                                                                                onClick={() => { req.shareToken && navigate(`/p/${req.shareToken}`); setIsNotificationOpen(false); }}
                                                                                className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 cursor-pointer"
                                                                            >
                                                                                {req.avatarUrl ? (
                                                                                    <img src={req.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                                        <User size={16} className="text-slate-400" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm text-slate-700">
                                                                                    <span className="font-semibold text-slate-900">{req.fullName || req.username}</span>
                                                                                    {' '}đã gửi lời mời kết bạn
                                                                                </p>
                                                                                <div className="flex items-center gap-2 mt-2">
                                                                                    <button
                                                                                        onClick={() => handleAcceptRequest(req.friendshipId)}
                                                                                        disabled={!!processingRequest[req.friendshipId]}
                                                                                        className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                                                    >
                                                                                        {processingRequest[req.friendshipId] === 'accepting'
                                                                                            ? <Loader2 size={12} className="animate-spin" />
                                                                                            : <Check size={12} />}
                                                                                        Chấp nhận
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeclineRequest(req.friendshipId)}
                                                                                        disabled={!!processingRequest[req.friendshipId]}
                                                                                        className="flex items-center gap-1 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                                                    >
                                                                                        {processingRequest[req.friendshipId] === 'declining'
                                                                                            ? <Loader2 size={12} className="animate-spin" />
                                                                                            : <X size={12} />}
                                                                                        Từ chối
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-8 text-center text-slate-400 text-sm">
                                                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                                <p>Bạn chưa có thông báo mới nào.</p>
                                                            </div>
                                                        )}
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
                                                            to={user.shareToken ? `/p/${user.shareToken}` : "/profile"}
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
                {
                    isOpen && (
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

                                        <Link to={user.shareToken ? `/p/${user.shareToken}` : "/profile"} onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-orange-500 transition-colors">Hồ Sơ Cá Nhân</Link>
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
                    )
                }
            </motion.nav>
            {/* Global Chat Box - rendered outside motion.nav to avoid transform stacking context */}
            {
                selectedFriend && (
                    <ChatBox
                        friend={selectedFriend}
                        onClose={() => setSelectedFriend(null)}
                        onMessageRead={fetchUnreadCount}
                    />
                )
            }
        </>
    );
};

export default Navbar;
