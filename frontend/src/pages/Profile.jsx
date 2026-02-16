
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Save, Edit2, Calendar, Mail, FileText, ImageIcon,
    MapPin, Users, Award, ShoppingBag, Settings, Camera, ChevronLeft, ChevronRight,
    X, Upload, Lock, Check, Circle, Link as LinkIcon, Activity
} from 'lucide-react';
import api from '../api/axios';

import ActivityCalendar from '../components/ActivityCalendar';
import ActivityMap from '../components/ActivityMap';
import RunDetailModal from '../components/RunDetailModal';
import FriendsTab from '../components/FriendsTab';


const Profile = () => {
    const { user: currentUser, updateProfile } = useAuth();
    const { token } = useParams();
    const navigate = useNavigate();

    const [viewedUser, setViewedUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [selectedActivityId, setSelectedActivityId] = useState(null);

    const [activeTab, setActiveTab] = useState('achievements');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [activities, setActivities] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [selectedFrame, setSelectedFrame] = useState('none');
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        gender: '',
        birthDate: '',
        bio: '',
        avatarUrl: '',
        address: '',
        telephone: '',
        showEmail: false,
        showPhone: false,
        showAddress: false,
        showBirthday: false
    });

    // Custom Link State
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [customLink, setCustomLink] = useState('');
    const [isLoadingLink, setIsLoadingLink] = useState(false);

    // Fetch User Logic
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoadingUser(true);
            try {
                if (token) {
                    // Scenario 1: Accessing via /p/:token
                    const res = await api.get(`/users/profile/${token}`);
                    const fetchedUser = res.data;
                    setViewedUser(fetchedUser);

                    if (currentUser && currentUser.id === fetchedUser.id) {
                        setIsOwner(true);
                    } else {
                        setIsOwner(false);
                    }
                } else {
                    // Scenario 2: Accessing via /profile
                    if (currentUser) {
                        if (currentUser.shareToken) {
                            // Redirect to /p/:token
                            navigate(`/p/${currentUser.shareToken}`, { replace: true });
                            return;
                        } else {
                            // No share token yet, just show current user as owner
                            setViewedUser(currentUser);
                            setIsOwner(true);
                        }
                    } else {
                        // Not logged in and accessing /profile -> Redirect to login
                        navigate('/login');
                        return;
                    }
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                setMessage({ type: 'error', text: 'Không tìm thấy người dùng.' });
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUser();
    }, [token, currentUser, navigate]);


    // Handlers needed
    const handleSaveCustomLink = async () => {
        if (!customLink) return;
        setIsLoadingLink(true);
        try {
            const res = await api.put('/users/share-token', { token: customLink });
            setMessage({ type: 'success', text: 'Cập nhật link thành công!' });
            setIsEditingLink(false);

            // Redirect to new link
            navigate(`/p/${customLink}`, { replace: true });

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Link không hợp lệ hoặc đã tồn tại' });
        } finally {
            setIsLoadingLink(false);
        }
    };

    useEffect(() => {
        if (viewedUser && isOwner) {
            setFormData({
                fullName: viewedUser.fullName || '',
                email: viewedUser.email || '',
                gender: viewedUser.gender || 'OTHER',
                birthDate: viewedUser.birthDate || '',
                bio: viewedUser.bio || '',
                avatarUrl: viewedUser.avatarUrl || '',
                coverPhotoUrl: viewedUser.coverPhotoUrl || '',
                address: viewedUser.address || '',
                telephone: viewedUser.telephone || '',
                showEmail: viewedUser.showEmail || false,
                showPhone: viewedUser.showPhone || false,
                showAddress: viewedUser.showAddress || false,
                showBirthday: viewedUser.showBirthday || false
            });
            setPreviewImage(viewedUser.avatarUrl || '');
        }

        if (viewedUser) {
            // Fetch Activities
            const fetchAllActivities = async () => {
                try {
                    // Try to fetch all recent activities (e.g. current year)
                    // We might need a new endpoint or reused param.
                    // For now, let's fetch page 1-2 to cover most recent months
                    // Or implement a Loop if needed.
                    const res = await api.get(`/strava/activities?year=${new Date().getFullYear()}&page=1`);
                    if (res.data) {
                        setActivities(res.data);
                    }
                } catch (error) {
                    // console.error("Failed to fetch activities for calendar", error);
                    // Silently fail if public user has no activities or endpoint protected
                }
            };
            if (isOwner) {
                fetchAllActivities();
            }
        }

    }, [viewedUser, isOwner]);

    // Auto-dismiss toast
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
            // Update viewedUser to reflect changes immediately
            setViewedUser(prev => ({ ...prev, ...formData }));
        } else {
            setMessage({ type: 'error', text: result.message || 'Có lỗi xảy ra.' });
        }
        setIsLoading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = async () => {
        setIsLoading(true);
        const result = await updateProfile({ ...formData, avatarUrl: previewImage });

        if (result.success) {
            setFormData(prev => ({ ...prev, avatarUrl: previewImage }));
            setViewedUser(prev => ({ ...prev, avatarUrl: previewImage }));
            setIsModalOpen(false);
            setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
        } else {
            setMessage({ type: 'error', text: 'Không thể lưu ảnh đại diện.' });
        }
        setIsLoading(false);
    };

    const coverInputRef = useRef(null);

    const handleCoverPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            const result = await updateProfile({ ...formData, coverPhotoUrl: base64 });

            if (result.success) {
                setMessage({ type: 'success', text: 'Cập nhật ảnh bìa thành công!' });
                setViewedUser(prev => ({ ...prev, coverPhotoUrl: base64 }));
            } else {
                setMessage({ type: 'error', text: 'Không thể cập nhật ảnh bìa.' });
            }
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    if (isLoadingUser) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!viewedUser) return <div className="min-h-screen flex items-center justify-center text-white">Không tìm thấy người dùng.</div>;

    const frames = [
        { id: 'none', label: 'Không sử dụng khung', locked: false },
        {
            id: 'bronze',
            label: 'Khung Đồng',
            sub: 'Cấp độ đạt Đồng',
            locked: (viewedUser.points || 0) < 300,
            styleClass: 'bg-gradient-to-tr from-[#8B4513] via-[#CD7F32] to-[#8B4513] shadow-lg shadow-orange-900/40'
        },
        {
            id: 'silver',
            label: 'Khung Bạc',
            sub: 'Cấp độ đạt Bạc',
            locked: (viewedUser.points || 0) < 1500,
            styleClass: 'bg-gradient-to-tr from-[#708090] via-[#E2E8F0] to-[#708090] shadow-lg shadow-slate-400/40'
        },
        {
            id: 'gold',
            label: 'Khung Vàng',
            sub: 'Cấp độ đạt Vàng',
            locked: (viewedUser.points || 0) < 3000,
            styleClass: 'bg-gradient-to-tr from-[#B8860B] via-[#FFD700] to-[#B8860B] shadow-[0_0_15px_rgba(255,215,0,0.6)]'
        },
        {
            id: 'diamond',
            label: 'Khung Kim Cương',
            sub: 'Cấp độ đạt Kim Cương',
            locked: (viewedUser.points || 0) < 5000,
            styleClass: 'bg-gradient-to-tr from-[#008B8B] via-[#00FFFF] to-[#008B8B] shadow-[0_0_20px_rgba(0,255,255,0.6)]'
        },
    ];

    const tabs = [
        { id: 'activities', label: 'Hoạt động', icon: Activity },
        { id: 'achievements', label: 'Thành tích', icon: Award },
        { id: 'friends', label: 'Bạn bè', icon: Users },
    ];

    if (isOwner) {
        tabs.push({ id: 'edit', label: 'Thông tin cá nhân', icon: Settings });
        tabs.push({ id: 'orders', label: 'Đơn hàng', icon: ShoppingBag });
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Message Toast */}
            {message.text && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-xl flex items-center gap-3 shadow-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT SIDEBAR - 3 Columns */}
                <div className="lg:col-span-3 space-y-6">
                    {/* User Info Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-2xl p-6 flex flex-col items-center text-center"
                    >
                        <div className={`relative mb-4 ${isOwner ? 'group cursor-pointer' : ''}`} onClick={() => isOwner && setIsModalOpen(true)}>
                            <div className="w-32 h-32 rounded-full border-4 border-slate-700 p-1 bg-slate-800 overflow-hidden relative">
                                {viewedUser.avatarUrl ? (
                                    <img src={viewedUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                        <User size={48} className="text-gray-400" />
                                    </div>
                                )}
                                {isOwner && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <Edit2 className="text-white" size={24} />
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <button className="absolute bottom-0 right-0 bg-slate-700 p-2 rounded-full hover:bg-slate-600 transition-colors border border-slate-600 z-10">
                                    <Edit2 size={14} className="text-white" />
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">{viewedUser.fullName || "Runner Mới"}</h2>

                        <div className="px-4 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-6 flex items-center gap-2">
                            <Award size={14} className="text-amber-400" />
                            <span className="text-amber-400 font-medium text-sm">{viewedUser.rank || 'Thành viên'} ({viewedUser.points || 0} điểm)</span>
                        </div>

                        <div className="w-full border-t border-white/10 pt-4 text-left space-y-3">
                            {/* Only show these if show... is true Or if isOwner */}
                            {(isOwner || viewedUser.showAddress) && viewedUser.address && (
                                <div className="flex items-center gap-3 text-gray-300 text-sm">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span>{viewedUser.address}</span>
                                </div>
                            )}
                            {(isOwner || viewedUser.showBirthday) && viewedUser.birthDate && (
                                <div className="flex items-center gap-3 text-gray-300 text-sm">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span>{new Date(viewedUser.birthDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-gray-300 text-sm">
                                <Calendar size={16} className="text-gray-500" />
                                <span>Tham gia: {viewedUser.joinDate ? new Date(viewedUser.joinDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</span>
                            </div>
                        </div>

                        {isOwner && (
                            <div className="w-full border-t border-white/10 pt-4 flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                                <div className="flex flex-col gap-2 w-full px-4">
                                </div>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 mb-6">

                        </div>

                        {/* Strava Connect Button */}
                        {isOwner && (
                            <div className="w-full px-4 mb-6">
                                {!viewedUser.stravaId ? (
                                    <button
                                        onClick={() => window.location.href = `https://www.strava.com/oauth/authorize?client_id=141846&response_type=code&redirect_uri=${window.location.origin}/strava/callback&approval_prompt=force&scope=read,activity:read_all`}
                                        className="w-full bg-[#FC4C02] hover:bg-[#E34402] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-900/20"
                                    >
                                        Kết nối Strava
                                    </button>
                                ) : (
                                    <div className="w-full bg-slate-700/50 border border-slate-600/50 text-gray-300 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                                        <Check size={16} className="text-green-500" />
                                        Đã kết nối Strava
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Activity Calendar Widget - Compact Mode */}
                        <div className="w-full border-t border-white/10 pt-6">
                            <ActivityCalendar activities={activities} />
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT CONTENT - 9 Columns */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Cover Photo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl overflow-hidden relative h-48 sm:h-64"
                    >
                        {viewedUser.coverPhotoUrl ? (
                            <img src={viewedUser.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-900 to-slate-900"></div>
                        )}

                        {isOwner && (
                            <>
                                <input
                                    type="file"
                                    ref={coverInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleCoverPhotoUpload}
                                />

                                <button
                                    onClick={() => coverInputRef.current.click()}
                                    disabled={isLoading}
                                    className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm transition-colors border border-white/10 disabled:opacity-50"
                                >
                                    <Camera size={16} /> {isLoading ? 'Đang tải...' : 'Chỉnh sửa ảnh bìa'}
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="glass rounded-2xl p-2 flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-slate-700 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'activities' && (
                            <div className="space-y-6">
                                {/* Stats Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="glass p-4 rounded-xl text-center">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tổng quãng đường</div>
                                        <div className="text-xl font-bold text-white">
                                            {viewedUser.totalDistance ? (viewedUser.totalDistance / 1000).toFixed(1) : 0} km
                                        </div>
                                    </div>
                                    <div className="glass p-4 rounded-xl text-center">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hoạt động</div>
                                        <div className="text-xl font-bold text-white">{activities.length}</div>
                                    </div>
                                    <div className="glass p-4 rounded-xl text-center">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Thời gian</div>
                                        <div className="text-xl font-bold text-white">
                                            {viewedUser.totalMovingTime ? Math.floor(viewedUser.totalMovingTime / 3600) : 0}h
                                        </div>
                                    </div>
                                    <div className="glass p-4 rounded-xl text-center">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Độ cao</div>
                                        <div className="text-xl font-bold text-white">
                                            {viewedUser.totalElevationGain ? viewedUser.totalElevationGain.toFixed(0) : 0}m
                                        </div>
                                    </div>
                                </div>

                                {/* Activity List */}
                                <div className="glass rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-orange-500" />
                                        Hoạt động gần đây
                                    </h3>

                                    <div className="space-y-4">
                                        {activities.length > 0 ? (
                                            activities.map((activity, index) => (
                                                <div
                                                    key={activity.id || index}
                                                    onClick={() => setSelectedActivityId(activity.id)}
                                                    className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors border border-white/5 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                            {activity.type === 'Ride' ? <Activity size={20} /> : <Activity size={20} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white group-hover:text-orange-500 transition-colors">{activity.name}</h4>
                                                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {new Date(activity.start_date_local).toLocaleDateString('vi-VN')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    {(activity.distance / 1000).toFixed(2)} km
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-orange-500 text-lg">
                                                            {Math.floor(activity.moving_time / 60)}p
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {activity.average_speed ? `Pace: ${(16.666 / activity.average_speed).toFixed(2)}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Activity size={32} className="text-slate-600" />
                                                </div>
                                                <p>Chưa có hoạt động nào được ghi nhận.</p>
                                                {isOwner && !currentUser.stravaId && (
                                                    <p className="text-sm mt-2 text-orange-500">Kết nối Strava để đồng bộ hoạt động!</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'achievements' && (
                            <div className="glass rounded-2xl p-12 text-center text-gray-400">
                                <Award size={48} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-medium text-white mb-2">Chưa có thành tích</h3>
                                <p>Hãy tham gia các thử thách để nhận huy chương!</p>
                            </div>
                        )}

                        {activeTab === 'edit' && isOwner && (
                            <div className="space-y-6">
                                <div className="glass rounded-2xl p-8">
                                    <h3 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h3>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <h4 className="text-lg font-bold text-white mb-4">Hồ sơ</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Tên</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                                                    placeholder="Tên của bạn"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    name="birthDate"
                                                    value={formData.birthDate}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Giới tính</label>
                                                <div className="relative">
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white appearance-none"
                                                    >
                                                        <option value="MALE" className="bg-slate-800">Nam</option>
                                                        <option value="FEMALE" className="bg-slate-800">Nữ</option>
                                                        <option value="OTHER" className="bg-slate-800">Khác</option>
                                                    </select>
                                                    <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Địa chỉ</label>
                                            <div className="relative">
                                                <select
                                                    name="address"
                                                    value={formData.address || ''}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white appearance-none"
                                                >
                                                    <option value="" className="bg-slate-800">Chọn thành phố</option>
                                                    <option value="Hà Nội" className="bg-slate-800">Thành phố Hà Nội</option>
                                                    <option value="Hồ Chí Minh" className="bg-slate-800">Thành phố Hồ Chí Minh</option>
                                                    <option value="Đà Nẵng" className="bg-slate-800">Thành phố Đà Nẵng</option>
                                                    <option value="Khác" className="bg-slate-800">Khác</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Giới thiệu</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                rows="4"
                                                placeholder="Giới thiệu ngắn về bạn"
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white resize-none"
                                            ></textarea>
                                        </div>

                                        {/* Toggles */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showEmail"
                                                        checked={formData.showEmail}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                                <span className="text-sm font-medium text-gray-300">Hiển thị email</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showPhone"
                                                        checked={formData.showPhone}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                                <span className="text-sm font-medium text-gray-300">Hiển thị số điện thoại</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showAddress"
                                                        checked={formData.showAddress}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                                <span className="text-sm font-medium text-gray-300">Hiển thị địa chỉ</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showBirthday"
                                                        checked={formData.showBirthday}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                </label>
                                                <span className="text-sm font-medium text-gray-300">Hiển thị sinh nhật</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        fullName: viewedUser.fullName || '',
                                                        email: viewedUser.email || '',
                                                        gender: viewedUser.gender || 'OTHER',
                                                        birthDate: viewedUser.birthDate || '',
                                                        bio: viewedUser.bio || '',
                                                        avatarUrl: viewedUser.avatarUrl || '',
                                                        coverPhotoUrl: viewedUser.coverPhotoUrl || '',
                                                        address: viewedUser.address || '',
                                                        telephone: viewedUser.telephone || '',
                                                        showEmail: viewedUser.showEmail || false,
                                                        showPhone: viewedUser.showPhone || false,
                                                        showAddress: viewedUser.showAddress || false,
                                                        showBirthday: viewedUser.showBirthday || false
                                                    });
                                                }}
                                                className="px-6 py-2 rounded-full text-slate-400 font-medium hover:bg-white/5 transition-colors"
                                            >
                                                Huỷ
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
                                            >
                                                {isLoading ? 'Đang Lưu...' : 'Cập nhật'}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                                        <div className="text-gray-400 text-sm">Vô hiệu hoá tài khoản</div>
                                        <button className="border border-[#D32F2F] text-[#D32F2F] px-6 py-2 rounded-full font-medium hover:bg-[#D32F2F]/10 transition-colors">
                                            Đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                                {/* Connections Tab would go here */}
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <FriendsTab currentUser={currentUser} viewedUser={viewedUser} isOwner={isOwner} />
                        )}

                        {activeTab === 'orders' && isOwner && (
                            <div className="glass rounded-2xl p-12 text-center text-gray-400">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-medium text-white mb-2">Chưa có đơn hàng</h3>
                                <p>Tham gia các giải chạy để nhận huy chương và vật phẩm!</p>
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>

            {/* AVATAR EDIT MODAL */}
            <AnimatePresence>
                {isModalOpen && isOwner && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                                <h3 className="text-xl font-bold text-slate-800">Chỉnh sửa</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-500">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div className="px-6 border-b border-gray-100">
                                <button className="py-3 px-2 text-red-500 font-medium border-b-2 border-red-500">
                                    Ảnh đại diện
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Left: Frames */}
                                <div className="w-1/3 border-r border-gray-100 p-4 overflow-y-auto">
                                    <div className="space-y-2">
                                        {frames.map((frame) => (
                                            <div
                                                key={frame.id}
                                                onClick={() => !frame.locked && setSelectedFrame(frame.id)}
                                                className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${selectedFrame === frame.id
                                                    ? 'bg-red-50 border border-red-500 text-red-600'
                                                    : 'hover:bg-gray-50 text-slate-700'
                                                    } ${frame.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${frame.id === 'none' ? 'bg-gray-100 border-2 border-gray-200' : `${frame.styleClass} p-[3px]`}`}>
                                                    {frame.id === 'none' ? <X size={20} className="text-gray-400" /> : <div className="w-full h-full bg-white rounded-full" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{frame.label}</p>
                                                    {frame.sub && <p className="text-xs text-gray-400">{frame.sub}</p>}
                                                </div>
                                                {selectedFrame === frame.id && <Check size={18} />}
                                                {frame.locked && <Lock size={16} className="text-gray-400" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Preview & Upload */}
                                <div className="w-2/3 p-8 flex flex-col items-center justify-center bg-gray-50">
                                    <div className="relative mb-8">
                                        <div className="w-64 h-64 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200 relative">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={80} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Frame Overlay Mockup */}
                                        {selectedFrame !== 'none' && (
                                            <div
                                                className={`absolute -inset-3 rounded-full ${frames.find(f => f.id === selectedFrame)?.styleClass || ''} pointer-events-none`}
                                                style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', padding: '10px' }}
                                            ></div>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="mb-4 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <Upload size={18} /> Tải ảnh lên
                                    </button>

                                    <button
                                        onClick={handleSaveAvatar}
                                        disabled={isLoading}
                                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-red-500/20 transition-all transform hover:scale-105"
                                    >
                                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Avatar Edit Modal */}
            {/* ... (existing modal logic) ... */}

            {/* Run Detail Modal */}
            {selectedActivityId && (
                <RunDetailModal
                    activityId={selectedActivityId}
                    onClose={() => setSelectedActivityId(null)}
                />
            )}
        </div>
    );
};

export default Profile;
