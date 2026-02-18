import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';

const ChallengeList = ({ limit }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await api.get('/challenges?includeExpired=false');
                // Filter and sort if needed, for now just slice if limit is provided
                let data = response.data.content || response.data;

                if (!Array.isArray(data)) {
                    console.error("API response is not an array:", data);
                    setChallenges([]);
                    return;
                }

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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (challenges.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <p>Chưa có thử thách nào diễn ra.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Các Thử Thách Nổi Bật</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Khám phá và tham gia các thử thách chạy bộ hấp dẫn. Vượt qua giới hạn bản thân và nhận những phần quà giá trị.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {challenges.map((challenge, index) => (
                    <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {/* Image */}
                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={challenge.imageUrl}
                                alt={challenge.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md 
                                    ${challenge.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                                        challenge.status === 'UPCOMING' ? 'bg-orange-500 text-white' :
                                            'bg-slate-500 text-white'}`}>
                                    {challenge.status === 'ACTIVE' ? 'Đang diễn ra' :
                                        challenge.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                                {challenge.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                {challenge.description}
                            </p>

                            {/* Meta Info */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-slate-400">
                                    <Calendar size={16} className="mr-2 text-orange-500" />
                                    <span>
                                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-slate-400">
                                    <Users size={16} className="mr-2 text-orange-500" />
                                    <span>{challenge.participantsCount || 0} người tham gia</span>
                                </div>

                            </div>

                            {/* Price & Sale Info */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
                                <div>
                                    <span className="text-xs text-slate-500 font-medium uppercase">Giá thử thách</span>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const hasOptions = challenge.options && challenge.options.length > 0;
                                            if (!hasOptions) return <span className="text-orange-500 font-bold">Miễn phí</span>;

                                            const minPrice = Math.min(...challenge.options.map(o => o.price || 0));
                                            const originalPrice = challenge.options.find(o => o.price === minPrice)?.originalPrice;
                                            const hasSale = challenge.options.some(o => o.originalPrice > o.price);

                                            return (
                                                <>
                                                    <span className="text-orange-500 font-bold text-lg">
                                                        {formatCurrency(minPrice)}
                                                    </span>
                                                    {hasSale && (
                                                        <span className="text-xs text-slate-500 line-through">
                                                            {originalPrice ? formatCurrency(originalPrice) : ''}
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
                                            <div className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded animate-pulse">
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
                                className="inline-flex items-center justify-center w-full px-4 py-3 mt-4 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-orange-500/20"
                            >
                                Chi Tiết <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                    </motion.div>
                ))
                }
            </div >
        </div>
    );
};

export default ChallengeList;
