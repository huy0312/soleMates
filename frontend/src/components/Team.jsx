import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { members } from '../data/members';

const Team = () => {
    return (
        <section id="team" className="py-24 relative bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-cyan-400 font-semibold tracking-wider uppercase"
                    >
                        Đội Ngũ
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-2 text-4xl md:text-5xl font-bold text-white"
                    >
                        Thành Viên <span className="text-gradient">Câu Lạc Bộ</span>
                    </motion.h2>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                        Những người đồng hành cùng nhau trên mọi cung đường.
                    </p>
                </div>

                <div className="space-y-24">
                    {members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                        >
                            {/* Image Section */}
                            <div className="w-full lg:w-1/2">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                    <div className="relative aspect-[3/4] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition duration-500"></div>
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="w-full lg:w-1/2">
                                <div className="space-y-6">
                                    <div>
                                        <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold tracking-wider uppercase mb-3">
                                            {member.role}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                            {member.name}
                                        </h3>
                                        <div className="h-1 w-20 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full"></div>
                                    </div>

                                    <p className="text-gray-300 text-lg leading-relaxed">
                                        {member.bio}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white mb-1">{member.stats.distance}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Tổng Quãng Đường</div>
                                        </div>
                                        <div className="text-center border-l border-white/10">
                                            <div className="text-2xl font-bold text-white mb-1">{member.stats.runs}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Lượt Chạy</div>
                                        </div>
                                        <div className="text-center border-l border-white/10">
                                            <div className="text-2xl font-bold text-white mb-1">{member.stats.pace}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Pace TB</div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Link
                                            to={`/member/${member.id}`}
                                            className="inline-flex items-center text-white font-medium hover:text-cyan-400 transition-colors group"
                                        >
                                            Tìm hiểu thêm
                                            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
