-- Seed data for Hoài Đức Express

insert into restaurants (name, description, address, lat, lng, phone, category, rating, total_reviews, delivery_time, delivery_fee, min_order, is_open, open_time, close_time) values
  ('Phở Hoài Đức', 'Phở bò truyền thống, nước dùng ninh 12 tiếng', '12 Đường Lê Lợi, Hoài Đức, Hà Nội', 21.0456, 105.7234, '0912345678', 'Phở & Bún', 4.8, 234, 25, 15000, 50000, true, '06:00', '22:00'),
  ('Cơm Tấm Sài Gòn', 'Cơm tấm sườn bì chả đặc biệt', '45 Nguyễn Văn Cừ, Hoài Đức', 21.0489, 105.7198, '0987654321', 'Cơm', 4.6, 189, 20, 12000, 40000, true, '07:00', '21:00'),
  ('Bún Bò Huế Cô Lan', 'Bún bò Huế cay nồng, đầy đủ topping', '78 Trần Phú, Xuân Lộc', 21.0512, 105.7267, '0934567890', 'Phở & Bún', 4.7, 312, 30, 18000, 55000, true, '06:30', '20:30'),
  ('Gà Rán Crispy', 'Gà rán giòn rụm, cay vừa', '23 Hoàng Văn Thụ, Hoài Đức', 21.0445, 105.7212, '0923456789', 'Gà & FastFood', 4.5, 156, 18, 10000, 35000, true, '10:00', '22:30'),
  ('Bánh Mì Thanh Hương', 'Bánh mì giòn thơm, pate tự làm', '5 Đường Hùng Vương, Hoài Đức', 21.0478, 105.7245, '0945678901', 'Bánh mì', 4.9, 445, 15, 8000, 25000, true, '06:00', '21:00'),
  ('Trà Sữa Mochi', 'Trà sữa tươi, topping mochi', '67 Lý Thường Kiệt, Xuân Lộc', 21.0534, 105.7289, '0956789012', 'Trà & Đồ uống', 4.7, 278, 22, 12000, 30000, true, '09:00', '23:00');
