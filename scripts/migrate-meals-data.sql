-- V2.1 数据迁移脚本：meals-data.json → meals 表
-- 在 Supabase SQL Editor 中执行此脚本
-- Issue: #14

-- 迁移早餐数据
INSERT INTO meals (name, category, image_url, cps_link, is_active, sort_order, rating) VALUES
('煎饼果子', 'breakfast', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', 'https://i.meituan.com/1', true, 0, 4.5),
('小笼包', 'breakfast', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', 'https://i.meituan.com/2', true, 1, 4.5),
('豆浆油条', 'breakfast', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', 'https://i.meituan.com/3', true, 2, 4.5)
ON CONFLICT DO NOTHING;

-- 迁移午餐数据
INSERT INTO meals (name, category, image_url, cps_link, is_active, sort_order, rating) VALUES
('黄焖鸡米饭', 'lunch', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', 'https://i.meituan.com/4', true, 0, 4.5),
('兰州牛肉面', 'lunch', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', 'https://i.meituan.com/5', true, 1, 4.5),
('麻辣烫', 'lunch', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', 'https://i.meituan.com/6', true, 2, 4.5)
ON CONFLICT DO NOTHING;

-- 迁移下午茶数据
INSERT INTO meals (name, category, image_url, cps_link, is_active, sort_order, rating) VALUES
('奶茶', 'afternoon-tea', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', 'https://i.meituan.com/7', true, 0, 4.5),
('蛋糕', 'afternoon-tea', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', 'https://i.meituan.com/8', true, 1, 4.5),
('咖啡', 'afternoon-tea', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', 'https://i.meituan.com/9', true, 2, 4.5)
ON CONFLICT DO NOTHING;

-- 迁移晚餐数据
INSERT INTO meals (name, category, image_url, cps_link, is_active, sort_order, rating) VALUES
('烤鱼', 'dinner', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', 'https://i.meituan.com/10', true, 0, 4.5),
('火锅', 'dinner', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', 'https://i.meituan.com/11', true, 1, 4.5),
('烧烤', 'dinner', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', 'https://i.meituan.com/12', true, 2, 4.5)
ON CONFLICT DO NOTHING;

-- 迁移夜宵数据
INSERT INTO meals (name, category, image_url, cps_link, is_active, sort_order, rating) VALUES
('小龙虾', 'night-snack', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400', 'https://i.meituan.com/13', true, 0, 4.5),
('炒粉', 'night-snack', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400', 'https://i.meituan.com/14', true, 1, 4.5),
('烤串', 'night-snack', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400', 'https://i.meituan.com/15', true, 2, 4.5)
ON CONFLICT DO NOTHING;

-- 验证迁移结果
SELECT category, COUNT(*) as count FROM meals GROUP BY category ORDER BY category;
SELECT COUNT(*) as total FROM meals;
