import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Save, Edit2, Calendar, Mail, FileText, ImageIcon,
    MapPin, Users, Award, ShoppingBag, Settings, Camera, ChevronLeft, ChevronRight,
    X, Upload, Lock, Check, Circle
} from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('achievements');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [selectedFrame, setSelectedFrame] = useState('none');
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        birthYear: '',
        bio: '',
        avatarUrl: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                gender: user.gender || 'OTHER',
                birthYear: user.birthYear || '',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || ''
            });
            setPreviewImage(user.avatarUrl || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        // In a real app, you would upload the file to cloud storage here.
        // For this demo, we'll save the Data URL (base64) directly or just the preview logic.
        // Since backend expects a URL string, we can update the formData.avatarUrl with this base64 string
        // Note: Base64 strings are long, verify if backend column Definition = TEXT supports it (Postgres TEXT does).

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

    if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    // Mock Data for Achievements
    const achievements = [
        {
            id: 1,
            title: "Đêm Hội Trăng Rằm",
            type: "Chạy bộ",
            points: "300 điểm thưởng",
            image: "https://images.unsplash.com/photo-1533561052604-c3beb2d73ff2?auto=format&fit=crop&q=80&w=400",
            status: "Sắp diễn ra"
        },
        {
            id: 2,
            title: "Thập Linh Việt - Trâu Vàng",
            type: "Chạy bộ",
            points: "300 điểm thưởng",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400",
            status: "Đang diễn ra"
        },
        {
            id: 3,
            title: "Hà Nội Marathon",
            type: "Chạy bộ",
            points: "500 điểm thưởng",
            image: "https://images.unsplash.com/photo-1552674605-5d28c4a11843?auto=format&fit=crop&q=80&w=400",
            status: "Đã đăng ký"
        }
    ];

    const frames = [
        { id: 'none', label: 'Không sử dụng khung', locked: false },
        { id: 'bronze', label: 'Khung Đồng', sub: 'Cấp độ đạt Đồng', locked: true, color: 'border-orange-400' },
        { id: 'silver', label: 'Khung Bạc', sub: 'Cấp độ đạt Bạc', locked: true, color: 'border-slate-300' },
        { id: 'gold', label: 'Khung Vàng', sub: 'Cấp độ đạt Vàng', locked: true, color: 'border-yellow-400' },
        { id: 'diamond', label: 'Khung Kim Cương', sub: 'Cấp độ đạt Kim Cương', locked: true, color: 'border-cyan-400' },
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
                            <span className="text-amber-400 font-medium text-sm">Hạng Bạc</span>
                        </div>

                        <div className="w-full border-t border-white/10 pt-4 flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                            <Users size={16} />
                            <span>1 bạn bè</span>
                        </div>

                        <div className="text-xs text-gray-500">
                            Thành viên từ: {user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : '01/2026'}
                        </div>
                    </motion.div>

                    {/* Activity Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-2xl p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">1 hoạt động</h3>
                                <p className="text-xs text-gray-400">Trong tháng này</p>
                            </div>
                            <span className="text-xs text-red-400 cursor-pointer hover:underline">Tất cả hoạt động</span>
                        </div>

                        {/* Mini Calendar Mock */}
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex justify-between items-center text-white mb-4">
                                <button><ChevronLeft size={16} /></button>
                                <span className="text-sm font-medium">Tháng 01/2026</span>
                                <button><ChevronRight size={16} /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                                <span className="opacity-30">29</span><span className="opacity-30">30</span>
                                <span className="bg-red-500/20 text-red-400 rounded-full w-6 h-6 flex items-center justify-center mx-auto">1</span>
                                <span>2</span><span>3</span><span>4</span><span>5</span>
                            </div>
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
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-900 to-slate-900">
                            {/* Placeholder for real cover image */}
                        </div>
                        <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm transition-colors border border-white/10">
                            <Camera size={16} /> Chỉnh sửa ảnh bìa
                        </button>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="glass rounded-2xl p-2 flex flex-wrap gap-2">
                        {[
                            { id: 'achievements', label: 'Thành tích', icon: Award },
                            { id: 'friends', label: 'Bạn bè', icon: Users },
                            { id: 'edit', label: 'Chỉnh sửa thông tin', icon: Settings },
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
                            <div className="space-y-6">
                                <div className="flex gap-6 border-b border-white/10 pb-4">
                                    <button className="text-red-500 font-medium border-b-2 border-red-500 pb-4 -mb-[17px]">Giải đấu</button>
                                    <button className="text-gray-400 hover:text-white pb-4">Thử thách</button>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-4 py-1 rounded-full border border-red-500 text-red-500 text-sm bg-red-500/10 cursor-pointer">Tất cả</span>
                                    <span className="px-4 py-1 rounded-full border border-white/10 text-gray-400 text-sm hover:bg-white/5 cursor-pointer">Đang tham gia</span>
                                    <span className="px-4 py-1 rounded-full border border-white/10 text-gray-400 text-sm hover:bg-white/5 cursor-pointer">Đã kết thúc</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {achievements.map((item) => (
                                        <div key={item.id} className="glass rounded-2xl overflow-hidden group hover:bg-white/5 transition-colors">
                                            <div className="h-48 overflow-hidden relative">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
                                                    {item.status}
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={14} /> Chạy bộ
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Award size={14} className="text-yellow-500" /> {item.points}
                                                    </div>
                                                </div>
                                                <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-colors">
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'edit' && (
                            <div className="glass rounded-2xl p-8">
                                <h3 className="text-2xl font-bold text-white mb-6">Chỉnh Sửa Hồ Sơ</h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Họ và Tên</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Giới Tính</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                                            >
                                                <option value="MALE" className="bg-slate-800">Nam</option>
                                                <option value="FEMALE" className="bg-slate-800">Nữ</option>
                                                <option value="OTHER" className="bg-slate-800">Khác</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Năm Sinh</label>
                                            <input
                                                type="number"
                                                name="birthYear"
                                                value={formData.birthYear}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Avatar URL (hoặc dùng icon chỉnh sửa bên trái)</label>
                                            <input
                                                type="text"
                                                name="avatarUrl"
                                                value={formData.avatarUrl}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Giới Thiệu (Bio)</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                                        >
                                            {isLoading ? 'Đang Lưu...' : <><Save size={18} /> Lưu Thay Đổi</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="glass rounded-2xl p-12 text-center text-gray-400">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-medium text-white mb-2">Chưa có bạn bè</h3>
                                <p>Kết nối với những người chạy bộ khác để cùng nhau luyện tập!</p>
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
                                                <div className={`w-12 h-12 rounded-full border-4 ${frame.color || 'border-gray-200'} flex items-center justify-center bg-gray-100`}>
                                                    {frame.id === 'none' && <X size={20} className="text-gray-400" />}
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
                                            <div className="absolute -inset-2 rounded-full border-8 border-transparent pointer-events-none"></div>
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

export default Profile;
