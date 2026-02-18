import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản Lý Người Dùng</h1>
                    <p className="text-gray-400 text-sm mt-1">Danh sách thành viên hệ thống</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass p-4 rounded-xl flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thông Tin</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Vai Trò</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ngày Tham Gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-cyan-400 overflow-hidden">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.fullName || 'Chưa cập nhật'}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail size={10} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'ADMIN' ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full border border-violet-500/20">
                                                        <Shield size={10} /> ADMIN
                                                    </span>
                                                ) : user.role === 'CHALLENGE_MANAGER' ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                                                        <Shield size={10} /> MANAGER
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full border border-gray-500/20">
                                                        MEMBER
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.status ? (
                                                <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                                                    <CheckCircle size={12} /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                                                    <XCircle size={12} /> Bị khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUserList;
