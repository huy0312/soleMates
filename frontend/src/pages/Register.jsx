import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft, Chrome, Apple, Eye, EyeOff } from 'lucide-react';
import loginBg from '../assets/login-bg.jpg';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [strength, setStrength] = useState(0);
    const [showTerms, setShowTerms] = useState(false);

    const checkStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 7) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        setStrength(score);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        checkStrength(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (password !== confirmPassword) {
                setError('Mật khẩu nhập lại không khớp');
                return;
            }

            if (!agreed) {
                setError('Bạn phải đồng ý với Điều khoản & Điều kiện');
                return;
            }

            setIsLoading(true);

            const result = await register(fullName, email, password);

            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error("Register Error:", err);
            setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-[1000px] w-full h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex relative"
                >
                    <div className="w-1/2 hidden lg:block relative">
                        <div className="absolute inset-0">
                            <img
                                src={loginBg}
                                alt="Running Background"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        </div>
                        <div className="relative z-10 p-8">
                            <Link to="/" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-md transition-all text-white text-sm font-medium border border-white/20">
                                <ArrowLeft size={16} />
                                Quay lại trang chủ
                            </Link>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 p-12 flex flex-col items-center justify-center text-center bg-white text-slate-900">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <CheckCircle size={80} className="text-green-500 mb-6" />
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-4">Đăng ký thành công!</h2>
                        <p className="text-slate-500 mb-8 max-w-sm">
                            Chúng tôi đã gửi liên kết xác thực đến email của bạn. Vui lòng kiểm tra hộp thư đến để kích hoạt tài khoản.
                        </p>
                        <Link to="/login" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-white transition-all shadow-lg shadow-orange-500/20">
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-[1000px] w-full h-[750px] bg-[#1e293b] rounded-3xl shadow-2xl overflow-hidden flex relative"
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
                        <h2 className="text-4xl font-bold mb-4">Vượt qua Giới hạn,<br />Gặt hái Thành công</h2>
                        <p className="text-gray-200">Bắt đầu hành trình của bạn với chúng tôi ngay hôm nay.</p>

                        {/* Slider Dots Placeholder */}
                        <div className="flex gap-2 mt-6">
                            <div className="w-8 h-1 bg-white/50 rounded-full"></div>
                            <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                            <div className="w-8 h-1 bg-white/50 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-[#1e293b] overflow-y-auto custom-scrollbar">
                    <div className="max-w-md w-full mx-auto min-h-full flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Đăng ký tài khoản</h2>
                        <p className="text-slate-400 mb-6">
                            Đã có tài khoản?
                            <Link to="/login" className="text-orange-500 hover:text-orange-600 ml-1 font-bold transition-colors">
                                Đăng nhập
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Họ và Tên</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition-all font-medium"
                                    required
                                />
                            </div>

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
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition-all font-medium"
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
                                {/* Password Strength Meter */}
                                {password && (
                                    <div className="flex gap-1 mt-2 h-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full transition-all duration-300 ${i < strength
                                                    ? strength <= 2
                                                        ? 'bg-red-500'
                                                        : strength === 3
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    : 'bg-slate-700'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    {strength === 0 && 'Quá yếu'}
                                    {strength === 1 && 'Yếu'}
                                    {strength === 2 && 'Trung bình'}
                                    {strength === 3 && 'Tốt'}
                                    {strength === 4 && 'Rất mạnh'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300">Nhập lại mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 relative">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="agree" className="text-sm text-slate-400 select-none">
                                    Tôi đồng ý với{' '}
                                    <span
                                        className="text-orange-500 hover:text-orange-600 cursor-pointer relative font-medium"
                                        onMouseEnter={() => setShowTerms(true)}
                                        onMouseLeave={() => setShowTerms(false)}
                                    >
                                        Điều khoản & Điều kiện
                                    </span>
                                </label>

                                {/* Tooltip for Terms */}
                                <AnimatePresence>
                                    {showTerms && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 text-xs text-slate-300 pointer-events-none"
                                        >
                                            <div className="font-bold text-white mb-2">Điều khoản sử dụng</div>
                                            <p>
                                                Bằng việc đăng ký tài khoản, bạn đồng ý tuân thủ các quy định của cộng đồng Solemates,
                                                chính sách bảo mật dữ liệu và quy tắc ứng xử văn minh.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 mt-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    'Đăng ký'
                                )}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#1e293b] px-2 text-slate-400 font-medium">Hoặc đăng ký với</span>
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

export default Register;
