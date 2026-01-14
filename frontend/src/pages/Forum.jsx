import React, { useState, useEffect } from 'react';
import postApi from '../api/postApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
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
        if (!newPostContent.trim()) return;

        if (!user) {
            toast.error('Vui lòng đăng nhập để đăng bài');
            return;
        }

        setSubmitting(true);
        try {
            const newPost = {
                content: newPostContent,
                // imageUrl: '', // Feature for later
                // activityId: null // Feature for later
            };
            await postApi.createPost(newPost);
            toast.success('Đăng bài thành công!');
            setNewPostContent('');
            fetchPosts(); // Reload posts
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('Đăng bài thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Diễn Đàn Cộng Đồng
            </h1>

            {/* Create Post Section */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/10 shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-white">Tạo bài viết mới</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                        rows="3"
                        placeholder="Bạn đang nghĩ gì?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={submitting || !newPostContent.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
                        >
                            {submitting ? 'Đang đăng...' : 'Đăng bài'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400">Đang tải bài viết...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-white/5">
                        <p className="text-slate-400">Chưa có bài viết nào. Hãy là người đầu tiên!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg hover:border-cyan-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {post.username ? post.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{post.username || 'Người dùng ẩn danh'}</h3>
                                        <p className="text-xs text-slate-400">
                                            {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {post.content}
                            </div>

                            {/* Actions (Like/Comment placeholders) */}
                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5 text-slate-400">
                                <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors group">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>{post.likesCount || 0}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors group">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>{post.commentsCount || 0}</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Forum;
