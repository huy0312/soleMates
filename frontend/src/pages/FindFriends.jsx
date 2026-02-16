import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, UserPlus, Users, Award, Loader2, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FindFriends = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [friendStatuses, setFriendStatuses] = useState({});
    const [sendingRequest, setSendingRequest] = useState({});

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`);
            const users = res.data.filter(u => u.id !== currentUser?.id);
            setResults(users);

            // Fetch friendship status for each result
            const statuses = {};
            for (const user of users) {
                try {
                    const statusRes = await api.get(`/friends/status/${user.id}`);
                    statuses[user.id] = statusRes.data;
                } catch {
                    statuses[user.id] = null;
                }
            }
            setFriendStatuses(statuses);
        } catch (err) {
            console.error("Search failed:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (userId) => {
        setSendingRequest(prev => ({ ...prev, [userId]: true }));
        try {
            await api.post(`/friends/request/${userId}`);
            setFriendStatuses(prev => ({ ...prev, [userId]: 'PENDING' }));
        } catch (err) {
            console.error("Failed to send request:", err);
        } finally {
            setSendingRequest(prev => ({ ...prev, [userId]: false }));
        }
    };

    const renderFriendAction = (user) => {
        const status = friendStatuses[user.id];
        const isSending = sendingRequest[user.id];

        if (status === 'ACCEPTED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium">
                    <Users size={14} /> Bạn bè
                </span>
            );
        }

        if (status === 'PENDING') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium">
                    Đã gửi lời mời
                </span>
            );
        }

        return (
            <button
                onClick={() => handleAddFriend(user.id)}
                disabled={isSending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isSending ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <UserPlus size={14} />
                )}
                Kết bạn
            </button>
        );
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                        <Users size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Tìm bạn bè</h1>
                    <p className="text-gray-400">Tìm kiếm bạn bè bằng tên, username hoặc email</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Nhập tên, username hoặc email..."
                            className="w-full pl-12 pr-24 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-lg"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Tìm'}
                        </button>
                    </div>
                </form>

                {/* Results */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-cyan-400" />
                        <span className="ml-3 text-gray-400">Đang tìm kiếm...</span>
                    </div>
                )}

                {!loading && searched && results.length === 0 && (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Users size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Không tìm thấy</h3>
                        <p className="text-gray-400">Không có người dùng nào phù hợp với "{query}"</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400 mb-4">Tìm thấy {results.length} kết quả</p>
                        <AnimatePresence>
                            {results.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div
                                        onClick={() => user.shareToken && navigate(`/p/${user.shareToken}`)}
                                        className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all"
                                    >
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => user.shareToken && navigate(`/p/${user.shareToken}`)}
                                    >
                                        <h3 className="text-white font-semibold truncate hover:text-cyan-400 transition-colors">
                                            {user.fullName || user.username || 'Runner'}
                                        </h3>
                                        <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                                        {user.rank && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Award size={12} className="text-amber-400" />
                                                <span className="text-amber-400 text-xs font-medium">{user.rank}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex-shrink-0">
                                        {renderFriendAction(user)}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Quick tips when not searched */}
                {!searched && (
                    <div className="glass rounded-2xl p-8 text-center">
                        <Search size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Bắt đầu tìm kiếm</h3>
                        <p className="text-gray-400 mb-4">Nhập tên, username hoặc email để tìm bạn bè</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['Ví dụ: NguyenVanA', 'example@gmail.com'].map((hint, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-gray-500 text-sm">
                                    {hint}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default FindFriends;
