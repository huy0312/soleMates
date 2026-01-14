import React from 'react';
import { motion } from 'framer-motion';
import ChallengeList from '../components/ChallengeList';

const Challenges = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-cyan-400 font-semibold tracking-wider uppercase"
                >
                    Sự Kiện & Giải Đấu
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-2 text-4xl md:text-5xl font-bold text-white mb-6"
                >
                    Khám Phá <span className="text-gradient">Thử Thách</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 max-w-2xl mx-auto text-lg"
                >
                    Tham gia các thử thách chạy bộ trực tuyến, chinh phục mục tiêu và nhận huy chương thật.
                </motion.p>
            </div>

            <ChallengeList />
        </div>
    );
};

export default Challenges;
