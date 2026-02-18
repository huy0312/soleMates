import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Save, Calendar, Target, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const EditChallenge = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewBib, setPreviewBib] = useState('');
    const fileInputRef = useRef(null);
    const bibInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        imageUrl: '',
        distances: '',
        completionTime: '',
        registrationDeadline: '',
        bibUrl: '',
        rules: '',
        options: [],
        activityTypes: 'Run'
    });

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await api.get(`/challenges/${id}`);
                const data = response.data;
                // Format dates for datetime-local input
                const formatDate = (dateString) => dateString ? dateString.slice(0, 16) : '';

                setFormData({
                    ...data,
                    startDate: formatDate(data.startDate),
                    endDate: formatDate(data.endDate),
                    registrationDeadline: formatDate(data.registrationDeadline),
                    // Ensure options is array
                    options: data.options || []
                });

                if (data.imageUrl) setPreviewImage(data.imageUrl);
                if (data.bibUrl) setPreviewBib(data.bibUrl);

            } catch (error) {
                console.error("Error fetching challenge:", error);
                toast.error('Không thể tải thông tin thử thách');
                navigate('/admin/challenges');
            }
        };

        if (id) fetchChallenge();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { name: '', price: '', originalPrice: '', description: '' }]
        }));
    };

    const removeOption = (index) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBibChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewBib(reader.result);
                setFormData(prev => ({ ...prev, bibUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // State for temporary inputs
    const [tempDistance, setTempDistance] = useState('');
    const [tempTime, setTempTime] = useState('');

    const addDistance = () => {
        if (tempDistance.trim()) {
            const currentDistances = formData.distances ? formData.distances.split(',').map(s => s.trim()).filter(Boolean) : [];
            setFormData(prev => ({ ...prev, distances: [...currentDistances, tempDistance.trim()].join(', ') }));
            setTempDistance('');
        }
    };

    const removeDistance = (index) => {
        const currentDistances = formData.distances ? formData.distances.split(',').map(s => s.trim()).filter(Boolean) : [];
        const newDistances = currentDistances.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, distances: newDistances.join(', ') }));
    };

    const addTime = () => {
        if (tempTime.trim()) {
            const currentTimes = formData.completionTime ? formData.completionTime.split(',').map(s => s.trim()).filter(Boolean) : [];
            setFormData(prev => ({ ...prev, completionTime: [...currentTimes, tempTime.trim()].join(', ') }));
            setTempTime('');
        }
    };

    const removeTime = (index) => {
        const currentTimes = formData.completionTime ? formData.completionTime.split(',').map(s => s.trim()).filter(Boolean) : [];
        const newTimes = currentTimes.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, completionTime: newTimes.join(', ') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Using PUT for updates
            await api.put(`/challenges/${id}`, formData);
            toast.success('Cập nhật thử thách thành công!');
            navigate('/admin/challenges');
        } catch (error) {
            console.error('Failed to update challenge', error);
            toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Chỉnh Sửa Thử Thách</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tên Thử Thách</label>
                    <div className="relative">
                        <Type className="absolute left-4 top-3.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Thử thách mùa hè sôi động"
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white placeholder-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ảnh Bìa Thử Thách</label>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="w-full h-48 rounded-xl border-2 border-dashed border-gray-600 bg-slate-800/30 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors relative overflow-hidden group"
                    >
                        {previewImage ? (
                            <>
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload size={32} className="text-white" />
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="text-gray-500 mb-2" />
                                <p className="text-gray-400 text-sm">Nhấn để tải ảnh lên</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Hạn Đăng Ký</label>
                        <input
                            type="datetime-local"
                            name="registrationDeadline"
                            value={formData.registrationDeadline}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                        />
                    </div>
                    <div>
                        {/* Empty Spacer or remove grid-cols-2 if want single column */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Ngày Bắt Đầu Sự Kiện</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 text-gray-500" size={18} />
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Ngày Kết Thúc Sự Kiện</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 text-gray-500" size={18} />
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-400">Các Gói Đăng Ký (Options)</label>
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-cyan-400 text-sm hover:text-cyan-300"
                        >
                            + Thêm Gói
                        </button>
                    </div>
                    {formData.options.map((option, index) => (
                        <div key={index} className="glass p-4 rounded-xl space-y-3 relative border border-white/5">
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="absolute right-2 top-2 text-gray-500 hover:text-red-400"
                            >
                                <X size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Tên gói (VD: Cơ Bản)"
                                    value={option.name}
                                    onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá (VND)"
                                    value={option.price}
                                    onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá Gốc (VND)"
                                    value={option.originalPrice}
                                    onChange={(e) => handleOptionChange(index, 'originalPrice', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Mô tả (VD: Huy chương + Áo)"
                                    value={option.description}
                                    onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Các Cự Ly</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tempDistance}
                                onChange={(e) => setTempDistance(e.target.value)}
                                placeholder="VD: 5km"
                                className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDistance())}
                            />
                            <button type="button" onClick={addDistance} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-800/30 rounded-lg">
                            {formData.distances?.split(',').filter(Boolean).map((dist, idx) => (
                                <span key={idx} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    {dist.trim()}
                                    <button type="button" onClick={() => removeDistance(idx)} className="hover:text-white"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Thời Gian Hoàn Thành</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tempTime}
                                onChange={(e) => setTempTime(e.target.value)}
                                placeholder="VD: 30 ngày"
                                className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:border-cyan-500 outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTime())}
                            />
                            <button type="button" onClick={addTime} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-800/30 rounded-lg">
                            {formData.completionTime?.split(',').filter(Boolean).map((time, idx) => (
                                <span key={idx} className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    {time.trim()}
                                    <button type="button" onClick={() => removeTime(idx)} className="hover:text-white"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    {/* BIB Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Ảnh BIB</label>
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => bibInputRef.current.click()}
                                className="h-12 px-4 bg-slate-800/50 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors text-sm text-gray-300"
                            >
                                <Upload size={16} className="mr-2" /> Tải ảnh BIB
                            </div>
                            {previewBib && <img src={previewBib} alt="BIB" className="h-12 w-auto rounded border border-white/10" />}
                        </div>
                        <input
                            type="file"
                            ref={bibInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBibChange}
                        />
                    </div>
                </div>



                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Nội Dung (Bộ môn)</label>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'Run', label: 'Chạy bộ', icon: '🏃' },
                            { id: 'Walk', label: 'Đi bộ', icon: '🚶' },
                            { id: 'Ride', label: 'Đạp xe', icon: '🚴' },
                            { id: 'Swim', label: 'Bơi', icon: '🏊' }
                        ].map((type) => (
                            <label key={type.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${formData.activityTypes?.includes(type.id)
                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                : 'bg-slate-800/50 border-white/10 text-gray-400 hover:bg-slate-800'
                                }`}>
                                <input
                                    type="checkbox"
                                    value={type.id}
                                    checked={formData.activityTypes?.includes(type.id)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormData(prev => {
                                            const current = prev.activityTypes ? prev.activityTypes.split(',').filter(Boolean) : [];
                                            const updated = checked
                                                ? [...current, type.id]
                                                : current.filter(t => t !== type.id);
                                            return { ...prev, activityTypes: updated.join(',') };
                                        });
                                    }}
                                    className="hidden"
                                />
                                <span className="text-xl">{type.icon}</span>
                                <span className="font-medium">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Mô Tả Chi Tiết</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white resize-none"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Thể Lệ (Quy định)</label>
                    <textarea
                        name="rules"
                        value={formData.rules}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Quy định về tốc độ, thiết bị đo,..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white resize-none"
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/challenges')}
                        className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                    >
                        Hủy
                    </button>
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
    );
};

export default EditChallenge;
