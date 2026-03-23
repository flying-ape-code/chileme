-- V3.0 数据迁移脚本：meals 表 → products 表
-- 在 Supabase SQL Editor 中执行此脚本
-- Issue: #27

-- 1. 将 meals 表数据迁移到 products 表
-- 注意：字段名映射
-- meals.name → products.name
-- meals.image_url → products.img
-- meals.cps_link → products.cpsLink
-- meals.price_min → products.priceMin
-- meals.price_max → products.priceMax
-- meals.is_active → products.isActive
-- meals.sort_order → products.sortOrder

INSERT INTO products (
  id,
  name,
  img,
  promoUrl,
  cpsLink,
  category,
  priceMin,
  priceMax,
  rating,
  distance,
  deliveryTime,
  isActive,
  sortOrder,
  createdAt,
  updatedAt
)
SELECT
  id,
  name,
  image_url AS img,
  promoUrl,
  cps_link AS cpsLink,
  category,
  price_min AS priceMin,
  price_max AS priceMax,
  rating,
  distance,
  delivery_time AS deliveryTime,
  is_active AS isActive,
  sort_order AS sortOrder,
  created_at AS createdAt,
  updated_at AS updatedAt
FROM meals
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  img = EXCLUDED.img,
  promoUrl = EXCLUDED.promoUrl,
  cpsLink = EXCLUDED.cpsLink,
  category = EXCLUDED.category,
  priceMin = EXCLUDED.priceMin,
  priceMax = EXCLUDED.priceMax,
  rating = EXCLUDED.rating,
  distance = EXCLUDED.distance,
  deliveryTime = EXCLUDED.deliveryTime,
  isActive = EXCLUDED.isActive,
  sortOrder = EXCLUDED.sortOrder,
  updatedAt = NOW();

-- 2. 验证数据迁移
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'meals' as table_name, COUNT(*) as count FROM meals;

-- 3. 按分类验证
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;

-- 4. 验证无误后，删除 meals 表
-- ⚠️ 警告：执行前请确认数据已正确迁移！
-- DROP TABLE meals;

-- 5. 删除 meals 表（取消注释以执行）
-- DROP TABLE IF EXISTS meals;
