// I have added the logic to list the recent activities.
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Save, Edit2, Calendar, Mail, FileText, ImageIcon,
    MapPin, Users, Award, ShoppingBag, Settings, Camera, ChevronLeft, ChevronRight,
    X, Upload, Lock, Check, Circle, Link as LinkIcon
} from 'lucide-react';
import api from '../api/axios';

import ActivityCalendar from '../components/ActivityCalendar';
import ActivityMap from '../components/ActivityMap';

const Profile = () => {
    const { user, updateProfile } = useAuth();
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

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                gender: user.gender || 'OTHER',
                birthDate: user.birthDate || '',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || '',
                coverPhotoUrl: user.coverPhotoUrl || '',
                address: user.address || '',
                telephone: user.telephone || '',
                showEmail: user.showEmail || false,
                showPhone: user.showPhone || false,
                showAddress: user.showAddress || false,
                showBirthday: user.showBirthday || false
            });
            setPreviewImage(user.avatarUrl || '');

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
                    console.error("Failed to fetch activities for calendar", error);
                }
            };
            fetchAllActivities();
        }
    }, [user]);

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
            } else {
                setMessage({ type: 'error', text: 'Không thể cập nhật ảnh bìa.' });
            }
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    const frames = [
        { id: 'none', label: 'Không sử dụng khung', locked: false },
        {
            id: 'bronze',
            label: 'Khung Đồng',
            sub: 'Cấp độ đạt Đồng',
            locked: (user.points || 0) < 300,
            styleClass: 'bg-gradient-to-tr from-[#8B4513] via-[#CD7F32] to-[#8B4513] shadow-lg shadow-orange-900/40'
        },
        {
            id: 'silver',
            label: 'Khung Bạc',
            sub: 'Cấp độ đạt Bạc',
            locked: (user.points || 0) < 1500,
            styleClass: 'bg-gradient-to-tr from-[#708090] via-[#E2E8F0] to-[#708090] shadow-lg shadow-slate-400/40'
        },
        {
            id: 'gold',
            label: 'Khung Vàng',
            sub: 'Cấp độ đạt Vàng',
            locked: (user.points || 0) < 3000,
            styleClass: 'bg-gradient-to-tr from-[#B8860B] via-[#FFD700] to-[#B8860B] shadow-[0_0_15px_rgba(255,215,0,0.6)]'
        },
        {
            id: 'diamond',
            label: 'Khung Kim Cương',
            sub: 'Cấp độ đạt Kim Cương',
            locked: (user.points || 0) < 5000,
            styleClass: 'bg-gradient-to-tr from-[#008B8B] via-[#00FFFF] to-[#008B8B] shadow-[0_0_20px_rgba(0,255,255,0.6)]'
        },
    ];

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
                        <div className="relative mb-4 group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            <div className="w-32 h-32 rounded-full border-4 border-slate-700 p-1 bg-slate-800 overflow-hidden relative">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                        <User size={48} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <Edit2 className="text-white" size={24} />
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 bg-slate-700 p-2 rounded-full hover:bg-slate-600 transition-colors border border-slate-600 z-10">
                                <Edit2 size={14} className="text-white" />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">{user.fullName || "Runner Mới"}</h2>

                        <div className="px-4 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-6 flex items-center gap-2">
                            <Award size={14} className="text-amber-400" />
                            <span className="text-amber-400 font-medium text-sm">{user.rank || 'Thành viên'} ({user.points || 0} điểm)</span>
                        </div>

                        <div className="w-full border-t border-white/10 pt-4 flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                            {/* Friends Count Placeholder - Hidden until implemented */}
                            <div className="flex flex-col gap-2 w-full px-4">
                                <div className="flex items-center justify-between text-sm glass p-3 rounded-xl border-white/5 bg-slate-800/50">
                                    <span className="text-gray-400">Mã giới thiệu:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono font-bold tracking-wider">{user.referralCode || '---'}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(user.referralCode);
                                                // Assuming we have access to setMessage or a toast function
                                            }}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                            title="Sao chép mã"
                                        >
                                            <FileText size={14} className="text-cyan-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm glass p-3 rounded-xl border-white/5 bg-slate-800/50">
                                    <span className="text-gray-400">Link hồ sơ:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono text-xs max-w-[100px] truncate">{window.location.host}/u/{user.username || '...'}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/u/${user.username}`);
                                            }}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                            title="Sao chép liên kết"
                                        >
                                            <LinkIcon size={14} className="text-cyan-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* <Users size={16} />
                            <span>0 bạn bè</span> */}
                        </div>

                        <div className="text-xs text-gray-500 mb-6">
                            Thành viên từ: {user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                        </div>

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
                        {user.coverPhotoUrl ? (
                            <img src={user.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-900 to-slate-900"></div>
                        )}

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
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="glass rounded-2xl p-2 flex flex-wrap gap-2">
                        {[
                            { id: 'achievements', label: 'Thành tích', icon: Award },
                            { id: 'friends', label: 'Bạn bè', icon: Users },
                            { id: 'edit', label: 'Thông tin cá nhân', icon: Settings },
                            { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
                        ].map((tab) => (
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
                        {activeTab === 'achievements' && (
                            <div className="glass rounded-2xl p-12 text-center text-gray-400">
                                <Award size={48} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-medium text-white mb-2">Chưa có thành tích</h3>
                                <p>Hãy tham gia các thử thách để nhận huy chương!</p>
                            </div>
                        )}

                        {activeTab === 'edit' && (
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
                                                        fullName: user.fullName || '',
                                                        email: user.email || '',
                                                        gender: user.gender || 'OTHER',
                                                        birthDate: user.birthDate || '',
                                                        bio: user.bio || '',
                                                        avatarUrl: user.avatarUrl || '',
                                                        coverPhotoUrl: user.coverPhotoUrl || '',
                                                        address: user.address || '',
                                                        telephone: user.telephone || '',
                                                        showEmail: user.showEmail || false,
                                                        showPhone: user.showPhone || false,
                                                        showAddress: user.showAddress || false,
                                                        showBirthday: user.showBirthday || false
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
                                <ConnectionsTab />
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="space-y-6">
                                {/* Search Section */}
                                <div className="glass rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Tìm kiếm bạn bè</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Nhập tên, mã giới thiệu hoặc email..."
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white pl-12"
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const val = e.target.value;
                                                    if (!val) return;
                                                    try {
                                                        const res = await api.get(`/users/search?q=${val}`);
                                                        // For now, just logging or setting state (need to add state for search results)
                                                        // Let's add a local state for this in the component
                                                        const event = new CustomEvent('search-friends', { detail: res.data });
                                                        window.dispatchEvent(event);
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                            }}
                                            onChange={(e) => {
                                                // Debounce search could go here
                                            }}
                                            id="friend-search-input"
                                        />
                                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('friend-search-input');
                                                const val = input.value;
                                                if (val) {
                                                    api.get(`/users/search?q=${val}`).then(res => {
                                                        const event = new CustomEvent('search-friends', { detail: res.data });
                                                        window.dispatchEvent(event);
                                                    });
                                                }
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Tìm
                                        </button>
                                    </div>

                                    {/* Search Results Area - handled by FriendsTab component (which we will create or inline) */}
                                    <AuthorSearchResult />
                                </div>

                                <div className="glass rounded-2xl p-12 text-center text-gray-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-medium text-white mb-2">Danh sách bạn bè</h3>
                                    <p>Chức năng kết bạn đang được phát triển.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
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
                {isModalOpen && (
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
                                        className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-8 py-3 rounded-full font-medium flex items-center gap-2 transition-colors w-full max-w-xs justify-center"
                                    >
                                        <Upload size={18} /> Tải ảnh lên
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-full text-slate-500 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={handleSaveAvatar}
                                    disabled={isLoading}
                                    className="px-8 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70"
                                >
                                    {isLoading ? 'Đang lưu...' : 'Lưu lại'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AuthorSearchResult = () => {
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const handleSearch = (e) => {
            setResults(e.detail);
            setSearched(true);
        };
        window.addEventListener('search-friends', handleSearch);
        return () => window.removeEventListener('search-friends', handleSearch);
    }, []);

    if (!searched) return null;

    if (results.length === 0) {
        return <div className="text-center text-gray-400 py-4">Không tìm thấy người dùng nào.</div>;
    }

    return (
        <div className="mt-4 space-y-3">
            {results.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors border border-white/5">
                    <img src={u.avatarUrl || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                        <div className="font-medium text-white">{u.fullName}</div>
                        <div className="text-xs text-gray-400">@{u.username}</div>
                    </div>
                    <a href={`/u/${u.username}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium px-3 py-1 rounded-full border border-cyan-400/20 hover:bg-cyan-400/10 transition-all">
                        Xem
                    </a>
                </div>
            ))}
        </div>
    );
};

const ConnectionsTab = () => {
    const [status, setStatus] = useState({ connected: false, loading: true, profileUrl: null, stravaId: null });
    const [clientId, setClientId] = useState(null);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Pagination & Filter State
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const handleActivityClick = async (activity) => {
        setSelectedActivity(activity);
        try {
            const res = await api.get(`/strava/activities/${activity.id}`);
            if (res.data && res.data.id) {
                setSelectedActivity(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch activity details", error);
        }
    };

    const fetchActivities = async (year, pageNum) => {
        try {
            const res = await api.get(`/strava/activities?year=${year}&page=${pageNum}`);
            if (pageNum === 1) {
                setActivities(res.data);
            } else {
                setActivities(prev => [...prev, ...res.data]);
            }
            if (res.data.length < 10) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error("Failed to fetch activities", error);
        }
    };

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const [statusRes, configRes] = await Promise.all([
                    api.get('/strava/status'),
                    api.get('/strava/config')
                ]);
                setStatus({
                    connected: statusRes.data.connected,
                    loading: false,
                    profileUrl: statusRes.data.profileUrl,
                    stravaId: statusRes.data.stravaId
                });
                setClientId(configRes.data.clientId);

                if (statusRes.data.connected) {
                    const statsRes = await api.get('/strava/stats');
                    setStats(statsRes.data);
                    // Initial fetch for activities
                    fetchActivities(selectedYear, 1);
                }
            } catch (error) {
                console.error("Failed to check strava status", error);
                setStatus({ connected: false, loading: false });
            }
        };
        checkStatus();
    }, []);

    const handleConnect = () => {
        if (!clientId) {
            toast.error("Lỗi cấu hình: Không tìm thấy Client ID.");
            return;
        }
        const redirectUri = window.location.origin + '/strava/callback';
        const scope = 'activity:read_all,profile:read_all';
        window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    };

    const handleDisconnect = async () => {
        if (window.confirm("Bạn có chắc chắn muốn ngắt kết nối với Strava?")) {
            try {
                await api.post('/strava/disconnect');
                setStatus(prev => ({ ...prev, connected: false, profileUrl: null }));
                setStats(null);
                setActivities([]);
            } catch (error) {
                alert("Lỗi khi ngắt kết nối.");
            }
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            if (status.connected) {
                const statsRes = await api.get('/strava/stats');
                setStats(statsRes.data);
                // Reset and re-fetch activities
                setPage(1);
                setActivities([]);
                await fetchActivities(selectedYear, 1);
            }
            await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            console.error("Sync failed", error);
        } finally {
            setSyncing(false);
        }
    };

    const handleYearChange = (e) => {
        const year = parseInt(e.target.value);
        setSelectedYear(year);
        setPage(1);
        setActivities([]);
        fetchActivities(year, 1);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivities(selectedYear, nextPage);
    };

    if (status.loading) return <div className="text-white text-center p-8">Đang tải...</div>;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // [2025, 2024, 2023, 2022, 2021]

    return (
        <div className="glass rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Kết nối ứng dụng</h3>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <div className={`${syncing ? 'animate-spin' : ''}`}>
                        <LinkIcon size={16} />
                    </div>
                    Đồng bộ dữ liệu
                </button>
            </div>

            <div className="space-y-4">
                {/* Strava Card */}
                <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-[#FC4C02] rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                            S
                        </div>
                        <div className="overflow-hidden">
                            {status.connected ? (
                                <a
                                    href={status.profileUrl || `https://www.strava.com/athletes/${status.stravaId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-600 hover:text-[#FC4C02] transition-colors truncate block text-sm sm:text-base font-medium"
                                >
                                    https://www.strava.com/athletes/{status.stravaId || '...'}
                                </a>
                            ) : (
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">Strava</h4>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        {status.connected ? (
                            <>
                                <button
                                    onClick={handleDisconnect}
                                    className="bg-[#FC4C02] hover:bg-[#E34402] text-white px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-orange-500/20 whitespace-nowrap"
                                >
                                    Ngắt kết nối Strava
                                </button>
                                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                    <div className="w-5 h-5 rounded-full border-[5px] border-[#FC4C02]"></div>
                                    Mặc định
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="bg-[#FC4C02] hover:bg-[#E34402] text-white px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
                            >
                                Kết nối
                            </button>
                        )}
                    </div>
                </div>

                {/* Garmin Card (Placeholder) */}
                <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 opacity-80">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-[#000000] rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                            G
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">Garmin</h4>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-end">
                        <button
                            disabled
                            className="bg-slate-800 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors opacity-80 cursor-not-allowed"
                        >
                            Kết nối Garmin
                        </button>
                    </div>
                </div>

                {status.connected && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
                            <h4 className="text-gray-400 text-sm mb-2">Chạy bộ (4 tuần qua)</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-2xl font-bold text-white">{(stats.recent_run_totals?.distance ? stats.recent_run_totals.distance / 1000 : 0).toFixed(1)}</span>
                                    <span className="text-sm text-gray-400 ml-1">km</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {stats.recent_run_totals?.count || 0} bài tập
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
                            <h4 className="text-gray-400 text-sm mb-2">Tổng chạy bộ (Năm nay)</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-2xl font-bold text-white">{(stats.ytd_run_totals?.distance ? stats.ytd_run_totals.distance / 1000 : 0).toFixed(1)}</span>
                                    <span className="text-sm text-gray-400 ml-1">km</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {stats.ytd_run_totals?.count || 0} bài tập
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
                            <h4 className="text-gray-400 text-sm mb-2">Tổng chạy bộ (Tất cả)</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-2xl font-bold text-white">{(stats.all_run_totals?.distance ? stats.all_run_totals.distance / 1000 : 0).toFixed(1)}</span>
                                    <span className="text-sm text-gray-400 ml-1">km</span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {stats.all_run_totals?.count || 0} bài tập
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status.connected && (
                    <div className="space-y-6 mt-8">
                        {/* Activities List Header & Filter */}
                        <div className="flex justify-between items-center">
                            <h4 className="text-xl font-bold text-white">Hoạt động</h4>
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="bg-slate-800 text-white border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-4">
                            {activities.length > 0 ? (
                                <div className="space-y-2">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            onClick={() => handleActivityClick(activity)}
                                            className="bg-slate-800/50 hover:bg-slate-700/50 transition-colors p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#FC4C02]/10 flex items-center justify-center text-[#FC4C02]">
                                                    {activity.type === 'Run' ? <MapPin size={20} /> : <Circle size={20} />}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white text-base">{activity.name}</h5>
                                                    <p className="text-sm text-gray-400">
                                                        {activity.start_date ? new Date(activity.start_date).toLocaleDateString('vi-VN') : ''} • {activity.start_date ? new Date(activity.start_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <p className="text-gray-400 text-xs uppercase">Khoảng cách</p>
                                                    <p className="font-bold text-white">{(activity.distance ? activity.distance / 1000 : 0).toFixed(2)} km</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-400 text-xs uppercase">Thời gian</p>
                                                    <p className="font-bold text-white">
                                                        {activity.moving_time ? Math.floor(activity.moving_time / 60) : 0}m {activity.moving_time ? activity.moving_time % 60 : 0}s
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-400 text-xs uppercase">Pace</p>
                                                    <p className="font-bold text-white">
                                                        {activity.moving_time && activity.distance ? Math.floor((activity.moving_time / 60) / (activity.distance / 1000)) : 0}'
                                                        {activity.moving_time && activity.distance ? Math.round(((activity.moving_time / 60) / (activity.distance / 1000) % 1) * 60) : 0}"/km
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Không có hoạt động nào trong năm {selectedYear}
                                </div>
                            )}

                            {/* Load More Button */}
                            {activities.length > 0 && hasMore && (
                                <div className="text-center pt-2">
                                    <button
                                        onClick={loadMore}
                                        className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                                    >
                                        Xem thêm hoạt động cũ hơn
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Activity Detail Modal */}
                <AnimatePresence>
                    {selectedActivity && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setSelectedActivity(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col border border-white/10"
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {selectedActivity.type === 'Run' ? <MapPin size={20} className="text-[#FC4C02]" /> : <Circle size={20} className="text-[#FC4C02]" />}
                                        {selectedActivity.name}
                                    </h3>
                                    <button onClick={() => setSelectedActivity(null)} className="text-gray-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Khoảng cách</p>
                                            <p className="text-xl font-bold text-white">{(selectedActivity.distance ? selectedActivity.distance / 1000 : 0).toFixed(2)} km</p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Thời gian</p>
                                            <p className="text-xl font-bold text-white">
                                                {selectedActivity.moving_time ? Math.floor(selectedActivity.moving_time / 60) : 0}m {selectedActivity.moving_time ? selectedActivity.moving_time % 60 : 0}s
                                            </p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Pace TB</p>
                                            <p className="text-xl font-bold text-white">
                                                {selectedActivity.moving_time && selectedActivity.distance ? Math.floor((selectedActivity.moving_time / 60) / (selectedActivity.distance / 1000)) : 0}'
                                                {selectedActivity.moving_time && selectedActivity.distance ? Math.round(((selectedActivity.moving_time / 60) / (selectedActivity.distance / 1000) % 1) * 60) : 0}"
                                            </p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Elevation</p>
                                            <p className="text-xl font-bold text-white">{selectedActivity.total_elevation_gain || 0} m</p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Calories</p>
                                            <p className="text-xl font-bold text-white">{selectedActivity.calories || '-'}</p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Nhịp tim TB</p>
                                            <p className="text-xl font-bold text-white">{selectedActivity.average_heartrate || '-'}</p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl text-center">
                                            <p className="text-xs text-gray-400 uppercase">Max Speed</p>
                                            <p className="text-xl font-bold text-white">{(selectedActivity.max_speed ? selectedActivity.max_speed * 3.6 : 0).toFixed(1)} km/h</p>
                                        </div>
                                    </div>

                                    {/* Real Activity Map */}
                                    <div className="mt-4">
                                        <ActivityMap activity={selectedActivity} />
                                    </div>

                                    <div className="mt-6 text-center">
                                        <a
                                            href={`https://www.strava.com/activities/${selectedActivity.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-[#FC4C02] hover:text-[#E34402] transition-colors"
                                        >
                                            Xem chi tiết trên Strava <LinkIcon size={14} />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default Profile;
