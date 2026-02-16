import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, MessageCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-slate-900 text-white pt-20 pb-10 border-t border-slate-800 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <img src={logo} alt="Solemates Logo" className="h-10 w-10 object-cover rounded-full" />
                            <span className="font-bold text-xl tracking-wider uppercase">Solemates</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Cộng đồng chạy bộ hàng đầu dành cho những người đam mê thể thao. Kết nối, chia sẻ và chinh phục mọi giới hạn cùng chúng tôi.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 text-slate-400"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Khám Phá</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Về Chúng Tôi', path: '/#about' },
                                { label: 'Giải Đấu', path: '/challenges' },
                                { label: 'Bảng Xếp Hạng', path: '/leaderboard' },
                                { label: 'Tin Tức & Sự Kiện', path: '/news' },
                                { label: 'Cửa Hàng', path: '/shop' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.path} className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-2">
                                        <ChevronRight size={16} className="text-orange-500" /> {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Hỗ Trợ</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Trung Tâm Trợ Giúp', path: '/help' },
                                { label: 'Chính Sách Bảo Mật', path: '/privacy' },
                                { label: 'Điều Khoản Sử Dụng', path: '/terms' },
                                { label: 'Liên Hệ', path: '/contact' },
                                { label: 'Câu Hỏi Thường Gặp', path: '/faq' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.path} className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-2">
                                        <ChevronRight size={16} className="text-orange-500" /> {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Liên Hệ</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-3 text-slate-400">
                                <MapPin className="flex-shrink-0 text-orange-500" />
                                <span>Hà Nội</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <Phone className="flex-shrink-0 text-orange-500" />
                                <span>+84 862031203</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <Mail className="flex-shrink-0 text-orange-500" />
                                <span>solemates@gmail.com</span>
                            </li>
                        </ul>

                        <div className="mt-8">
                            <h5 className="font-bold text-sm mb-3">Đăng ký nhận bản tin</h5>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 px-4 focus:outline-none focus:border-orange-500 text-sm text-white placeholder-slate-500"
                                />
                                <button className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 Solemates. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link>
                        <Link to="/cookies" className="hover:text-orange-500 transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
