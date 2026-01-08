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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {members.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative"
                        >
                            <Link to={`/member/${member.id}`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative glass p-6 rounded-2xl flex flex-col items-center text-center h-full border border-white/5 bg-slate-900/50 cursor-pointer">
                                    <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-cyan-400 transition-colors shadow-lg">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{member.name}</h3>
                                    <span className="text-sm text-gray-400 uppercase tracking-wide">{member.role}</span>
                                    <span className="mt-4 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Xem Chi Tiết &rarr;</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
