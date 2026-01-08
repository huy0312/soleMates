import React from 'react';
import { Activity, Trophy, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: <Activity className="w-8 h-8 text-cyan-400" />,
        title: 'Theo Dõi Thời Gian Thực',
        description: 'Giám sát tốc độ, khoảng cách và nhịp tim của bạn trong thời gian thực với độ chính xác GPS cao.'
    },
    {
        icon: <Trophy className="w-8 h-8 text-violet-400" />,
        title: 'Thử Thách Toàn Cầu',
        description: 'Cạnh tranh với các vận động viên trên toàn thế giới. Kiếm huy hiệu, leo bảng xếp hạng và giành giải thưởng.'
    },
    {
        icon: <Calendar className="w-8 h-8 text-fuchsia-400" />,
        title: 'Sự Kiện Cộng Đồng',
        description: 'Khám phá các buổi chạy nhóm địa phương, marathon và các cuộc gặp gỡ xã hội diễn ra gần bạn.'
    },
    {
        icon: <Users className="w-8 h-8 text-emerald-400" />,
        title: 'Trung Tâm Xã Hội',
        description: 'Chia sẻ thành tích, hình ảnh và lộ trình của bạn. Cổ vũ bạn bè và xây dựng mạng lưới của bạn.'
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-slate-900 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Mọi thứ bạn cần hoàn toàn <br />
                        <span className="text-gradient">miễn phí.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default"
                        >
                            <div className="mb-6 p-3 bg-white/5 rounded-xl inline-block w-fit">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
