import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ChallengeList from '../components/ChallengeList';

const Home = () => {
    return (
        <>
            <Hero />

            {/* Featured Challenges */}
            <section className="py-24 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Thử Thách <span className="text-gradient">Nổi Bật</span>
                        </h2>
                        <p className="text-gray-400">Tham gia ngay để nhận huy chương độc quyền.</p>
                    </div>
                    <ChallengeList limit={3} />
                    <div className="text-center mt-12">
                        <a href="/challenges" className="inline-block px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium transition-colors">
                            Xem Tất Cả Thử Thách
                        </a>
                    </div>
                </div>
            </section>

            <Features />
        </>
    );
};

export default Home;
