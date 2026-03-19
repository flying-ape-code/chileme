# 🚨 SQL 错误修复指南

## 问题原因

原 SQL 脚本中 RLS 策略使用了错误的 UUID 类型转换：`auth.uid()::text = id::text`

## ✅ 修复步骤

### 1. 执行完整修复脚本（推荐）

**操作步骤：**

1. 在 Supabase 仪表板，点击 **SQL Editor**
2. 点击 **New Query**
3. 复制 `complete-fix.sql` 的完整内容
4. 粘贴到 SQL 编辑器
5. 点击 **Run**

**此脚本会：**
- ✅ 删除旧表
- ✅ 重新创建正确的表结构
- ✅ 配置自动触发器（用户注册时自动创建 profile）
- ✅ 创建正确的 RLS 策略
- ✅ 禁止在 profiles 表中存储密码（使用 Supabase Auth）

---

### 2. 创建管理员账号

由于现在使用 Supabase Auth，管理员账号需要手动创建：

#### 方式 A：通过 Supabase 仪表板创建（推荐）

1. 在 Supabase 仪表板，点击 **Authentication**
2. 点击 **Add User**
3. 填写信息：
   - **Email**: `admin@chileme.com`
   - **Password**: `123456`
   - **Auto Confirm User**: ✅ 勾选
4. 点击 **Create User**

#### 方式 B：通过注册页面创建

1. 启动应用：`npm run dev`
2. 访问 http://localhost:5173/register
3. 注册账号（会自动创建 profile）
4. 手动在数据库中将该用户设置为 admin（见下一步）

---

### 3. 设置用户为管理员

在 SQL Editor 中运行：

```sql
-- 将指定用户设置为管理员
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@chileme.com';
```

或者：

```sql
-- 通过用户名设置
UPDATE profiles
SET role = 'admin'
WHERE username = 'admin';
```

---

### 4. 验证管理员权限

在 SQL Editor 中运行：

```sql
-- 检查管理员是否设置成功
SELECT id, username, email, role, created_at
FROM profiles
WHERE role = 'admin';
```

---

## 🔍 验证数据库

检查表是否正确创建：

```sql
-- 查看 profiles 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 查看 products 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 查看所有 RLS 策略
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'products');
```

---

## 📊 数据架构说明

### 之前（错误）
```
profiles 表：
- id (UUID) - 独立的 UUID
- username, email, password, role
```

### 现在（正确）
```
auth.users 表 (Supabase Auth)：
- id (UUID) - 用户认证信息
- email, password_hash 等

profiles 表：
- id (UUID) - REFERENCES auth.users(id)
- username, email, role
- 密码由 Supabase Auth 管理

自动触发器：
- 用户在 auth.users 注册时
- 自动在 profiles 表创建记录
```

---

## 🎯 前端代码已更新

以下文件已自动更新：

- ✅ `src/lib/auth.ts` - 使用 Supabase Auth API
- ✅ 不再需要在 profiles 表存储密码
- ✅ 注册时自动创建 profile（通过触发器）

---

## ❓ 常见问题

### Q: 执行 complete-fix.sql 后报错 "relation does not exist"
**A:** 这是因为表之前不存在或已被删除，可以忽略。脚本使用了 `DROP TABLE IF EXISTS`，所以是安全的。

### Q: 注册成功但 profiles 表中没有记录
**A:** 检查触发器是否正确创建：
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Q: 管理员登录提示 "用户名或密码错误"
**A:** 确认：
1. 管理员账号已在 Supabase Auth 中创建
2. profiles 表中该用户的 role = 'admin'
3. 密码输入正确

---

## ✅ 检查清单

- [ ] 执行 `complete-fix.sql` 脚本
- [ ] 在 Supabase Auth 中创建管理员账号
- [ ] 在 profiles 表中将该用户设置为 admin
- [ ] 验证 profiles 表中有管理员记录
- [ ] 验证 RLS 策略正确创建
- [ ] 测试管理员登录

---

**完成后告诉我，我会继续开发前端组件！** 🚀
