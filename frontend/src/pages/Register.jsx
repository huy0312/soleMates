import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft, Chrome, Apple } from 'lucide-react';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!agreed) {
            setError('You must agree to the Terms & Conditions');
            return;
        }

        setIsLoading(true);

        const result = await register(fullName, email, password);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-[1000px] w-full h-[600px] bg-[#1a1b2e] rounded-3xl shadow-2xl overflow-hidden flex relative"
                >
                    <div className="w-1/2 hidden lg:block relative">
                        <div className="absolute inset-0">
                            <img
                                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
                                alt="Running Background"
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b2e] via-[#1a1b2e]/40 to-transparent"></div>
                        </div>
                        <div className="relative z-10 p-8">
                            <Link to="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all text-white text-sm font-medium">
                                <ArrowLeft size={16} />
                                Back to website
                            </Link>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 p-12 flex flex-col items-center justify-center text-center bg-[#1a1b2e] text-white">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <CheckCircle size={80} className="text-green-400 mb-6" />
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-4">Account Created!</h2>
                        <p className="text-gray-400 mb-8 max-w-sm">
                            We've sent a verification link to your email. Please check your inbox to activate your account.
                        </p>
                        <Link to="/login" className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-all shadow-lg shadow-violet-600/20">
                            Go to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-[1000px] w-full h-[650px] bg-[#1a1b2e] rounded-3xl shadow-2xl overflow-hidden flex relative"
            >
                {/* Left Side - Image */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-8 text-white">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
                            alt="Running Background"
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b2e] via-[#1a1b2e]/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all text-sm font-medium">
                            <ArrowLeft size={16} />
                            Back to website
                        </Link>
                    </div>

                    <div className="relative z-10 mb-8">
                        <h2 className="text-4xl font-bold mb-4">Push Your Limits,<br />Achieve More</h2>
                        <p className="text-gray-300">Start your journey with us today.</p>

                        {/* Slider Dots Placeholder */}
                        <div className="flex gap-2 mt-6">
                            <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                            <div className="w-8 h-1 bg-white rounded-full"></div>
                            <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-[#1a1b2e] overflow-y-auto custom-scrollbar">
                    <div className="max-w-md w-full mx-auto h-full flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
                        <p className="text-gray-400 mb-6">
                            Already have an account?
                            <Link to="/login" className="text-violet-400 hover:text-violet-300 ml-1 font-medium transition-colors">
                                Log in
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
                                <label className="text-sm font-medium text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#242641] border border-gray-700/50 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-gray-600 transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#242641] border border-gray-700/50 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-gray-600 transition-all"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#242641] border border-gray-700/50 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-gray-600 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#242641] border border-gray-700/50 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-gray-600 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-[#242641] text-violet-600 focus:ring-violet-500 focus:ring-offset-[#1a1b2e]"
                                />
                                <label htmlFor="agree" className="text-sm text-gray-400 select-none">
                                    I agree to the <a href="#" className="text-violet-400 hover:text-violet-300">Terms & Conditions</a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-violet-600 text-white py-3.5 rounded-xl font-medium hover:bg-violet-500 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20 mt-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    'Create account'
                                )}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700/50"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#1a1b2e] px-2 text-gray-500">Or register with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-[#242641] hover:bg-[#2d3052] border border-gray-700/30 rounded-xl text-white transition-colors">
                                    <Chrome size={18} />
                                    <span className="text-sm">Google</span>
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-[#242641] hover:bg-[#2d3052] border border-gray-700/30 rounded-xl text-white transition-colors">
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
