import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, User, CheckCircle, ArrowLeft, Download, Hash } from 'lucide-react';
import { generateBibImage } from '../utils/generateBib';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart } = useCart();
    const { user } = useAuth();

    const directItem = location.state?.item;
    const challengeInfo = location.state?.challenge; // { title, bibUrl }
    const checkoutItems = directItem ? [directItem] : (cart?.items || []);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generatedBib, setGeneratedBib] = useState(null);

    // BIB form state
    const [bibNumber, setBibNumber] = useState('');
    const [runnerName, setRunnerName] = useState(user?.fullName || '');
    const [bibPreview, setBibPreview] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const debounceRef = useRef(null);

    const calculateTotal = () => {
        if (directItem) return directItem.price * (directItem.quantity || 1);
        return cart?.items?.reduce((sum, item) => sum + (item.challengeOption.price * item.quantity), 0) || 0;
    };
    const total = calculateTotal();



    // Auto-generate BIB preview whenever bibNumber or runnerName changes
    const regenerateBib = useCallback(async () => {
        if (!bibNumber.trim() || !runnerName.trim()) {
            setBibPreview(null);
            return;
        }
        setIsGenerating(true);
        try {
            const dataUrl = await generateBibImage(
                challengeInfo?.bibUrl || null,
                bibNumber.trim(),
                runnerName.trim(),
                challengeInfo?.title || ''
            );
            setBibPreview(dataUrl);
        } catch (e) {
            console.error('BIB generation failed', e);
        } finally {
            setIsGenerating(false);
        }
    }, [bibNumber, runnerName, challengeInfo]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            regenerateBib();
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [regenerateBib]);

    const handleDownloadBib = () => {
        if (!bibPreview) return;
        const link = document.createElement('a');
        link.href = bibPreview;
        link.download = `BIB_${bibNumber}.png`;
        link.click();
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Save transaction to backend
            const transactions = checkoutItems.map(item => {
                const option = directItem ? item : item.challengeOption;
                const qty = directItem ? (item.quantity || 1) : item.quantity;
                return {
                    userId: user.userId || user.id, // Handle both cases just to be safe
                    challengeOptionId: option.id,
                    amount: option.price * qty,
                    status: 'SUCCESS',
                    paymentMethod: 'SIMULATED'
                };
            });

            // Process all transactions
            await Promise.all(transactions.map(tx => api.post('/dashboard/transaction', tx)));

            // Save generated BIB
            if (bibPreview) setGeneratedBib(bibPreview);
            setSuccess(true);
        } catch (error) {
            console.error("Payment failed", error);
            // toast.error("Thanh toán thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="glass p-8 rounded-2xl border border-white/10 text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Đăng ký thành công!</h2>
                    <p className="text-gray-400 mb-6">Cảm ơn bạn đã đăng ký tham gia. Thông tin vé đã được gửi vào email của bạn.</p>

                    {generatedBib && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-400 mb-3">BIB của bạn:</p>
                            <img src={generatedBib} alt="Your BIB" className="w-full rounded-xl border border-white/10 shadow-xl mb-3" />
                            <button
                                onClick={handleDownloadBib}
                                className="flex items-center gap-2 mx-auto px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-colors"
                            >
                                <Download size={16} /> Tải BIB về
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/challenges')}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                    >
                        Quay về trang thử thách
                    </button>
                </div>
            </div>
        );
    }

    if (checkoutItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 text-center">
                <h2 className="text-xl text-white">Không có sản phẩm nào để thanh toán</h2>
                <button onClick={() => navigate('/challenges')} className="text-cyan-400 mt-4 hover:underline">
                    Quay lại danh sách thử thách
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
                <ArrowLeft size={18} /> Quay lại
            </button>

            <h1 className="text-3xl font-bold text-white mb-8">Thanh Toán</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Forms */}
                <div className="lg:w-2/3 space-y-6">
                    {/* Registrant Info */}
                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-cyan-400" /> Thông tin người đăng ký
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Họ và tên</label>
                                <input
                                    type="text"
                                    value={runnerName}
                                    onChange={(e) => setRunnerName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Email</label>
                                <input type="email" defaultValue={user?.email} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Số điện thoại</label>
                                <input type="tel" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="0912..." />
                            </div>
                        </div>
                    </div>

                    {/* BIB Section */}
                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Hash size={20} className="text-orange-400" /> Số BIB của bạn
                        </h3>
                        <p className="text-gray-400 text-sm mb-5">Nhập số BIB để tự động tạo ảnh BIB cá nhân hoá.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Số BIB</label>
                                <input
                                    type="text"
                                    value={bibNumber}
                                    onChange={(e) => setBibNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="VD: 1234"
                                    maxLength={6}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white text-xl font-bold tracking-widest focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Tên trên BIB</label>
                                <input
                                    type="text"
                                    value={runnerName}
                                    onChange={(e) => setRunnerName(e.target.value)}
                                    placeholder="Tên của bạn"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* BIB Preview */}
                        <div className="relative">
                            {isGenerating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-xl z-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                                </div>
                            )}

                            {bibPreview ? (
                                <div className="space-y-3">
                                    <img
                                        src={bibPreview}
                                        alt="BIB Preview"
                                        className="w-full rounded-xl border border-white/10 shadow-xl shadow-black/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDownloadBib}
                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Download size={14} /> Tải preview BIB
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-48 rounded-xl border-2 border-dashed border-white/10 bg-slate-800/30 flex flex-col items-center justify-center text-gray-500">
                                    <Hash size={32} className="mb-2 opacity-30" />
                                    <p className="text-sm">Nhập số BIB và tên để xem preview</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-cyan-400" /> Phương thức thanh toán
                        </h3>
                        <div className="space-y-3">
                            {['Thẻ ATM / Internet Banking', 'Ví MoMo', 'Thẻ thanh toán quốc tế (Visa/Master)', 'Chuyển khoản ngân hàng'].map((method, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                                    <input type="radio" name="payment" className="form-radio text-cyan-500" defaultChecked={idx === 0} />
                                    <span className="text-gray-300">{method}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:w-1/3">
                    <div className="glass p-6 rounded-2xl border border-white/10 sticky top-24">
                        <h3 className="text-xl font-bold text-white mb-6">Đơn hàng của bạn</h3>

                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {checkoutItems.map((item, idx) => {
                                const option = directItem ? item : item.challengeOption;
                                const qty = directItem ? (item.quantity || 1) : item.quantity;
                                return (
                                    <div key={idx} className="flex justify-between items-start gap-4 text-sm">
                                        <div>
                                            <div className="text-white font-medium">{option.name}</div>
                                            <div className="text-gray-500">x{qty}</div>
                                        </div>
                                        <div className="text-gray-300 whitespace-nowrap">
                                            {formatCurrency(option.price * qty)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {bibNumber && (
                            <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 rounded-lg px-3 py-2 mb-4 border border-orange-500/20">
                                <Hash size={12} />
                                <span>BIB #{bibNumber} — {runnerName}</span>
                            </div>
                        )}

                        <div className="border-t border-white/10 pt-4 mb-6">
                            <div className="flex justify-between text-white font-bold text-lg">
                                <span>Tổng cộng</span>
                                <span className="text-cyan-400">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
