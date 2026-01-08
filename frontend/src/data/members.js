import avatar from '../assets/avatar.png';
import nguyenHuuHuy from '../assets/team/nguyen_huu_huy.png';
import phamTuanMinh from '../assets/team/pham_tuan_minh.png';
import quocPhuong from '../assets/team/quoc_phuong.png';
import tranTuanAnh from '../assets/team/tran_tuan_anh.jpg';
import tuanPhong from '../assets/team/tuan_phong.jpg';
import hoangDuc from '../assets/team/hoang_duc.jpg';
import maiDung from '../assets/team/mai_dung.jpg';

export const members = [
    {
        id: 'hoang-duc',
        name: 'Hoàng Đức',
        role: 'Đội Trưởng',
        image: hoangDuc,
        bio: 'Đam mê chạy bộ marathon và truyền cảm hứng cho cộng đồng. Chuyên gia về pacing và chiến thuật.',
        stats: { distance: '2,450 km', runs: 142, pace: '4:50 /km' }
    },
    {
        id: 'mai-dung',
        name: 'Mai Dũng',
        role: 'Vận Động Viên Elite',
        image: maiDung,
        bio: 'Vận động viên ưu tú với nhiều huy chương tại các giải đấu lớn. Đặt mục tiêu sub-3 marathon.',
        stats: { distance: '3,100 km', runs: 215, pace: '4:15 /km' }
    },
    {
        id: 'tuan-phong',
        name: 'Tuấn Phong',
        role: 'Pacer',
        image: tuanPhong,
        bio: 'Yêu thích trail running và khám phá các cung đường mới. Luôn sẵn sàng hỗ trợ đồng đội.',
        stats: { distance: '1,800 km', runs: 98, pace: '5:30 /km' }
    },
    {
        id: 'quoc-phuong',
        name: 'Quốc Phương',
        role: 'Thành Viên',
        image: quocPhuong,
        bio: 'Tham gia vì sức khỏe, ở lại vì cộng đồng. Chạy bộ mỗi sáng để bắt đầu ngày mới.',
        stats: { distance: '850 km', runs: 65, pace: '6:15 /km' }
    },
    {
        id: 'tran-tuan-anh',
        name: 'Trần Tuấn Anh',
        role: 'Thành Viên',
        image: tranTuanAnh,
        bio: 'Chinh phục từng km một. Đam mê half-marathon và các sự kiện gây quỹ.',
        stats: { distance: '1,250 km', runs: 88, pace: '5:45 /km' }
    },
    {
        id: 'nguyen-huu-huy',
        name: 'Nguyễn Hữu Huy',
        role: 'Trưởng Nhóm Kỹ Thuật',
        image: nguyenHuuHuy,
        bio: 'Kết hợp đam mê công nghệ và chạy bộ. Xây dựng nền tảng Solemates.',
        stats: { distance: '950 km', runs: 72, pace: '5:50 /km' }
    },
    {
        id: 'pham-tuan-minh',
        name: 'Phạm Tuấn Minh',
        role: 'Thành Viên',
        image: phamTuanMinh,
        bio: 'Người mới bắt đầu đầy nhiệt huyết. Mục tiêu hoàn thành 21km đầu tiên trong năm nay.',
        stats: { distance: '450 km', runs: 45, pace: '6:30 /km' }
    },
];
