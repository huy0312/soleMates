import React, { useState, useEffect } from 'react';
import postApi from '../api/postApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon,
    Smile, MapPin, Users, Calendar, Trophy, ChevronRight, Search, Bell, Activity, X, Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ActivitySelectionModal = ({ isOpen, onClose, onSelect }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && user?.stravaId) {
            fetchActivities();
        }
    }, [isOpen, user]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await postApi.getStravaActivities(null, page);
            setActivities(response.data);
        } catch (error) {
            console.error("Failed to fetch Strava activities", error);
            toast.error("Không thể tải hoạt động Strava");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#242526] w-full max-w-md rounded-xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#242526] z-10 rounded-t-xl">
                    <h3 className="font-bold text-lg text-white">Chọn hoạt động</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {!user?.stravaId ? (
                        <div className="text-center py-8">
                            <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-300 mb-4">Bạn chưa kết nối Strava</p>
                            <Link to="/profile" className="inline-block bg-[#FC4C02] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E34402] transition-colors">
                                Kết nối ngay
                            </Link>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="animate-spin text-cyan-500" size={32} />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            Không tìm thấy hoạt động nào gần đây
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div
                                key={activity.id}
                                onClick={() => onSelect({
                                    id: activity.id,
                                    name: activity.name,
                                    distance: activity.distance,
                                    movingTime: activity.moving_time,
                                    type: activity.type
                                })}
                                className="bg-[#3A3B3C] p-3 rounded-lg cursor-pointer hover:bg-[#4E4F50] transition-colors border border-transparent hover:border-cyan-500/50 group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{activity.name}</h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-full">
                                        {format(new Date(activity.start_date_local), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-300">
                                    <div className="flex items-center gap-1">
                                        <Activity size={12} className="text-cyan-500" />
                                        <span>{(activity.distance / 1000).toFixed(2)} km</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500">⏱</span>
                                        <span>{Math.floor(activity.moving_time / 60)}m {activity.moving_time % 60}s</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const PostItem = ({ post, onLike, onAddComment }) => {
    const [isLiked, setIsLiked] = useState(post.likedByCurrentUser);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const { user } = useAuth();

    const handleLike = async () => {
        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        try {
            await postApi.toggleLike(post.id);
        } catch (error) {
            // Revert
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            console.error("Failed to toggle like", error);
        }
    };

    const handleToggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const res = await postApi.getComments(post.id);
                setComments(res.data.content);
            } catch (error) {
                console.error("Failed to load comments", error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await postApi.addComment(post.id, newComment);
            setComments([res.data, ...comments]);
            setNewComment('');
            onAddComment && onAddComment(post.id); // Optional: Update parent count if needed
        } catch (error) {
            toast.error("Không thể gửi bình luận");
        }
    };

    return (
        <div className="bg-[#242526] rounded-xl border border-white/5 shadow-lg overflow-hidden mb-6">
            {/* Post Header */}
            <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold cursor-pointer border border-white/10 overflow-hidden">
                        {post.user?.avatarUrl ? (
                            <img src={post.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            post.user?.fullName ? post.user.fullName.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white hover:underline cursor-pointer">
                            {post.user?.fullName || 'Người dùng ẩn danh'}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span>{post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}</span>
                            <span>•</span>
                            <Users size={12} />
                        </div>
                    </div>
                </div>
                <button className="text-gray-400 hover:bg-[#3A3B3C] p-2 rounded-full transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4 text-[15px] text-gray-200 whitespace-pre-wrap leading-relaxed">
                {post.content}
            </div>

            {/* Attached Activity */}
            {post.activity && (
                <div className="mx-4 mb-4 bg-[#3A3B3C]/50 rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h5 className="font-bold text-white text-lg">{post.activity.name}</h5>
                                <div className="text-xs text-gray-400 mt-1">
                                    {post.activity.startTime && format(new Date(post.activity.startTime), "HH:mm, dd/MM/yyyy")}
                                </div>
                            </div>
                            <img src="/strava-logo-small.png" alt="Strava" className="h-6 opacity-80" onError={(e) => e.target.style.display = 'none'} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Khoảng cách</p>
                                <p className="text-xl font-bold text-white mt-1">{(post.activity.distance / 1000).toFixed(2)} <span className="text-sm font-normal text-gray-400">km</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Thời gian</p>
                                <p className="text-xl font-bold text-white mt-1">
                                    {Math.floor(post.activity.movingTime / 60)} <span className="text-sm font-normal text-gray-400">phút</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Tốc độ TB</p>
                                <p className="text-xl font-bold text-white mt-1">
                                    {(1000 / post.activity.averagePace / 60).toFixed(2)} <span className="text-sm font-normal text-gray-400">km/h</span> {/* Pace logic might need adjustment if it's m/s */}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for map or activity image */}
                    {/* <div className="h-48 bg-gray-700/50 flex items-center justify-center">
                        <MapPin className="text-gray-500" size={32} />
                    </div> */}
                </div>
            )}

            {/* Post Stats */}
            <div className="px-4 py-2 flex justify-between items-center text-gray-400 text-sm border-b border-white/10">
                <div className="flex items-center gap-1">
                    {likesCount > 0 && (
                        <>
                            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-full p-1">
                                <Heart size={10} className="text-white fill-white" />
                            </div>
                            <span className="hover:underline cursor-pointer">{likesCount}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-3">
                    <span className="hover:underline cursor-pointer">{comments.length > 0 ? comments.length : post.commentsCount} bình luận</span>
                </div>
            </div>

            {/* Post Actions */}
            <div className="px-2 py-1 flex justify-between border-b border-white/10 mx-2">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors font-medium group ${isLiked ? 'text-red-500' : 'text-gray-400'
                        }`}
                >
                    <Heart className={`transition-colors ${isLiked ? 'fill-red-500' : ''}`} size={20} />
                    <span>Thích</span>
                </button>
                <button
                    onClick={handleToggleComments}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors text-gray-400 font-medium group"
                >
                    <MessageCircle className="group-hover:text-cyan-400 transition-colors" size={20} />
                    <span className="group-hover:text-cyan-400 transition-colors">Bình luận</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors text-gray-400 font-medium group">
                    <Share2 className="group-hover:text-green-400 transition-colors" size={20} />
                    <span className="group-hover:text-green-400 transition-colors">Chia sẻ</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 py-4 bg-[#18191A]/30">
                    {/* Add Comment */}
                    <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-cyan-600">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmitComment} className="flex-1 relative">
                            <input
                                type="text"
                                className="w-full bg-[#3A3B3C] rounded-2xl px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:bg-[#4E4F50] transition-colors pr-10"
                                placeholder="Viết bình luận..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-500 hover:text-cyan-400 disabled:opacity-0 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="text-center py-2">
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden cursor-pointer">
                                        {comment.user?.avatarUrl ? (
                                            <img src={comment.user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-purple-500 to-pink-500">
                                                {comment.user?.fullName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-[#3A3B3C] rounded-2xl px-3 py-2 inline-block max-w-[90%]">
                                            <Link to="#" className="font-semibold text-white text-[13px] hover:underline block">
                                                {comment.user?.fullName || 'Người dùng ẩn danh'}
                                            </Link>
                                            <p className="text-[14px] text-gray-200">{comment.content}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 ml-2 text-[12px] text-gray-400 font-semibold">
                                            <span className="cursor-pointer hover:underline">Thích</span>
                                            <span className="cursor-pointer hover:underline">Phản hồi</span>
                                            <span className="font-normal">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const { user } = useAuth();

    const fetchPosts = async () => {
        try {
            const response = await postApi.getAllPosts();
            setPosts(response.data.content);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('Không thể tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() && !selectedActivity) return;

        if (!user) {
            toast.error('Vui lòng đăng nhập để đăng bài');
            return;
        }

        setSubmitting(true);
        try {
            const newPost = {
                content: newPostContent,
                activityId: selectedActivity?.id
            };
            await postApi.createPost(newPost);
            toast.success('Đăng bài thành công!');
            setNewPostContent('');
            setSelectedActivity(null);
            fetchPosts(); // Reload posts
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('Đăng bài thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#18191A] min-h-screen text-gray-300 pt-24">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* LEFT SIDEBAR (Navigation) */}
                    <div className="hidden lg:block space-y-2 sticky top-24 h-fit">
                        <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3A3B3C] transition-colors">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                                        {user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <span className="font-semibold text-white">{user?.fullName || 'Người dùng'}</span>
                        </Link>
                        <Link to="/challenges" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3A3B3C] transition-colors">
                            <Trophy className="text-yellow-500" size={24} />
                            <span className="font-medium">Giải đấu</span>
                        </Link>
                        <Link to="/friends" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3A3B3C] transition-colors">
                            <Users className="text-cyan-400" size={24} />
                            <span className="font-medium">Bạn bè</span>
                        </Link>
                        <Link to="/events" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3A3B3C] transition-colors">
                            <Calendar className="text-red-500" size={24} />
                            <span className="font-medium">Sự kiện</span>
                        </Link>
                        <div className="border-t border-white/10 my-2"></div>
                        <h3 className="px-3 text-slate-500 font-semibold mb-2">Lối tắt</h3>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3A3B3C] transition-colors cursor-pointer">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                R
                            </div>
                            <span className="font-medium">Nhóm Running Hà Nội</span>
                        </div>
                    </div>

                    {/* MIDDLE FEED (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Story Reel (Placeholder) */}
                        <div className="grid grid-cols-4 gap-2 h-48 mb-6">
                            <div className="bg-[#242526] rounded-xl overflow-hidden relative group cursor-pointer border border-white/5">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="absolute bottom-0 inset-x-0 p-2 pt-8 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="w-8 h-8 rounded-full bg-cyan-600 border-4 border-[#242526] flex items-center justify-center absolute -top-4 left-2 text-white font-bold">
                                        +
                                    </div>
                                    <p className="text-white text-xs font-semibold mt-2">Tạo tin</p>
                                </div>
                                {user?.avatarUrl && <img src={user.avatarUrl} className="w-full h-full object-cover" alt="My Story" />}
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-[#242526] rounded-xl overflow-hidden relative cursor-pointer border border-white/5">
                                    <img src={`https://picsum.photos/200/300?random=${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Story" />
                                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-4 border-cyan-500 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-full h-full object-cover" alt="User" />
                                    </div>
                                    <p className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">Người dùng {i}</p>
                                </div>
                            ))}
                        </div>

                        {/* Create Post Widget */}
                        <div className="bg-[#242526] rounded-xl p-4 border border-white/5 shadow-lg">
                            <div className="flex gap-3 mb-4">
                                <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                                            {user?.fullName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </Link>
                                <form onSubmit={handleSubmit} className="flex-1">
                                    <input
                                        type="text"
                                        className="w-full bg-[#3A3B3C] rounded-full px-4 py-2.5 text-gray-200 placeholder-gray-400 focus:outline-none hover:bg-[#4E4F50] transition-colors cursor-pointer"
                                        placeholder={`${user?.fullName ? user.fullName.split(' ')[0] : 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                    />
                                </form>
                            </div>

                            {/* Selected Activity Preview */}
                            {selectedActivity && (
                                <div className="mb-4 bg-[#3A3B3C]/50 p-3 rounded-lg flex justify-between items-center animate-fade-in relative group">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#FC4C02] p-2 rounded-lg text-white">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{selectedActivity.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {(selectedActivity.distance / 1000).toFixed(2)} km • {format(new Date(), 'dd/MM/yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedActivity(null)}
                                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="border-t border-white/10 pt-3 flex justify-between px-2">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors flex-1 justify-center">
                                    <ImageIcon className="text-green-500" size={20} />
                                    <span className="font-medium text-gray-400 text-sm hidden sm:inline">Ảnh/Video</span>
                                </button>
                                <button
                                    onClick={() => setShowActivityModal(true)}
                                    className={`flex items-center gap-2 px-4 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors flex-1 justify-center ${selectedActivity ? 'bg-[#3A3B3C]' : ''}`}
                                >
                                    <Activity className="text-[#FC4C02]" size={20} />
                                    <span className={`font-medium text-sm hidden sm:inline ${selectedActivity ? 'text-[#FC4C02]' : 'text-gray-400'}`}>Hoạt động</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors flex-1 justify-center">
                                    <Smile className="text-yellow-500" size={20} />
                                    <span className="font-medium text-gray-400 text-sm hidden sm:inline">Cảm xúc</span>
                                </button>
                                {(newPostContent.trim() || selectedActivity) && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 rounded-lg font-bold text-sm ml-2 transition-colors disabled:opacity-50"
                                    >
                                        Đăng
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Feed Posts */}
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-[#242526] rounded-xl p-8 text-center border border-white/5">
                                <Search size={48} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-gray-300">Chưa có bài viết nào</h3>
                                <p className="text-gray-500 mt-2">Hãy là người đầu tiên chia sẻ khoảnh khắc nhé!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostItem key={post.id} post={post} />
                            ))
                        )}
                    </div>

                    {/* RIGHT SIDEBAR (Widgets) */}
                    <div className="hidden lg:block space-y-6 sticky top-24 h-fit">
                        {/* Sponsored / Trending */}
                        <div className="bg-[#242526] rounded-xl p-4 border border-white/5">
                            <h3 className="font-semibold text-gray-400 mb-4 text-sm uppercase tracking-wide">Được tài trợ</h3>
                            <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-[#3A3B3C] p-2 rounded-lg transition-colors -mx-2">
                                <div className="w-24 h-24 bg-slate-700 rounded-lg overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200" className="w-full h-full object-cover" alt="Shoe" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Giày Nike Alphafly</h4>
                                    <p className="text-xs text-gray-400">solemates.store</p>
                                </div>
                            </div>
                        </div>

                        {/* Birthdays */}
                        <div className="border-t border-white/10 pt-4">
                            <h3 className="font-semibold text-gray-400 mb-3 text-sm">Sinh nhật</h3>
                            <div className="flex items-center gap-3 text-white">
                                <img src="https://cdn-icons-png.flaticon.com/512/3159/3159424.png" className="w-8 h-8" alt="Gift" />
                                <p className="text-sm">Hôm nay là sinh nhật của <span className="font-bold">Hùng Dũng</span></p>
                            </div>
                        </div>

                        {/* Contacts */}
                        <div className="border-t border-white/10 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-400 text-sm">Người liên hệ</h3>
                                <div className="flex gap-2 text-gray-400">
                                    <Search size={16} className="cursor-pointer hover:text-white" />
                                    <MoreHorizontal size={16} className="cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <ul className="space-y-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <li key={i} className="flex items-center gap-3 p-2 hover:bg-[#3A3B3C] rounded-lg cursor-pointer transition-colors">
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-full h-full object-cover" alt="Friend" />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#242526]"></div>
                                        </div>
                                        <span className="text-sm font-medium text-white">Người bạn {i}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {/* Activity Selection Modal */}
            <ActivitySelectionModal
                isOpen={showActivityModal}
                onClose={() => setShowActivityModal(false)}
                onSelect={(activity) => {
                    setSelectedActivity(activity);
                    setShowActivityModal(false);
                }}
            />
        </div>
    );
};

export default Forum;
