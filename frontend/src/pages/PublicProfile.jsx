import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Award, Calendar, MapPin, ArrowLeft, Users, UserPlus, UserCheck, Clock, UserX } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ActivityCalendar from '../components/ActivityCalendar';

const PublicProfile = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activities, setActivities] = useState([]);

    // Friendship state
    const [friendshipStatus, setFriendshipStatus] = useState(null); // null, PENDING, ACCEPTED, DECLINED
    const [friendshipLoading, setFriendshipLoading] = useState(false);
    const [isSelf, setIsSelf] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/profile/${token}`);
                setProfile(res.data);

                // Check if viewing own profile
                if (currentUser && res.data.id === currentUser.id) {
                    setIsSelf(true);
                } else if (currentUser && res.data.id) {
                    // Fetch friendship status
                    try {
                        const statusRes = await api.get(`/friends/status/${res.data.id}`);
                        setFriendshipStatus(statusRes.data);
                    } catch (err) {
                        // No friendship exists or error
                        setFriendshipStatus(null);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setError("Không tìm thấy người dùng này hoặc có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token, currentUser]);

    const handleAddFriend = async () => {
        if (!profile?.id) return;
        setFriendshipLoading(true);
        try {
            await api.post(`/friends/request/${profile.id}`);
            setFriendshipStatus('PENDING');
        } catch (err) {
            console.error("Failed to send friend request", err);
            const msg = err.response?.data;
            if (typeof msg === 'string' && msg.includes('already exists')) {
                setFriendshipStatus('PENDING');
            }
        } finally {
            setFriendshipLoading(false);
        }
    };

    const renderFriendButton = () => {
        if (isSelf || !currentUser) return null;

        if (friendshipStatus === 'ACCEPTED') {
            return (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl font-medium">
                    <UserCheck size={18} />
                    Bạn bè
                </div>
            );
        }

        if (friendshipStatus === 'PENDING') {
            return (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-xl font-medium">
                    <Clock size={18} />
                    Đã gửi lời mời
                </div>
            );
        }

        return (
            <button
                onClick={handleAddFriend}
                disabled={friendshipLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50"
            >
                {friendshipLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                    </>
                ) : (
                    <>
                        <UserPlus size={18} />
                        Kết bạn
                    </>
                )}
            </button>
        );
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <div className="text-white text-xl">Đang tải...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen pt-24 flex flex-col items-center justify-center p-4">
            <div className="glass p-8 rounded-2xl text-center max-w-md w-full">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );

    if (!profile) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-2xl p-6 flex flex-col items-center text-center"
                    >
                        <div className="w-32 h-32 rounded-full border-4 border-slate-700 p-1 bg-slate-800 overflow-hidden mb-4 relative">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                    <User size={48} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">{profile.fullName || "Runner"}</h2>
                        <div className="text-sm text-gray-400 mb-4">@{profile.username}</div>

                        <div className="px-4 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-4 flex items-center gap-2">
                            <Award size={14} className="text-amber-400" />
                            <span className="text-amber-400 font-medium text-sm">{profile.rank || 'Thành viên'} ({profile.points || 0} điểm)</span>
                        </div>

                        {/* Add Friend Button */}
                        <div className="mb-4">
                            {renderFriendButton()}
                        </div>

                        <div className="w-full border-t border-white/10 pt-4 text-left space-y-3">
                            {profile.showAddress && profile.address && (
                                <div className="flex items-center gap-3 text-gray-300 text-sm">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span>{profile.address}</span>
                                </div>
                            )}
                            {profile.showBirthday && profile.birthDate && (
                                <div className="flex items-center gap-3 text-gray-300 text-sm">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span>{new Date(profile.birthDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-gray-300 text-sm">
                                <Calendar size={16} className="text-gray-500" />
                                <span>Tham gia: {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Cover Photo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl overflow-hidden relative h-48 sm:h-64"
                    >
                        {profile.coverPhotoUrl ? (
                            <img src={profile.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-900 to-slate-900"></div>
                        )}
                    </motion.div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Giới thiệu</h3>
                            <p className="text-gray-300">{profile.bio}</p>
                        </div>
                    )}

                    {/* Placeholder for public activities/stats */}
                    <div className="glass rounded-2xl p-8 text-center text-gray-400">
                        <Award size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">Thành tích công khai</h3>
                        <p>Người dùng này chưa công khai thành tích chi tiết.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
