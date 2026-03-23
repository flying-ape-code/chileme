# V3.0 数据迁移指南：meals 表 → products 表

**Issue:** #27  
**日期:** 2026-03-23  
**优先级:** P0（紧急）

---

## 背景

- 之前创建了 `meals` 表（V2.1）
- 已有 `products` 表（原有）
- **现在统一使用 `products` 表，删除 `meals` 表**

---

## 迁移步骤

### 1️⃣ 备份数据（可选但推荐）

在 Supabase SQL Editor 中执行：

```sql
-- 导出 meals 表数据为 JSON
SELECT row_to_json(meals) FROM meals;
```

或者使用 Dashboard 的数据编辑器导出 CSV。

---

### 2️⃣ 执行数据迁移

#### 方法 A：使用 Node.js 脚本（推荐）

```bash
cd /Users/robin/.openclaw/workspace-pm/chileme

# 确保环境变量已设置
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_ANON_KEY="your_anon_key"

# 运行迁移脚本
node scripts/migrate-meals-to-products.js
```

#### 方法 B：使用 SQL 脚本

1. 打开 Supabase Dashboard → SQL Editor
2. 复制 `scripts/migrate-meals-to-products.sql` 内容
3. 执行 SQL 脚本
4. 验证结果后，取消注释并执行 `DROP TABLE meals;`

---

### 3️⃣ 验证迁移

```sql
-- 检查 products 表数据量
SELECT COUNT(*) FROM products;

-- 按分类统计
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY category;

-- 检查活跃商品
SELECT category, COUNT(*) as active_count 
FROM products 
WHERE is_active = true
GROUP BY category;
```

---

### 4️⃣ 删除 meals 表

⚠️ **警告：** 确认数据迁移成功后再执行！

```sql
-- 在 Supabase SQL Editor 中执行
DROP TABLE meals;
```

---

## 代码变更总结

### 已更新的文件

| 文件 | 变更内容 |
|------|----------|
| `prisma/schema.prisma` | 扩展 Product 模型字段 |
| `src/lib/productsService.ts` | 新建（替换 mealsService.ts） |
| `src/data.ts` | 从 products 表读取 |
| `src/pages/Admin.tsx` | 使用 products 表 |
| `src/components/MealGrid.tsx` | 使用 productsService |

### 已删除的文件

- `src/lib/mealsService.ts`

---

## 字段映射

| meals 表 | products 表 | 说明 |
|----------|-------------|------|
| `image_url` | `img` | 商品图片 |
| `cps_link` | `cpsLink` | CPS 推广链接 |
| `price_min` | `priceMin` | 最低价格 |
| `price_max` | `priceMax` | 最高价格 |
| `is_active` | `isActive` | 是否上架 |
| `sort_order` | `sortOrder` | 排序权重 |
| `delivery_time` | `deliveryTime` | 配送时间 |
| `created_at` | `createdAt` | 创建时间 |
| `updated_at` | `updatedAt` | 更新时间 |

---

## 新增字段

- `cpsLink` - CPS 推广链接
- `priceMin` - 最低价格
- `priceMax` - 最高价格
- `rating` - 评分（0-5）
- `distance` - 距离
- `deliveryTime` - 配送时间
- `isActive` - 是否上架
- `sortOrder` - 排序权重

---

## 验收标准

- [x] products 表字段完整
- [ ] meals 数据迁移完成（需执行脚本）
- [ ] meals 表已删除（需手动确认）
- [x] 所有代码使用 products 表
- [ ] 后台管理正常（需测试）
- [ ] 转盘正常显示（需测试）

---

## 回滚方案

如需回滚，在 Supabase SQL Editor 中执行：

```sql
-- 1. 重新创建 meals 表
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  promoUrl TEXT,
  cps_link TEXT,
  price_min FLOAT,
  price_max FLOAT,
  rating FLOAT,
  distance TEXT,
  delivery_time TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 从 products 表恢复数据
INSERT INTO meals (id, name, category, image_url, promoUrl, cps_link, price_min, price_max, rating, distance, delivery_time, is_active, sort_order, created_at, updated_at)
SELECT id, name, category, img, promoUrl, cpsLink, priceMin, priceMax, rating, distance, deliveryTime, isActive, sortOrder, createdAt, updatedAt
FROM products;
```

---

## 联系支持

如有问题，请在 GitHub Issue #27 中评论。
