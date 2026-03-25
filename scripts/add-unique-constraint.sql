-- 吃了么 V3 - 添加唯一约束
-- 目的：同一分类下不能有同名商品

-- 1. 验证没有重复数据（应该返回 0 行）
SELECT name, category, COUNT(*) as count
FROM products
GROUP BY name, category
HAVING COUNT(*) > 1;

-- 2. 添加唯一约束
ALTER TABLE products 
ADD CONSTRAINT unique_category_name 
UNIQUE (category, name);

-- 3. 验证约束已添加
SELECT constraint_name, constraint_type, table_name
FROM information_schema.table_constraints
WHERE table_name = 'products'
AND constraint_name = 'unique_category_name';

-- 4. 测试：尝试插入重复数据（应该失败）
-- INSERT INTO products (name, category, img)
-- VALUES ('测试商品', 'breakfast', 'https://example.com/test.jpg');
