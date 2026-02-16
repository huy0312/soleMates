import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, Chrome, Apple, Eye, EyeOff } from 'lucide-react';
import loginBg from '../assets/login-bg.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            if (result.user?.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-[1000px] w-full h-[600px] bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden flex relative"
            >
                {/* Left Side - Image */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-8 text-white">
                    <div className="absolute inset-0">
                        <img
                            src={loginBg}
                            alt="Running Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-md transition-all text-sm font-medium border border-white/20">
                            <ArrowLeft size={16} />
                            Quay lại trang chủ
                        </Link>
                    </div>

                    <div className="relative z-10 mb-8">
                        <h2 className="text-4xl font-bold mb-4">Ghi lại Khoảnh Khắc,<br />Kiến tạo Kỷ Niệm</h2>
                        <p className="text-gray-200">Tham gia cộng đồng chạy bộ và chia sẻ hành trình của bạn.</p>

                        {/* Slider Dots Placeholder */}
                        <div className="flex gap-2 mt-6">
                            <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                            <div className="w-8 h-1 bg-white/50 rounded-full"></div>
                            <div className="w-8 h-1 bg-white/50 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-[#1e293b] overflow-y-auto custom-scrollbar">
                    <div className="max-w-md w-full mx-auto h-full flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại</h2>
                        <p className="text-slate-400 mb-8">
                            Chưa có tài khoản?
                            <Link to="/register" className="text-orange-500 hover:text-orange-600 ml-1 font-bold transition-colors">
                                Đăng ký
                            </Link>
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                            >
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition-all font-medium"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition-all pr-12 font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#1e293b] px-2 text-slate-400 font-medium">Hoặc tiếp tục với</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors font-medium">
                                    <Chrome size={18} />
                                    <span className="text-sm">Google</span>
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors font-medium">
                                    <Apple size={18} />
                                    <span className="text-sm">Apple</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
