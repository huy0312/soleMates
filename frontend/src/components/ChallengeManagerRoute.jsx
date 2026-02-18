import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Allows both ADMIN and CHALLENGE_MANAGER roles
const ChallengeManagerRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user || (user.role !== 'ADMIN' && user.role !== 'CHALLENGE_MANAGER')) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ChallengeManagerRoute;
