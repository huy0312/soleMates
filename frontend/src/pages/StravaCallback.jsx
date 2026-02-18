import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StravaCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const processed = React.useRef(false);

    useEffect(() => {
        if (processed.current) return;

        if (error) {
            processed.current = true;
            console.error("Strava Auth Error:", error);
            toast.error("Kết nối Strava thất bại hoặc bị từ chối.");
            navigate('/profile');
            return;
        }

        if (code) {
            processed.current = true;
            const connectStrava = async () => {
                try {
                    await api.post('/strava/connect', { code });
                    toast.success("Kết nối Strava thành công!");
                    navigate('/profile');
                } catch (err) {
                    console.error("Error connecting Strava:", err);
                    toast.error("Có lỗi xảy ra khi kết nối Strava.");
                    navigate('/profile');
                }
            };
            connectStrava();
        } else {
            processed.current = true;
            navigate('/profile');
        }
    }, [code, error, navigate]);


    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-400">Đang kết nối với Strava...</p>
        </div>
    );
};

export default StravaCallback;
