-- 添加 is_active 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 添加 sort_order 字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 更新所有现有商品
UPDATE products SET is_active = true, sort_order = 0;

-- 验证
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
