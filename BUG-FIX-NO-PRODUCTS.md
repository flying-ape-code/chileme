# 🚨 Bug 修复报告：转盘和后台管理看不到商品

**优先级:** P0 紧急  
**状态:** ✅ 已定位，待配置  
**修复时间:** 2026-03-23 17:40  

---

## 🔍 问题诊断

### 数据库检查 ✅
- ✅ **products 表**: 存在，有 **618 条** 商品数据
- ✅ **meals 表**: 已删除（符合 V2.2 迁移计划）
- ✅ **数据分布**:
  - breakfast: 124 个商品
  - lunch: 116 个商品
  - afternoon-tea: 126 个商品
  - dinner: 126 个商品
  - night-snack: 126 个商品

### 代码检查 ✅
- ✅ `src/data.ts`: 已更新使用 products 表
- ✅ `src/pages/Admin.tsx`: 已更新使用 products 表
- ✅ `src/lib/productsService.ts`: 已创建
- ✅ RLS 策略：已配置（prisma/migration.sql）

### 问题定位 ❌
**根本原因：前端无法连接到 Supabase**

1. **`.env` 文件缺少 Supabase 配置**
   - `VITE_SUPABASE_URL`: 已配置 ✅
   - `VITE_SUPABASE_ANON_KEY`: **缺失** ❌

2. **Vercel 环境变量未配置**
   - Vercel Dashboard 中缺少 Supabase 环境变量
   - 导致生产环境无法连接数据库

3. **CPS 链接为空**
   - 数据库中 618 个商品的 `cps_link` 字段都是 `null`
   - 需要运行爬虫生成 CPS 链接

---

## 🛠️ 修复步骤

### 步骤 1: 获取 Supabase Anon Key

1. 访问 Supabase Dashboard: https://isefskqnkeesepcczbyo.supabase.co
2. 进入 **Settings** → **API**
3. 复制 **Project API keys** 下的 **anon public** 密钥
   - 格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 步骤 2: 更新本地 .env 文件

```bash
cd /Users/robin/.openclaw/workspace/projects/chileme-code
```

编辑 `.env` 文件，添加：

```env
# ==================== Supabase 配置 ====================
VITE_SUPABASE_URL=https://isefskqnkeesepcczbyo.supabase.co
VITE_SUPABASE_ANON_KEY=【从 Supabase Dashboard 复制的 anon key】
```

### 步骤 3: 配置 Vercel 环境变量

1. 访问 Vercel Dashboard: https://vercel.com/flyingapecodes-projects/chileme-code
2. 进入 **Settings** → **Environment Variables**
3. 添加以下变量：

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://isefskqnkeesepcczbyo.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 【从 Supabase Dashboard 复制的 anon key】 | Production, Preview, Development |

4. 保存后重新部署

### 步骤 4: 重新部署

```bash
cd /Users/robin/.openclaw/workspace/projects/chileme-code
vercel --prod
```

### 步骤 5: 生成 CPS 链接（可选）

运行爬虫脚本生成 CPS 链接：

```bash
# 使用订单侠 API 生成 CPS 链接
node scripts/cps-generator.js

# 或者运行完整爬虫
node scripts/crawler-products.js
```

---

## 📝 验证清单

部署完成后，验证以下功能：

- [ ] 转盘页面能正常显示商品
- [ ] 后台管理能正常显示商品列表
- [ ] 商品图片能正常加载
- [ ] CPS 链接能正常跳转（如已生成）
- [ ] 管理员能添加/编辑/删除商品

---

## 📊 数据库状态

```
products 表统计:
- 总记录数：618 条
- 分类分布：
  * breakfast: 124 个
  * lunch: 116 个
  * afternoon-tea: 126 个
  * dinner: 126 个
  * night-snack: 126 个
- CPS 链接：0 个（需要运行爬虫生成）
```

---

## 🔧 技术细节

### Supabase 连接配置

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### RLS 策略

```sql
-- products 表 RLS 策略
CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## ⚠️ 注意事项

1. **不要提交 .env 文件到 Git** - 已添加到 .gitignore
2. **Anon Key 是公开的** - 可以安全地在客户端使用
3. **Service Role Key 是机密的** - 只能在服务器端使用
4. **CPS 链接需要 API 密钥** - 需要配置订单侠或美团联盟 API

---

## 📞 需要用户操作

请完成以下步骤：

1. ✅ 从 Supabase Dashboard 获取 anon key
2. ✅ 更新本地 `.env` 文件
3. ✅ 在 Vercel Dashboard 配置环境变量
4. ✅ 重新部署应用
5. ⏳ 运行爬虫生成 CPS 链接（可选）

---

**修复完成后请测试并反馈！**
