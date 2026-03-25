-- 查找重复商品（按 category + name 组合）
SELECT name, category, COUNT(*) as count
FROM products
GROUP BY name, category
HAVING COUNT(*) > 1
ORDER BY count DESC, name;
