-- Roles
INSERT INTO role (role_id, role_name) VALUES (1, 'ADMIN') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO role (role_id, role_name) VALUES (2, 'MEMBER') ON CONFLICT (role_id) DO NOTHING;

-- Users
-- Password is "password" for all
INSERT INTO users (user_id, email, password, role_id, status, created_at) VALUES 
(1, 'admin@solemates.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlL.', 1, true, NOW()),
(2, 'user@solemates.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlL.', 2, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Member Profiles
INSERT INTO member_profile (member_id, user_id, full_name, gender, join_date, bio) VALUES
(1, 1, 'Solemates Admin', 'OTHER', '2023-01-01', 'System Administrator'),
(2, 2, 'Nguyen Van A', 'MALE', '2023-01-02', 'Runner đam mê, chinh phục mọi cung đường.')
ON CONFLICT (member_id) DO NOTHING;

-- Challenges
INSERT INTO challenges (id, title, description, image_url, start_date, end_date, sub_title, status, participants_count, distances, completion_time, registration_deadline, activity_types, bib_url, rules) VALUES
(1, 'Hạ Long Heritage Marathon 2024', 'Giải chạy di sản giữa lòng kỳ quan thiên nhiên thế giới. Trải nghiệm cung đường bao biển tuyệt đẹp.', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600', '2024-11-01 05:00:00', '2024-11-01 12:00:00', 'Chạm vào di sản', 'UPCOMING', 1500, '5km, 10km, 21km, 42km', '7 hours', '2024-10-15 23:59:59', 'Run', NULL, 'Tuân thủ luật điền kinh quốc tế.'),
(2, 'VPBank VnExpress Marathon Ho Chi Minh City Midnight', 'Chạy đêm Sài Gòn, cảm nhận nhịp sống không ngủ của thành phố trẻ.', 'https://images.unsplash.com/photo-1533561052604-c3beb2d73ff2?auto=format&fit=crop&q=80&w=600', '2024-03-03 00:00:00', '2024-03-03 06:00:00', 'Run to the Light', 'ACTIVE', 8000, '5km, 10km, 21km, 42km', '6 hours 30 mins', '2024-02-15 23:59:59', 'Run', NULL, 'Đèn headlamp là bắt buộc.'),
(3, 'Ecopark Marathon 2024', 'Cung đường chạy xanh mát giữa thiên nhiên Ecopark. Giải chạy dành cho cả gia đình.', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600', '2024-04-21 05:30:00', '2024-04-21 11:00:00', 'Chạy giữa miền xanh', 'UPCOMING', 4500, '5km, 10km, 21km', '4 hours', '2024-04-01 23:59:59', 'Run,Walk', NULL, 'Không xả rác trên đường chạy.'),
(4, 'Dalat Ultra Trail 2024', 'Thử thách địa hình khắc nghiệt nhưng đầy mê hoặc tại cao nguyên Đà Lạt.', 'https://images.unsplash.com/photo-1516713783707-ac372b647413?auto=format&fit=crop&q=80&w=600', '2024-03-15 04:00:00', '2024-03-17 18:00:00', 'The Legacy', 'ACTIVE', 3000, '10km, 25km, 55km, 75km, 100km', '24 hours', '2024-02-28 23:59:59', 'Run', NULL, 'Bắt buộc mang theo vest nước.'),
(5, 'Techcombank Ironman 70.3 Vietnam', 'Cuộc đua 3 môn phối hợp lớn nhất Việt Nam tại Đà Nẵng.', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600', '2024-05-12 05:00:00', '2024-05-12 17:00:00', 'Be Greater Together', 'UPCOMING', 2000, '1.9km Swim, 90km Bike, 21km Run', '8 hours 30 mins', '2024-04-15 23:59:59', 'Swim,Ride,Run', NULL, 'Luật Ironman 70.3 áp dụng.'),
(6, 'Hanoi Marathon - Heritage Race 2023', 'Giải chạy xuyên qua phố cổ Hà Nội mùa thu.', 'https://images.unsplash.com/photo-1552674605-5d28c4a11843?auto=format&fit=crop&q=80&w=600', '2023-10-15 05:00:00', '2023-10-15 12:00:00', 'Dấu ấn di sản', 'ENDED', 10000, '5km, 10km, 21km, 42km', '7 hours', '2023-09-30 23:59:59', 'Run', NULL, ' '),
(7, 'Moc Chau Trail Marathon', 'Chạy giữa mùa hoa mận trắng xóa Mộc Châu.', 'https://images.unsplash.com/photo-1452626038306-3a2a4a58026c?auto=format&fit=crop&q=80&w=600', '2024-01-20 06:00:00', '2024-01-20 18:00:00', 'Run with the flowers', 'ENDED', 2500, '10km, 21km, 42km, 70km', '18 hours', '2024-01-05 23:59:59', 'Run', NULL, 'Trang bị đồ giữ ấm.'),
(8, 'Danang International Marathon', 'Một trong những cung đường marathon đẹp nhất Châu Á.', 'https://images.unsplash.com/photo-1476480862126-2098kd.jpg', '2024-08-11 04:00:00', '2024-08-11 10:00:00', 'Run Danang', 'UPCOMING', 6000, '5km, 10km, 21km, 42km', '7 hours', '2024-07-20 23:59:59', 'Run', NULL, ' '),
(9, 'Lakeside Run Challenge', 'Thử thách chạy bộ ảo quanh hồ Hoàn Kiếm trong 30 ngày.', 'https://images.unsplash.com/photo-1596727147705-01a298de8ade?auto=format&fit=crop&q=80&w=600', '2024-01-01 00:00:00', '2024-01-31 23:59:59', 'New Year New Me', 'ACTIVE', 500, '50km, 100km', '31 days', '2023-12-31 23:59:59', 'Run,Walk', NULL, 'Chấp nhận kết quả Strava.'),
(10, 'Cycling for Environment', 'Đạp xe vì môi trường xanh sạch đẹp.', 'https://images.unsplash.com/photo-1541625602330-2277dbd3a36da?auto=format&fit=crop&q=80&w=600', '2024-06-05 06:00:00', '2024-06-05 18:00:00', 'Green Wheels', 'UPCOMING', 300, '20km, 50km', '12 hours', '2024-05-30 23:59:59', 'Ride', NULL, 'Khuyến khích xe đạp tái chế.')
ON CONFLICT (id) DO NOTHING;

-- Challenge Options
INSERT INTO challenge_options (id, name, description, price, original_price, challenge_id) VALUES
(1, 'Super Early Bird', 'Đăng ký sớm nhất', 450000, 800000, 1),
(2, 'Early Bird', 'Đăng ký sớm', 600000, 800000, 1),
(3, 'Regular', 'Vé tiêu chuẩn', 800000, NULL, 1),
(4, 'VIP', 'Vé VIP + Quyền lợi đặc biệt', 1200000, 1500000, 1),
(5, 'Standard Entry', 'Bao gồm BIB + Medal', 350000, 500000, 2),
(6, 'Premium Entry', 'BIB + Medal + Finisher Shirt', 650000, 900000, 2),
(7, 'Family Run', 'Combo 2 người lớn + 2 trẻ em', 800000, 1200000, 3),
(8, 'Solo Run', 'Vé cá nhân', 250000, NULL, 3),
(9, 'Ultra 100km', 'Thử thách cực đại', 2500000, 3000000, 4),
(10, 'Trail 25km', 'Trải nghiệm địa hình', 900000, 1200000, 4),
(11, 'Individual', 'Cá nhân', 5000000, 7000000, 5),
(12, 'Relay Team', 'Đội tiếp sức', 8000000, 10000000, 5)
ON CONFLICT (id) DO NOTHING;

-- Reset Sequences
-- Important for PostgreSQL to ensure auto-increment PKs don't clash with inserted IDs
SELECT setval('role_role_id_seq', (SELECT MAX(role_id) FROM role));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('member_profile_member_id_seq', (SELECT MAX(member_id) FROM member_profile));
SELECT setval('challenges_id_seq', (SELECT MAX(id) FROM challenges));
SELECT setval('challenge_options_id_seq', (SELECT MAX(id) FROM challenge_options));
