import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { members } from '../data/members';
import { ArrowLeft, Activity, MapPin, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const MemberDetail = () => {
    const { id } = useParams();
    const member = members.find(m => m.id === id);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Scroll to top on load
        window.scrollTo(0, 0);
    }, []);

    const handleConnect = () => {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
            setIsConnected(true);
            setIsLoading(false);
        }, 1500);
    };

    if (!member) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Không tìm thấy thành viên</h2>
                    <Link to="/" className="text-cyan-400 hover:underline">Quay lại trang chủ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/#team" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Quay lại Đội Ngũ
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Sidebar */}
                    <div className="md:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-2xl p-6 text-center border border-white/10"
                        >
                            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-cyan-500/30 mb-6 shadow-xl">
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">{member.name}</h1>
                            <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-cyan-400 text-sm font-medium tracking-wide border border-white/5">
                                {member.role}
                            </span>

                            <div className="mt-8 text-left space-y-4">
                                <div className="flex items-center text-gray-300">
                                    <MapPin size={18} className="mr-3 text-violet-400" />
                                    <span>Hà Nội, Việt Nam</span>
                                </div>
                                <div className="flex items-center text-gray-300">
                                    <Trophy size={18} className="mr-3 text-yellow-400" />
                                    <span>Thành viên từ 2024</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Bio Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-900/50 rounded-2xl p-8 border border-white/5"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Activity className="text-cyan-400" /> Giới Thiệu
                            </h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {member.bio}
                            </p>
                        </motion.div>

                        {/* Strava Connection Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-white/10 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Strava Activity</h2>
                                    <p className="text-gray-400 text-sm">Đồng bộ dữ liệu chạy bộ</p>
                                </div>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.png"
                                    alt="Strava Logo"
                                    className="h-8 opacity-80"
                                />
                            </div>

                            {!isConnected ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-6">Kết nối tài khoản Strava để hiển thị thành tích chạy bộ của bạn.</p>
                                    <button
                                        onClick={handleConnect}
                                        disabled={isLoading}
                                        className={`
                                    bg-[#fc4c02] hover:bg-[#e34402] text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto min-w-[200px]
                                    ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
                                `}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang kết nối...
                                            </span>
                                        ) : 'Kết nối với Strava'}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 text-center">
                                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Tổng Quãng Đường</p>
                                        <p className="text-2xl font-bold text-white">{member.stats.distance}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 text-center">
                                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Tổng Số Run</p>
                                        <p className="text-2xl font-bold text-white">{member.stats.runs}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 text-center">
                                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Pace Trung Bình</p>
                                        <p className="text-2xl font-bold text-white">{member.stats.pace}</p>
                                    </div>

                                    <div className="col-span-1 sm:col-span-3 mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-green-400 text-sm flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span> Đã đồng bộ
                                        </span>
                                        <button onClick={() => setIsConnected(false)} className="text-xs text-gray-500 hover:text-red-400 underline">
                                            Ngắt kết nối
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDetail;
