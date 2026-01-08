import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-slate-950 pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <img src={logo} alt="Solemates" className="h-8 w-8 object-cover rounded-full" />
                            <span className="font-bold text-xl text-white tracking-wider">SOLEMATES</span>
                        </div>
                        <p className="text-gray-400 max-w-sm">
                            Trao quyền cho người chạy bộ ở mọi trình độ để đạt được mục tiêu của họ thông qua cộng đồng, công nghệ và đam mê.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Khám Phá</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Trang Chủ</a></li>
                            <li><a href="#about" className="text-gray-400 hover:text-cyan-400 transition-colors">Về Chúng Tôi</a></li>
                            <li><a href="#team" className="text-gray-400 hover:text-cyan-400 transition-colors">Đội Ngũ</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Tuyển Dụng</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Kết Nối</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-cyan-500 hover:text-white transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-violet-500 hover:text-white transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-cyan-500 hover:text-white transition-all">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Solemates Running Club. Đã đăng ký bản quyền.
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-4 md:mt-0">
                        Được làm với <Heart size={14} className="text-red-500 fill-red-500" /> bởi Solemates Team
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
