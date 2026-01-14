import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CartPage = () => {
    const { cart, loading, removeFromCart, refreshCart } = useCart();
    const navigate = useNavigate();

    // Calculate total
    const total = cart?.items?.reduce((sum, item) => sum + (item.challengeOption.price * item.quantity), 0) || 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return <div className="min-h-screen pt-24 flex justify-center text-white">Loading...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-white mb-6">Giỏ hàng của bạn</h1>
                <div className="glass p-12 rounded-2xl border border-white/10 flex flex-col items-center">
                    <p className="text-gray-400 mb-8 text-lg">Giỏ hàng đang trống.</p>
                    <Link to="/challenges" className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                        Khám phá giải chạy
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Giỏ hàng của bạn</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="lg:w-2/3 space-y-4">
                    {cart.items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-4 rounded-xl border border-white/10 flex gap-4 items-center"
                        >
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                {/* Assuming challenge has image, but option doesn't have direct image link usually. 
                                    We might need to fetch challenge info or rely on what's available. 
                                    For now, placeholder or if option has link back to challenge.
                                    The backend entity 'ChallengeOption' links to 'Challenge', but is it exposed in JSON?
                                    Usually @JsonIgnore on 'challenge' in 'ChallengeOption' prevents infinite recursion.
                                    So we might not have the image here unless we change backend DTOs.
                                    For now, use a generic placeholder or try to see if we can get it.
                                */}
                                <div className="w-full h-full bg-gradient-to-br from-violet-900 to-slate-900 flex items-center justify-center text-xs text-gray-500">
                                    IMG
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">{item.challengeOption.name}</h3>
                                <p className="text-gray-400 text-sm">{item.challengeOption.description}</p>
                                <div className="text-cyan-400 font-bold mt-2">
                                    {formatCurrency(item.challengeOption.price)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-white font-medium">x{item.quantity}</div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mt-4">
                        <ArrowLeft size={18} /> Tiếp tục mua sắm
                    </button>
                </div>

                {/* Summary */}
                <div className="lg:w-1/3">
                    <div className="glass p-6 rounded-2xl border border-white/10 sticky top-24">
                        <h3 className="text-xl font-bold text-white mb-6">Tổng cộng</h3>

                        <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
                            <div className="flex justify-between text-gray-300">
                                <span>Tạm tính</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Giảm giá</span>
                                <span>0 đ</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-white font-bold text-xl mb-8">
                            <span>Thành tiền</span>
                            <span className="text-cyan-400">{formatCurrency(total)}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <CreditCard size={20} /> Thanh Toán Ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
