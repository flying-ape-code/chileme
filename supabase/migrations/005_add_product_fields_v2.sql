-- V2.0: 添加商品卡片新字段
-- 创建时间：2026-03-23
-- 描述：添加价格、评分、距离、配送时间字段

-- 添加新字段
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS distance VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(20) DEFAULT NULL;

-- 添加注释
COMMENT ON COLUMN products.price IS '商品价格（单位：元）';
COMMENT ON COLUMN products.rating IS '商品评分（0-5 分）';
COMMENT ON COLUMN products.distance IS '配送距离（如：1.2km）';
COMMENT ON COLUMN products.delivery_time IS '配送时间（如：30 分钟）';

-- 更新现有商品数据（示例数据）
-- 早餐类商品
UPDATE products 
SET 
  price = FLOOR(RANDOM() * 20 + 10)::INTEGER,
  rating = ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1),
  distance = CONCAT(ROUND((RANDOM() * 3 + 0.5)::NUMERIC, 1), 'km'),
  delivery_time = CONCAT(FLOOR(RANDOM() * 20 + 25)::INTEGER, '分钟')
WHERE category = 'breakfast';

-- 午餐类商品
UPDATE products 
SET 
  price = FLOOR(RANDOM() * 30 + 15)::INTEGER,
  rating = ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1),
  distance = CONCAT(ROUND((RANDOM() * 3 + 0.5)::NUMERIC, 1), 'km'),
  delivery_time = CONCAT(FLOOR(RANDOM() * 20 + 25)::INTEGER, '分钟')
WHERE category = 'lunch';

-- 下午茶类商品
UPDATE products 
SET 
  price = FLOOR(RANDOM() * 25 + 12)::INTEGER,
  rating = ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1),
  distance = CONCAT(ROUND((RANDOM() * 3 + 0.5)::NUMERIC, 1), 'km'),
  delivery_time = CONCAT(FLOOR(RANDOM() * 20 + 25)::INTEGER, '分钟')
WHERE category = 'afternoon-tea';

-- 晚餐类商品
UPDATE products 
SET 
  price = FLOOR(RANDOM() * 40 + 20)::INTEGER,
  rating = ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1),
  distance = CONCAT(ROUND((RANDOM() * 3 + 0.5)::NUMERIC, 1), 'km'),
  delivery_time = CONCAT(FLOOR(RANDOM() * 20 + 25)::INTEGER, '分钟')
WHERE category = 'dinner';

-- 夜宵类商品
UPDATE products 
SET 
  price = FLOOR(RANDOM() * 35 + 15)::INTEGER,
  rating = ROUND((RANDOM() * 1.5 + 3.5)::NUMERIC, 1),
  distance = CONCAT(ROUND((RANDOM() * 3 + 0.5)::NUMERIC, 1), 'km'),
  delivery_time = CONCAT(FLOOR(RANDOM() * 20 + 25)::INTEGER, '分钟')
WHERE category = 'night-snack';
