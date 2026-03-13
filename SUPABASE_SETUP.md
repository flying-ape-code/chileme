# Supabase 设置指南

## 📋 前置准备

1. 访问 [Supabase 官网](https://supabase.com)
2. 创建账号并登录
3. 创建新项目（选择免费计划）

---

## 🚀 步骤 1：创建项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: chileme-app
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择离你最近的区域
3. 点击 "Create new project"
4. 等待项目创建（约 2 分钟）

---

## 🗄️ 步骤 2：设置数据库

### 方式 A：使用 SQL 编辑器（推荐）

1. 在项目仪表板，点击左侧菜单 **SQL Editor**
2. 点击 **New Query**
3. 复制项目根目录的 `supabase-setup.sql` 文件内容
4. 粘贴到 SQL 编辑器
5. 点击 **Run**

### 方式 B：使用 Table Editor

1. 在左侧菜单点击 **Table Editor**
2. 创建 `profiles` 表：
   - id (uuid, primary key)
   - username (text, unique)
   - email (text, unique)
   - password (text)
   - role (text, default 'user')
   - created_at (timestamp)
   - updated_at (timestamp)

3. 创建 `products` 表：
   - id (uuid, primary key)
   - name (text)
   - img (text)
   - promo_url (text)
   - category (text)
   - created_at (timestamp)
   - updated_at (timestamp)

---

## 🔑 步骤 3：获取 API 密钥

1. 在左侧菜单点击 **Settings** -> **API**
2. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxxxxx.supabase.co`
   - **anon public key**: 类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ⚙️ 步骤 4：配置环境变量

1. 打开项目根目录的 `.env.local` 文件
2. 填入刚才复制的值：

```bash
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. 保存文件

---

## 🧪 步骤 5：测试连接

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 检查浏览器控制台，确保没有连接错误

---

## 👤 步骤 6：测试注册和登录

1. 访问 http://localhost:5173/register
2. 注册一个新账号
3. 访问 http://localhost:5173/login
4. 使用新账号登录

**默认管理员账号：**
- 用户名: `admin`
- 邮箱: `admin@chileme.com`
- 密码: `123456`

---

## 📊 步骤 7：验证数据

1. 在 Supabase 仪表板，点击 **Table Editor**
2. 查看 `profiles` 表，应该能看到注册的用户
3. 查看 `products` 表，目前应该是空的（你可以从管理后台添加商品）

---

## 🛠️ 常见问题

### Q: 提示 "Permission denied"
**A:** 检查 RLS 策略是否正确设置，确保 SQL 脚本完全执行

### Q: 注册成功但无法登录
**A:** 检查 `profiles` 表是否有用户记录，检查邮箱和密码是否正确

### Q: 无法添加商品
**A:** 确保登录账号是管理员（role = 'admin'）

### Q: 如何修改数据库结构
**A:** 使用 SQL Editor 运行 ALTER TABLE 或 DROP TABLE 命令

---

## 🔐 安全建议

### 生产环境注意事项：

1. **密码哈希**：当前实现中密码是明文存储的，生产环境应该使用 bcrypt 或 Supabase Auth 的加密功能

2. **RLS 策略**：已启用行级安全，确保只有授权用户可以访问数据

3. **环境变量**：不要将 `.env.local` 提交到 Git（已在 `.gitignore` 中）

4. **API 密钥**：只使用 `anon` key，不要暴露 `service_role` key

---

## 📚 相关链接

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Auth 指南](https://supabase.com/docs/guides/auth)
- [Supabase Database 指南](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ 检查清单

- [ ] 创建 Supabase 项目
- [ ] 运行 SQL 设置脚本
- [ ] 复制 Project URL 和 anon key
- [ ] 配置 .env.local 文件
- [ ] 重启开发服务器
- [ ] 测试注册功能
- [ ] 测试登录功能
- [ ] 测试管理后台
- [ ] 验证数据库数据

---

**设置完成后，告诉继续开发！** 🚀
