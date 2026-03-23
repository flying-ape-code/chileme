-- ============================================
-- 吃了么 - 数据库迁移 V2.2
-- 统一使用 products 表 + 扩展字段
-- 迁移 meals 表数据到 products
-- ============================================

-- 1. 扩展 products 表字段
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS cps_link TEXT,
  ADD COLUMN IF NOT EXISTS price_min FLOAT,
  ADD COLUMN IF NOT EXISTS price_max FLOAT,
  ADD COLUMN IF NOT EXISTS rating FLOAT,
  ADD COLUMN IF NOT EXISTS distance TEXT,
  ADD COLUMN IF NOT EXISTS delivery_time TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. 将 meals 表数据迁移到 products 表
INSERT INTO products (id, name, img, promo_url, cps_link, category, price_min, price_max, rating, distance, delivery_time, is_active, sort_order, created_at, updated_at)
SELECT 
  id,
  name,
  image_url,
  promo_url,
  cps_link,
  category,
  price,
  NULL,
  rating,
  distance,
  delivery_time,
  is_active,
  sort_order,
  created_at,
  updated_at
FROM meals
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  img = EXCLUDED.img,
  promo_url = EXCLUDED.promo_url,
  cps_link = EXCLUDED.cps_link,
  category = EXCLUDED.category,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  rating = EXCLUDED.rating,
  distance = EXCLUDED.distance,
  delivery_time = EXCLUDED.delivery_time,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- 3. 验证数据迁移
SELECT '迁移前 meals 数量：' as info, COUNT(*) as count FROM meals
UNION ALL
SELECT '迁移后 products 数量：', COUNT(*) FROM products;

-- 4. 删除 meals 表（确认数据迁移成功后执行）
-- ⚠️ 请先验证 products 表数据正确后再执行此命令
-- DROP TABLE meals;

-- 5. 更新 products 表索引
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);

-- 6. 更新触发器
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 迁移完成！
-- 
-- 下一步：
-- 1. 验证 products 表数据是否正确
-- 2. 更新代码引用（已完成）
-- 3. 确认无误后删除 meals 表
-- ============================================
