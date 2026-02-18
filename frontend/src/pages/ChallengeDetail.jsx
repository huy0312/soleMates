import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Share2, Heart, Users, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!selectedOption) return;
        addToCart(selectedOption.id, 1);
    };

    const handleRegisterNow = () => {
        if (!selectedOption) return;
        // Direct checkout flow: Navigate to checkout with the selected item
        navigate('/checkout', {
            state: {
                item: {
                    ...selectedOption,
                    quantity: 1,
                    // If we need challenge details in checkout (like title), add them here
                    challengeTitle: challenge.title
                }
            }
        });
    };

    // Fetch Challenge
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await api.get(`/challenges/${id}`);
                setChallenge(response.data);
            } catch (error) {
                console.error("Error fetching challenge", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    // Countdown Timer Logic
    useEffect(() => {
        if (!challenge?.registrationDeadline) return;

        const parseDate = (dateInput) => {
            if (!dateInput) return null;
            // If it's an array (from Java LocalDateTime default serialization): [year, month, day, hour, minute, second]
            if (Array.isArray(dateInput)) {
                return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);
            }
            // If it's a string (ISO)
            return new Date(dateInput);
        };

        const calculateTimeLeft = () => {
            const deadline = parseDate(challenge.registrationDeadline);
            const difference = +deadline - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return timeLeft;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [challenge]);

    if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading...</div>;
    if (!challenge) return <div className="min-h-screen text-white flex items-center justify-center">Challenge Not Found</div>;

    // Helper for formatting currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const parseDate = (dateInput) => {
        if (!dateInput) return null;
        if (Array.isArray(dateInput)) {
            return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);
        }
        return new Date(dateInput);
    };

    const formatDate = (dateInput) => {
        const date = parseDate(dateInput);
        if (!date) return '';
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="text-gray-400 text-sm mb-8">
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Trang chủ</span>
                <span className="mx-2">›</span>
                <span className="hover:text-white cursor-pointer">Thử thách</span>
                <span className="mx-2">›</span>
                <span className="text-white">{challenge.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Images */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="glass p-2 rounded-2xl overflow-hidden aspect-square relative group">
                        <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover rounded-xl" />
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    {/* Thumbnails including BIB if exists */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="aspect-square rounded-xl overflow-hidden glass p-1 cursor-pointer border-2 border-cyan-500">
                            <img src={challenge.imageUrl} alt="Thumbnail 1" className="w-full h-full object-cover rounded-lg" />
                        </div>
                        {challenge.bibUrl && (
                            <div className="aspect-square rounded-xl overflow-hidden glass p-1 cursor-pointer hover:border-white/20 border border-transparent">
                                <img src={challenge.bibUrl} alt="BIB" className="w-full h-full object-cover rounded-lg" />
                            </div>
                        )}
                        {/* Placeholders for visual consistency */}
                        <div className="aspect-square rounded-xl overflow-hidden glass p-1 bg-slate-800/50"></div>
                        <div className="aspect-square rounded-xl overflow-hidden glass p-1 bg-slate-800/50"></div>
                    </div>
                </div>

                {/* Right Column: Info */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{challenge.title}</h1>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            {challenge.description}
                        </p>
                    </div>

                    {/* Countdown */}
                    {challenge.registrationDeadline && (
                        <div>
                            <h3 className="font-bold text-white mb-4">Thời hạn đăng ký</h3>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                                    <div key={unit} className="bg-slate-100 text-slate-900 rounded-lg p-3">
                                        <div className="text-2xl font-bold font-mono">
                                            {timeLeft[unit] !== undefined ? String(timeLeft[unit]).padStart(2, '0') : '00'}
                                        </div>
                                        <div className="text-xs uppercase font-medium text-slate-500 mt-1">
                                            {unit === 'days' ? 'Ngày' : unit === 'hours' ? 'Giờ' : unit === 'minutes' ? 'Phút' : 'Giây'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info List */}
                    <div className="space-y-6">
                        {/* Selections */}
                        <div>
                            <h4 className="text-gray-400 text-xs uppercase font-bold mb-3">Chọn Cự Ly</h4>
                            <div className="flex flex-wrap gap-3">
                                {challenge.distances?.split(',').map((dist, idx) => (
                                    <button key={idx} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 hover:border-cyan-500 focus:bg-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-gray-300">
                                        {dist.trim()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-gray-400 text-xs uppercase font-bold mb-3">Bộ Môn</h4>
                            <div className="flex gap-3">
                                {challenge.activityTypes?.split(',').map((type) => {
                                    const activityMap = {
                                        'Run': { label: 'Chạy bộ', icon: '🏃' },
                                        'Walk': { label: 'Đi bộ', icon: '🚶' },
                                        'Ride': { label: 'Đạp xe', icon: '🚴' },
                                        'Swim': { label: 'Bơi', icon: '🏊' }
                                    };
                                    const info = activityMap[type] || { label: type, icon: '🏅' };

                                    return (
                                        <div key={type} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-white/10 text-gray-300">
                                            <span>{info.icon}</span>
                                            <span className="text-sm font-medium">{info.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-gray-400 text-xs uppercase font-bold mb-3">Thời gian hoàn thành</h4>
                            <div className="flex flex-wrap gap-3">
                                {challenge.completionTime?.split(',').map((time, idx) => (
                                    <button key={idx} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 hover:border-cyan-500 focus:bg-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-gray-300">
                                        {time.trim()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Packages */}
                        <div>
                            <h4 className="text-gray-400 text-xs uppercase font-bold mb-3">Chọn Gói Đăng Ký</h4>
                            <div className="space-y-3">
                                {challenge.options?.map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => setSelectedOption(opt)}
                                        className={`glass p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${selectedOption?.id === opt.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-cyan-500'}`}
                                    >
                                        <div>
                                            <h5 className={`font-bold transition-colors ${selectedOption?.id === opt.id ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>{opt.name}</h5>
                                            <p className="text-xs text-gray-400">{opt.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="block font-bold text-lg text-white">{formatCurrency(opt.price)}</span>
                                                {opt.originalPrice && opt.originalPrice > opt.price && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 line-through">{formatCurrency(opt.originalPrice)}</span>
                                                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">
                                                            -{Math.round(((opt.originalPrice - opt.price) / opt.originalPrice) * 100)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="flex items-start gap-3">
                            <Calendar className="text-gray-500 mt-0.5" size={18} />
                            <div>
                                <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Thời gian diễn ra</span>
                                <span className="text-white">
                                    {formatDate(challenge.startDate)}
                                    {' - '}
                                    {formatDate(challenge.endDate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Users className="text-gray-500 mt-0.5" size={18} />
                            <div>
                                <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Tham gia</span>
                                <span className="text-white">{challenge.participantsCount} VĐV - 0 bạn bè đang tham gia</span>
                            </div>
                        </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-6 border-t border-white/10">
                        {/* Price Display Logic would go here based on selection, simple view for now */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleRegisterNow}
                                disabled={!selectedOption}
                                className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg shadow-red-900/20"
                            >
                                Đăng kí ngay
                            </button>
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedOption}
                                className={`px-6 py-3 rounded-full border font-medium transition-colors flex items-center gap-2 ${selectedOption ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-700 text-gray-600 cursor-not-allowed'}`}
                            >
                                <Users size={18} /> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ChallengeDetail;
