import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ChallengeList = ({ limit }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await api.get('/challenges?includeExpired=false');
                // Filter and sort if needed, for now just slice if limit is provided
                let data = response.data;
                // Optional: Sort by start date or status priority
                if (limit) {
                    data = data.slice(0, limit);
                }
                setChallenges(data);
            } catch (error) {
                console.error("Error fetching challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [limit]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (challenges.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>Chưa có thử thách nào diễn ra.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
                <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                    {/* Image */}
                    <div className="aspect-video relative overflow-hidden">
                        <img
                            src={challenge.imageUrl}
                            alt={challenge.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md 
                                ${challenge.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    challenge.status === 'UPCOMING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                {challenge.status === 'ACTIVE' ? 'Đang diễn ra' :
                                    challenge.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                            {challenge.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                            {challenge.description}
                        </p>

                        {/* Meta Info */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-gray-400">
                                <Calendar size={16} className="mr-2 text-cyan-500" />
                                <span>
                                    {new Date(challenge.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(challenge.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                                <Users size={16} className="mr-2 text-violet-500" />
                                <span>{challenge.participantsCount || 0} người tham gia</span>
                            </div>

                        </div>

                        {/* Price & Sale Info */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div>
                                <span className="text-xs text-gray-500 font-medium uppercase">Giá thử thách</span>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const hasOptions = challenge.options && challenge.options.length > 0;
                                        if (!hasOptions) return <span className="text-cyan-400 font-bold">Miễn phí</span>;

                                        const minPrice = Math.min(...challenge.options.map(o => o.price || 0));
                                        const originalPrice = challenge.options.find(o => o.price === minPrice)?.originalPrice;
                                        const hasSale = challenge.options.some(o => o.originalPrice > o.price);

                                        return (
                                            <>
                                                <span className="text-cyan-400 font-bold text-lg">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice)}
                                                </span>
                                                {hasSale && (
                                                    <span className="text-xs text-gray-500 line-through">
                                                        {originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice) : ''}
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {(() => {
                                const hasSale = challenge.options && challenge.options.some(o => o.originalPrice > o.price);
                                if (hasSale) {
                                    return (
                                        <div className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded border border-red-500/30 animate-pulse">
                                            SALE
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Action */}
                        <Link
                            to={`/challenges/${challenge.id}`}
                            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-cyan-600 group-hover:border-transparent"
                        >
                            Chi Tiết <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                </motion.div>
            ))
            }
        </div >
    );
};

export default ChallengeList;
