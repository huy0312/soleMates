import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-white/5 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Column 1: Brand & Contact */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-white text-black font-bold px-2 py-1 text-xl tracking-tighter">DO IT</div>
                            <div className="text-sm font-light leading-none">today<br />everyday</div>
                        </div>

                        <div>
                            <h3 className="text-gray-500 uppercase text-xs font-bold mb-4 tracking-wider">Liên hệ</h3>
                            <p className="text-sm text-gray-300 font-bold mb-2 uppercase">
                                CÔNG TY CỔ PHẦN THƯƠNG MẠI DỊCH VỤ SOLEMATES
                            </p>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px]">i</span>
                                    MST: 0111017464
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail size={16} />
                                    support@solemates.com
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone size={16} />
                                    02473030868
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Fanpage & Apps */}
                    <div className="space-y-6">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Fanpage</h3>
                        <div className="h-32 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                            <img
                                src="https://images.unsplash.com/photo-1533561052604-c3beb2d73ff2?auto=format&fit=crop&q=80&w=400"
                                alt="Fanpage Cover"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                            />
                            <div className="relative z-10 flex items-center gap-2">
                                <Facebook className="text-white" />
                                <span className="font-bold">Solemates Running</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 bg-black border border-white/20 rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-400 leading-none">Download on the</div>
                                    <div className="text-sm font-bold">App Store</div>
                                </div>
                            </button>
                            <button className="flex-1 bg-black border border-white/20 rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-400 leading-none">GET IT ON</div>
                                    <div className="text-sm font-bold">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Column 3: Policy */}
                    <div className="space-y-6">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Chính sách</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Bảo mật thông tin</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Thanh toán</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Giao hàng</a></li>
                        </ul>

                        <div className="pt-4 space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Compatible with</p>
                                <div className="text-xl font-bold italic tracking-tighter text-orange-500">STRAVA</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-blue-500 flex items-center gap-1">
                                    VN<span className="text-red-500">PAY</span><span className="text-xs text-gray-500 font-normal not-italic ml-1">QR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Guide & Support */}
                    <div className="space-y-6">
                        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Hướng dẫn</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Đăng nhập/Đăng kí</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Kết nối ứng dụng đồng bộ</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Tham gia giải đấu</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Theo dõi tiến độ</a></li>
                        </ul>

                        <button className="w-full border border-white/20 rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors group">
                            <MessageCircle className="text-white group-hover:scale-110 transition-transform" />
                            <span className="font-bold">Hỗ trợ khách hàng</span>
                        </button>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-600">
                    <p>&copy; Copyright 2026 Solemates. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
