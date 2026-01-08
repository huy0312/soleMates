import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero-bg-real.jpg';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="Night Run City"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40"></div>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-cyan-400 text-sm font-semibold mb-6 backdrop-blur-md">
                        #1 Cộng Đồng Chạy Bộ
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        <span className="block text-white">Tìm Nhịp Độ Của Bạn.</span>
                        <span className="text-gradient">Tìm Đồng Đội Của Bạn.</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Solemates không chỉ là một câu lạc bộ. Đó là một phong trào. Tham gia cùng hàng ngàn vận động viên, phá vỡ giới hạn và hỗ trợ lẫn nhau trên mỗi dặm đường.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Bắt Đầu Ngay <ArrowRight size={20} />
                        </button>
                        <button className="glass hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <Play size={20} fill="currentColor" className="text-white" /> Xem Video
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
        </section>
    );
};

export default Hero;
