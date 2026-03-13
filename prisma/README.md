# Prisma Schema for 吃了么 Admin Panel

## 数据库表结构

### 1. profiles (用户表)
- `id`: UUID, 主键
- `username`: 用户名，唯一
- `email`: 邮箱，唯一
- `password`: 密码
- `role`: 角色 (user/admin)
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 2. products (商品表)
- `id`: UUID, 主键
- `name`: 商品名称
- `img`: 商品图片 URL
- `promo_url`: 促销链接
- `category`: 分类 (breakfast/lunch/afternoon-tea/dinner/night-snack)
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 3. spin_records (抽奖记录表)
- `id`: UUID, 主键
- `user_id`: 用户 ID (外键)
- `result`: 抽奖结果
- `points`: 获得积分
- `created_at`: 创建时间

### 4. history (历史操作记录表)
- `id`: UUID, 主键
- `user_id`: 用户 ID (外键)
- `action`: 操作类型
- `details`: 操作详情
- `created_at`: 创建时间

## 使用方法

### 生成 Prisma Client
```bash
npx prisma generate
```

### 创建迁移
```bash
npx prisma migrate dev --name init
```

### 应用迁移到生产环境
```bash
npx prisma migrate deploy
```

### 查看数据库
```bash
npx prisma studio
```

## 环境变量

需要在 `.env` 文件中设置:
```
DATABASE_URL="postgresql://user:password@localhost:5432/chileme?schema=public"
```

## 迁移脚本

手动迁移脚本位于: `prisma/migration.sql`

可以直接在 Supabase SQL Editor 中运行此脚本。
