import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
