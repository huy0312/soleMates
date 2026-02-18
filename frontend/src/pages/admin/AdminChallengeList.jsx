import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Calendar, Users, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const AdminChallengeList = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchChallenges();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, page]);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: 10,
                search: searchTerm,
                status: statusFilter
            };
            const response = await api.get('/challenges', { params });
            if (response.data && response.data.content) {
                setChallenges(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } else if (Array.isArray(response.data)) {
                // Fallback for old API if backend hasn't reloaded
                setChallenges(response.data);
                setTotalPages(1);
                setTotalElements(response.data.length);
            } else {
                setChallenges([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (error) {
            console.error("Error fetching challenges:", error);
            setChallenges([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0); // Reset to first page on search
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // Reset to first page on filter
    };

    const handleDelete = async (id, title) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-semibold text-sm">Xóa thử thách?</p>
                <p className="text-xs text-gray-500 line-clamp-1">{title}</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/challenges/${id}`);
                                toast.success('Đã xóa thử thách thành công!');
                                fetchChallenges();
                            } catch (error) {
                                console.error('Error deleting challenge:', error);
                                toast.error('Có lỗi xảy ra khi xóa thử thách');
                            }
                        }}
                        className="px-3 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản Lý Thử Thách</h1>
                    <p className="text-gray-400 text-sm mt-1">Danh sách tất cả các thử thách và sự kiện</p>
                </div>
                <Link
                    to="/admin/challenges/create"
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20"
                >
                    <Plus size={18} /> Tạo Mới
                </Link>
            </div>

            {/* Filters */}
            <div className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thử thách..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="UPCOMING">Sắp diễn ra</option>
                    <option value="ACTIVE">Đang diễn ra</option>
                    <option value="ENDED">Đã kết thúc</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thông Tin</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời Gian</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tham Gia</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : challenges.length > 0 ? (
                                challenges.map((challenge) => (
                                    <tr key={challenge.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-16 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={challenge.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white line-clamp-1">{challenge.title}</div>
                                                    <div className="text-xs text-gray-500">ID: #{challenge.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                                                ${challenge.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    challenge.status === 'UPCOMING' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                {challenge.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300 flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-500" />
                                                <span>{formatDate(challenge.startDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Target size={14} className="text-red-400" />
                                                Đến: {formatDate(challenge.endDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Users size={14} className="text-gray-500" />
                                                <span>{challenge.participantsCount || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/challenges/edit/${challenge.id}`)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(challenge.id, challenge.title)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy thử thách nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Hiển thị {challenges.length} / {totalElements} kết quả
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1 text-sm text-white">
                            Trang {page + 1} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChallengeList;
