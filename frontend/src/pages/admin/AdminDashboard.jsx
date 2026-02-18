import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Award,
    Users,
    Settings,
    Plus,
    TrendingUp,
    DollarSign,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const isChallengeManager = user?.role === 'CHALLENGE_MANAGER';
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 0,
        activeChallenges: 0,
        revenueChart: [],
        userChart: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (location.pathname === '/admin') {
            fetchStats();
        }
    }, [location.pathname]);

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const allNavItems = [
        { path: '/admin', label: 'Tổng Quan', icon: LayoutDashboard, adminOnly: false },
        { path: '/admin/challenges', label: 'Quản Lý Thử Thách', icon: Award, adminOnly: false },
        { path: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users, adminOnly: true },
        { path: '/admin/settings', label: 'Cài Đặt Hệ Thống', icon: Settings, adminOnly: true },
    ];

    const navItems = isChallengeManager
        ? allNavItems.filter(item => !item.adminOnly)
        : allNavItems;

    const isRoot = location.pathname === '/admin';

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label, formatter }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
                    <p className="text-gray-400 text-sm mb-1">{label}</p>
                    <p className="text-white font-bold text-lg">
                        {formatter ? formatter(payload[0].value) : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-violet-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="flex h-screen overflow-hidden relative z-10">
                {/* Sidebar */}
                <aside
                    className={`
                        bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col
                        ${isSidebarOpen ? 'w-72' : 'w-20'}
                        hidden md:flex
                    `}
                >
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <span className={`font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 w-0 overflow-hidden'}`}>
                            Solemates<span className="text-cyan-400">.</span>
                        </span>
                    </div>

                    <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                        <p className={`text-xs font-bold text-gray-500 uppercase px-4 mb-2 transition-opacity ${!isSidebarOpen && 'opacity-0'}`}>Menu</p>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path) && (item.path !== '/admin' || isRoot)
                                        ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 text-white border border-white/5 shadow-lg shadow-violet-500/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <div className={`relative ${isActive(item.path) && (item.path !== '/admin' || isRoot) ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'}`}>
                                    <item.icon size={22} strokeWidth={isActive(item.path) && (item.path !== '/admin' || isRoot) ? 2.5 : 2} />
                                    {isActive(item.path) && (item.path !== '/admin' || isRoot) && (
                                        <div className="absolute inset-0 bg-cyan-400/50 blur-lg" />
                                    )}
                                </div>
                                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'opacity-0 w-0 overflow-hidden'}`}>
                                    {item.label}
                                </span>
                                {isActive(item.path) && (item.path !== '/admin' || isRoot) && isSidebarOpen && (
                                    <ChevronRight size={16} className="ml-auto text-cyan-400 opacity-50" />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {user?.fullName?.charAt(0) || 'A'}
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Topbar */}
                    <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-20">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors md:block hidden"
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {navItems.find(i => isActive(i.path) && (i.path !== '/admin' || isRoot))?.label || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="bg-slate-800/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800 transition-all w-64"
                                />
                            </div>
                            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                            </button>
                            <Link to="/" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Về trang chủ">
                                <LogOut size={20} />
                            </Link>
                        </div>
                    </header>

                    {/* Scrollable Main View */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                        {isRoot ? (
                            <div className="space-y-8 max-w-7xl mx-auto">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Users Card */}
                                    <div className="relative p-6 rounded-3xl bg-slate-800/40 border border-white/5 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                                                    <Users size={24} />
                                                </div>
                                                <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                                    <TrendingUp size={12} className="mr-1" /> +12.5%
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-gray-400 text-sm font-medium">Tổng Người Dùng</h3>
                                                <p className="text-3xl font-bold text-white tracking-tight">{stats.totalUsers.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revenue Card */}
                                    <div className="relative p-6 rounded-3xl bg-slate-800/40 border border-white/5 overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-500" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
                                                    <DollarSign size={24} />
                                                </div>
                                                <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                                    <TrendingUp size={12} className="mr-1" /> +8.2%
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-gray-400 text-sm font-medium">Tổng Doanh Thu</h3>
                                                <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Challenges Card */}
                                    <div className="relative p-6 rounded-3xl bg-slate-800/40 border border-white/5 overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                                                    <Award size={24} />
                                                </div>
                                                <span className="flex items-center text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                                                    Đang diễn ra
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-gray-400 text-sm font-medium">Thử Thách Active</h3>
                                                <p className="text-3xl font-bold text-white tracking-tight">{stats.activeChallenges}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-lg font-bold text-white">Biểu Đồ Doanh Thu</h3>
                                            <select className="bg-slate-900/50 border border-white/10 rounded-lg text-xs text-gray-400 px-3 py-1.5 focus:outline-none">
                                                <option>7 ngày qua</option>
                                                <option>30 ngày qua</option>
                                                <option>Toàn thời gian</option>
                                            </select>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={stats.revenueChart}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#94a3b8"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        stroke="#94a3b8"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(val) => `${val / 1000000}M`}
                                                        dx={-10}
                                                    />
                                                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#8b5cf6"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorRevenue)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-lg font-bold text-white">Tăng Trưởng Người Dùng</h3>
                                            <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Xem chi tiết</button>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={stats.userChart}>
                                                    <defs>
                                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#94a3b8"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        stroke="#94a3b8"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dx={-10}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#06b6d4"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorUsers)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Action Banner */}
                                <div className="rounded-3xl p-8 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-white/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Award size={150} />
                                    </div>
                                    <div className="relative z-10 max-w-xl">
                                        <h3 className="text-2xl font-bold text-white mb-2">Sẵn sàng cho thử thách mới?</h3>
                                        <p className="text-gray-300 mb-6">Tạo và quản lý các giải chạy ảo, thu hút hàng ngàn vận động viên tham gia ngay hôm nay.</p>
                                        <Link
                                            to="/admin/challenges/create"
                                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
                                        >
                                            <Plus size={20} /> Tạo Thử Thách Ngay
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Render nested routes (User list, Challenge list, etc.)
                            <div className="max-w-7xl mx-auto">
                                <Outlet />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
