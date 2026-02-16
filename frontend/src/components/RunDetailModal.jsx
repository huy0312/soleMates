import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, Zap, Activity, Calendar, TrendingUp, Brain, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const RunDetailModal = ({ activityId, onClose }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    useEffect(() => {
        const fetchActivityDetail = async () => {
            if (!activityId) return;
            setLoading(true);
            setAiAnalysis(null);
            setAnalysisError(null);
            try {
                const res = await api.get(`/strava/activities/${activityId}`);
                setActivity(res.data);
            } catch (error) {
                console.error("Failed to fetch activity detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivityDetail();
    }, [activityId]);

    const handleAnalyze = async () => {
        if (!activityId) return;
        setAnalyzing(true);
        setAnalysisError(null);
        try {
            const res = await api.post(`/strava/activities/${activityId}/analyze`);
            setAiAnalysis(res.data.analysis);
        } catch (error) {
            console.error("AI Analysis failed:", error);
            const serverMsg = error.response?.data?.error;
            setAnalysisError(serverMsg || "Không thể phân tích. Vui lòng thử lại.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (!activityId) return null;

    // Helper to format duration
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
    };

    // Helper to format pace
    const formatPace = (speed) => {
        if (!speed) return '0:00';
        const pace = 16.6666667 / speed; // min/km
        const m = Math.floor(pace);
        const s = Math.round((pace - m) * 60);
        return `${m}:${s < 10 ? '0' : ''}${s}/km`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1a1f2e] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white max-w-md truncate">
                                    {loading ? 'Đang tải...' : activity?.name}
                                </h2>
                                {!loading && activity && (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <Calendar size={14} />
                                        {new Date(activity.start_date_local).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400">Đang tải chi tiết hoạt động...</p>
                            </div>
                        ) : activity ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Stats */}
                                    <div className="space-y-6">
                                        {/* Main Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <MapPin size={16} /> Quãng đường
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {(activity.distance / 1000).toFixed(2)} <span className="text-sm text-gray-400 font-normal">km</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <Clock size={16} /> Thời gian
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {formatDuration(activity.moving_time)}
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <Zap size={16} /> Tốc độ TB
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {formatPace(activity.average_speed)}
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <TrendingUp size={16} /> Calories
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {activity.kilojoules ? (activity.kilojoules).toFixed(0) : '-'} <span className="text-sm text-gray-400 font-normal">kcal</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Details */}
                                        <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5 space-y-4">
                                            <h3 className="font-bold text-white text-lg border-b border-white/10 pb-2">Chi tiết khác</h3>
                                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                                <div>
                                                    <div className="text-gray-500">Độ cao đạt được</div>
                                                    <div className="text-white font-medium">{activity.total_elevation_gain || 0}m</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Tốc độ tối đa</div>
                                                    <div className="text-white font-medium">{formatPace(activity.max_speed)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Nhịp tim TB</div>
                                                    <div className="text-white font-medium">{activity.average_heartrate ? Math.round(activity.average_heartrate) + ' bpm' : 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Nhịp tim tối đa</div>
                                                    <div className="text-white font-medium">{activity.max_heartrate ? Math.round(activity.max_heartrate) + ' bpm' : 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Map */}
                                    <div className="space-y-6">
                                        <div className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden h-64 lg:h-full relative flex items-center justify-center">
                                            {activity.map?.summary_polyline ? (
                                                <div className="text-gray-500 flex flex-col items-center">
                                                    <MapPin size={48} className="mb-2 opacity-50" />
                                                    <span>Polyline khả dụng</span>
                                                    <span className="text-xs text-gray-600 mt-1">Tích hợp bản đồ sẽ sớm có mặt</span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 flex flex-col items-center">
                                                    <MapPin size={48} className="mb-2 opacity-50" />
                                                    <span>Không có dữ liệu bản đồ</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis Section */}
                                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                    <Brain size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">Phân tích AI</h3>
                                                    <p className="text-xs text-gray-400">Powered by Google Gemini</p>
                                                </div>
                                            </div>
                                            {!aiAnalysis && !analyzing && (
                                                <button
                                                    onClick={handleAnalyze}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                                                >
                                                    <Sparkles size={16} />
                                                    Phân tích hoạt động
                                                </button>
                                            )}
                                        </div>

                                        {analyzing && (
                                            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 border-4 border-purple-500/30 rounded-full"></div>
                                                    <Loader2 size={48} className="absolute inset-0 text-purple-500 animate-spin" />
                                                </div>
                                                <p className="text-gray-400 text-sm">Gemini đang phân tích hoạt động của bạn...</p>
                                            </div>
                                        )}

                                        {analysisError && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                                                {analysisError}
                                            </div>
                                        )}

                                        {aiAnalysis && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-800/50 rounded-xl p-5 border border-white/5"
                                            >
                                                <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                    {aiAnalysis}
                                                </div>
                                            </motion.div>
                                        )}

                                        {!aiAnalysis && !analyzing && !analysisError && (
                                            <p className="text-gray-500 text-sm">
                                                Nhấn "Phân tích hoạt động" để nhận đánh giá chi tiết từ AI về hiệu suất, điểm mạnh và gợi ý cải thiện.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                Không tìm thấy thông tin hoạt động.
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RunDetailModal;
