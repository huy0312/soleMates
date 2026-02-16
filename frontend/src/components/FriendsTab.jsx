import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, UserPlus, Users, Award, Loader2, X, Check, UserX } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FriendsTab = ({ currentUser, viewedUser, isOwner }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [friendStatuses, setFriendStatuses] = useState({});
    const [friendshipIds, setFriendshipIds] = useState({});
    const [friendDirections, setFriendDirections] = useState({});
    const [sendingRequest, setSendingRequest] = useState({});
    const [cancellingRequest, setCancellingRequest] = useState({});

    // Friends list & pending requests
    const [friendsList, setFriendsList] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [processingRequest, setProcessingRequest] = useState({});

    // Fetch friends list and pending requests on mount
    useEffect(() => {
        if (isOwner) {
            fetchFriendsAndPending();
        }
    }, [isOwner]);

    const fetchFriendsAndPending = async () => {
        setLoadingFriends(true);
        try {
            const [friendsRes, pendingRes] = await Promise.all([
                api.get('/friends/list'),
                api.get('/friends/pending')
            ]);
            setFriendsList(friendsRes.data);
            setPendingRequests(pendingRes.data);
        } catch (err) {
            console.error("Failed to fetch friends:", err);
        } finally {
            setLoadingFriends(false);
        }
    };

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setSearchLoading(true);
        setSearched(true);
        try {
            const res = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`);
            const users = res.data.filter(u => u.id !== currentUser?.id);
            setSearchResults(users);

            const statuses = {};
            const ids = {};
            const directions = {};
            for (const user of users) {
                try {
                    const statusRes = await api.get(`/friends/status/${user.id}`);
                    if (statusRes.data) {
                        statuses[user.id] = statusRes.data.status;
                        ids[user.id] = statusRes.data.friendshipId;
                        directions[user.id] = statusRes.data.direction;
                    } else {
                        statuses[user.id] = null;
                        directions[user.id] = null;
                    }
                } catch {
                    statuses[user.id] = null;
                }
            }
            setFriendStatuses(statuses);
            setFriendshipIds(ids);
            setFriendDirections(directions);
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddFriend = async (userId) => {
        setSendingRequest(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await api.post(`/friends/request/${userId}`);
            setFriendStatuses(prev => ({ ...prev, [userId]: 'PENDING' }));
            setFriendDirections(prev => ({ ...prev, [userId]: 'SENT' }));
            setFriendshipIds(prev => ({ ...prev, [userId]: res.data.id }));
            toast.success('Đã gửi lời mời kết bạn!');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Không thể gửi lời mời kết bạn';
            toast.error(typeof msg === 'string' ? msg : 'Không thể gửi lời mời kết bạn');
        } finally {
            setSendingRequest(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleCancelRequest = async (userId) => {
        const fId = friendshipIds[userId];
        if (!fId) return;
        setCancellingRequest(prev => ({ ...prev, [userId]: true }));
        try {
            await api.delete(`/friends/${fId}/cancel`);
            setFriendStatuses(prev => ({ ...prev, [userId]: null }));
            setFriendshipIds(prev => { const n = { ...prev }; delete n[userId]; return n; });
            toast.success('Đã huỷ lời mời kết bạn');
        } catch (err) {
            toast.error('Không thể huỷ lời mời');
        } finally {
            setCancellingRequest(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleAcceptRequest = async (friendshipId) => {
        setProcessingRequest(prev => ({ ...prev, [friendshipId]: 'accepting' }));
        try {
            await api.put(`/friends/${friendshipId}/accept`);
            fetchFriendsAndPending();
        } catch (err) {
            console.error("Failed to accept:", err);
        } finally {
            setProcessingRequest(prev => ({ ...prev, [friendshipId]: null }));
        }
    };

    const handleDeclineRequest = async (friendshipId) => {
        setProcessingRequest(prev => ({ ...prev, [friendshipId]: 'declining' }));
        try {
            await api.put(`/friends/${friendshipId}/decline`);
            setPendingRequests(prev => prev.filter(r => r.friendshipId !== friendshipId));
        } catch (err) {
            console.error("Failed to decline:", err);
        } finally {
            setProcessingRequest(prev => ({ ...prev, [friendshipId]: null }));
        }
    };

    const renderFriendAction = (user) => {
        const status = friendStatuses[user.id];
        const direction = friendDirections[user.id];
        const isSending = sendingRequest[user.id];

        if (status === 'ACCEPTED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium">
                    <Users size={14} /> Bạn bè
                </span>
            );
        }
        if (status === 'PENDING') {
            if (direction === 'SENT') {
                return (
                    <button
                        onClick={() => handleCancelRequest(user.id)}
                        disabled={cancellingRequest[user.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-red-600/20 hover:border-red-500/30 hover:text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {cancellingRequest[user.id] ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Huỷ lời mời
                    </button>
                );
            } else {
                // RECEIVED
                const fId = friendshipIds[user.id];
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleAcceptRequest(fId)}
                            disabled={!!processingRequest[fId]}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {processingRequest[fId] === 'accepting' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Chấp nhận
                        </button>
                        <button
                            onClick={() => handleDeclineRequest(fId)}
                            disabled={!!processingRequest[fId]}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {processingRequest[fId] === 'declining' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                            Từ chối
                        </button>
                    </div>
                );
            }
        }

        return (
            <button
                onClick={() => handleAddFriend(user.id)}
                disabled={isSending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isSending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Kết bạn
            </button>
        );
    };

    const UserCard = ({ user, actions }) => (
        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors border border-white/5">
            <div
                onClick={() => user.shareToken && navigate(`/p/${user.shareToken}`)}
                className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all"
            >
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                    </div>
                )}
            </div>
            <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => user.shareToken && navigate(`/p/${user.shareToken}`)}
            >
                <h4 className="text-white font-semibold truncate hover:text-cyan-400 transition-colors">
                    {user.fullName || user.username || 'Runner'}
                </h4>
                <p className="text-gray-400 text-sm truncate">@{user.username}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                {actions}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Tìm kiếm bạn bè</h3>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Nhập tên, username hoặc email..."
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-white pl-12 pr-20"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setSearchResults([]); setSearched(false); }}
                                className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={searchLoading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {searchLoading ? <Loader2 size={14} className="animate-spin" /> : 'Tìm'}
                        </button>
                    </div>
                </form>

                {/* Search Results */}
                {searchLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-cyan-400" />
                        <span className="ml-2 text-gray-400 text-sm">Đang tìm kiếm...</span>
                    </div>
                )}

                {!searchLoading && searched && searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Không tìm thấy người dùng nào</p>
                    </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-xs text-gray-500 mb-2">{searchResults.length} kết quả</p>
                        <AnimatePresence>
                            {searchResults.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <UserCard user={user} actions={renderFriendAction(user)} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {isOwner && pendingRequests.length > 0 && (
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-amber-400" />
                        Lời mời kết bạn
                        <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full font-medium">
                            {pendingRequests.length}
                        </span>
                    </h3>
                    <div className="space-y-2">
                        {pendingRequests.map((req) => (
                            <UserCard
                                key={req.friendshipId}
                                user={req}
                                actions={
                                    <>
                                        <button
                                            onClick={() => handleAcceptRequest(req.friendshipId)}
                                            disabled={!!processingRequest[req.friendshipId]}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {processingRequest[req.friendshipId] === 'accepting'
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <Check size={14} />}
                                            Chấp nhận
                                        </button>
                                        <button
                                            onClick={() => handleDeclineRequest(req.friendshipId)}
                                            disabled={!!processingRequest[req.friendshipId]}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {processingRequest[req.friendshipId] === 'declining'
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <X size={14} />}
                                            Từ chối
                                        </button>
                                    </>
                                }
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={20} className="text-cyan-400" />
                    Danh sách bạn bè
                    {friendsList.length > 0 && (
                        <span className="ml-auto bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full font-medium">
                            {friendsList.length}
                        </span>
                    )}
                </h3>

                {loadingFriends ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-cyan-400" />
                    </div>
                ) : friendsList.length > 0 ? (
                    <div className="space-y-2">
                        {friendsList.map((friend) => (
                            <UserCard
                                key={friend.id}
                                user={friend}
                                actions={
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium">
                                        <Users size={14} /> Bạn bè
                                    </span>
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <Users size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">Chưa có bạn bè nào</p>
                        <p className="text-xs text-gray-500 mt-1">Tìm kiếm và kết bạn ngay!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsTab;
