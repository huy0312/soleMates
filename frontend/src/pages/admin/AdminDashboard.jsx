import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Award, Users, Settings, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const navItems = [
        { path: '/admin', label: 'Tổng Quan', icon: LayoutDashboard },
        { path: '/admin/challenges', label: 'Thử Thách', icon: Award },
        { path: '/admin/users', label: 'Người Dùng', icon: Users },
        { path: '/admin/settings', label: 'Cài Đặt', icon: Settings },
    ];

    // Default dashboard content if at /admin root
    const isRoot = location.pathname === '/admin';

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex gap-8">
            {/* Sidebar */}
            <div className="w-64 glass rounded-2xl h-fit p-4 hidden lg:block">
                <div className="mb-6 px-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Admin Portal
                    </h2>
                </div>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path) && (item.path !== '/admin' || isRoot)
                                    ? 'bg-slate-700 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {isRoot ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-gray-400 text-sm font-medium mb-2">Tổng Người Dùng</h3>
                                <div className="text-3xl font-bold text-white">1,234</div>
                                <div className="text-green-400 text-xs mt-1">+12% so với tháng trước</div>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-gray-400 text-sm font-medium mb-2">Thử Thách Đang Chạy</h3>
                                <div className="text-3xl font-bold text-white">8</div>
                                <div className="text-cyan-400 text-xs mt-1">3 sắp kết thúc</div>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-gray-400 text-sm font-medium mb-2">Lượt Hoàn Thành</h3>
                                <div className="text-3xl font-bold text-white">856</div>
                                <div className="text-green-400 text-xs mt-1">+5% so với tuần trước</div>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-8 text-center">
                            <h3 className="text-xl font-bold text-white mb-4">Quản Lý Thử Thách</h3>
                            <p className="text-gray-400 mb-6">Tạo thử thách mới để thúc đẩy cộng đồng</p>
                            <Link to="/admin/challenges/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20">
                                <Plus size={20} /> Tạo Thử Thách Mới
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
