# 数据库迁移 V2.2 - 统一使用 products 表

## 概述

本次迁移将 `meals` 表数据统一迁移到 `products` 表，并扩展必要字段。

## 变更内容

### 1. products 表新增字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `cps_link` | TEXT | CPS 推广链接 |
| `price_min` | FLOAT | 最低价格 |
| `price_max` | FLOAT | 最高价格 |
| `rating` | FLOAT | 评分（0-5） |
| `distance` | TEXT | 距离 |
| `delivery_time` | TEXT | 配送时间 |
| `is_active` | BOOLEAN | 是否激活 |
| `sort_order` | INTEGER | 排序顺序 |

### 2. 代码变更

- ✅ 创建 `src/lib/productsService.ts` 替换 `mealsService.ts`
- ✅ 更新 `src/data.ts` 使用 products 表
- ✅ 更新 `src/pages/Admin.tsx` 使用 products 表
- ✅ 更新 `src/components/MealGrid.tsx` 使用 products 表
- ✅ 更新 `src/App.tsx` 使用 `productTypes`
- ✅ 删除 `src/lib/mealsService.ts`

## 迁移步骤

### 步骤 1：执行数据库迁移

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `prisma/migration_v2.2_unify_products.sql` 脚本

```sql
-- 复制 prisma/migration_v2.2_unify_products.sql 内容并执行
```

### 步骤 2：验证数据迁移

```sql
-- 验证迁移前后的数据量
SELECT 'meals 表数量：' as info, COUNT(*) as count FROM meals
UNION ALL
SELECT 'products 表数量：', COUNT(*) FROM products;

-- 验证 products 表数据结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

### 步骤 3：删除 meals 表（确认无误后）

```sql
-- ⚠️ 仅在确认 products 表数据正确后执行
DROP TABLE meals;
```

### 步骤 4：部署代码

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install

# 构建验证
npm run build

# 部署（根据实际部署流程）
```

## 验证清单

- [ ] products 表包含所有新增字段
- [ ] meals 表数据已迁移到 products 表
- [ ] 后台管理页面正常显示商品
- [ ] 转盘正常显示商品
- [ ] 添加/编辑/删除商品功能正常
- [ ] 构建无错误 (`npm run build`)

## Git 提交

- Commit: `1ce9461`
- Message: `feat: 统一使用 products 表 + 扩展字段 (Issue #27)`

## 回滚方案

如需回滚，执行以下 SQL：

```sql
-- 恢复 meals 表（如果有备份）
-- 删除新增字段
ALTER TABLE products 
  DROP COLUMN IF EXISTS cps_link,
  DROP COLUMN IF EXISTS price_min,
  DROP COLUMN IF EXISTS price_max,
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS distance,
  DROP COLUMN IF EXISTS delivery_time,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS sort_order;
```

## 相关 Issue

- GitHub Issue #27: 统一使用 products 表 + 扩展字段

---

迁移完成时间：2026-03-23
