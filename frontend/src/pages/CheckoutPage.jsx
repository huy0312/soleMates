import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, MapPin, User, CheckCircle, ArrowLeft } from 'lucide-react';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart } = useCart();
    const { user } = useAuth();

    // Determine items to checkout: either from direct navigation state or from cart
    const directItem = location.state?.item;
    const checkoutItems = directItem ? [directItem] : (cart?.items || []);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const calculateTotal = () => {
        if (directItem) {
            return directItem.price * (directItem.quantity || 1);
        }
        return cart?.items?.reduce((sum, item) => sum + (item.challengeOption.price * item.quantity), 0) || 0;
    };

    const total = calculateTotal();

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setLoading(false);
        setSuccess(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (success) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="glass p-8 rounded-2xl border border-white/10 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
                    <p className="text-gray-400 mb-8">Cảm ơn bạn đã đăng ký tham gia. Thông tin vé đã được gửi vào email của bạn.</p>
                    <button
                        onClick={() => navigate('/challenges')}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                    >
                        Quay về trang chủ
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
                    Quay lại danh sách giải
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
                {/* Billing Form */}
                <div className="lg:w-2/3">
                    <div className="glass p-6 rounded-2xl border border-white/10 mb-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-cyan-400" /> Thông tin người đăng ký
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Họ và tên</label>
                                <input type="text" defaultValue={user?.fullName} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" />
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

                {/* Order Summary */}
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
