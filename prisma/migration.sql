-- ============================================
-- 吃了么 - 管理员面板数据库迁移脚本
-- Phase 1: 数据库基础
-- 修复版本 v2：适配 Supabase Auth (无 password 字段)
-- ============================================

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建用户表（profiles）- 适配 Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 创建商品表（products）
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  img TEXT NOT NULL,
  promo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 创建抽奖记录表（spin_records）
CREATE TABLE IF NOT EXISTS spin_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 创建历史操作记录表（history）
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_spin_records_user_id ON spin_records(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_records_created_at ON spin_records(created_at);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);

-- 7. 删除已存在的触发器（避免重复创建错误）
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- 8. 创建或替换触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 创建触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 创建自动创建 profile 的触发器（当用户注册时自动创建 profile）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ language plpgsql security definer;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. 启用行级安全（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- 12. 删除已存在的策略（避免重复创建错误）
-- profiles 表策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- products 表策略
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
DROP POLICY IF EXISTS "Everyone can view products" ON products;

-- spin_records 表策略
DROP POLICY IF EXISTS "Users can view own spin records" ON spin_records;
DROP POLICY IF EXISTS "Admins can view all spin records" ON spin_records;
DROP POLICY IF EXISTS "Admins can manage all spin records" ON spin_records;

-- history 表策略
DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Admins can view all history" ON history;
DROP POLICY IF EXISTS "Admins can manage all history" ON history;

-- 13. 创建 RLS 策略

-- profiles 表策略
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- products 表策略
CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (true);

-- spin_records 表策略
CREATE POLICY "Users can view own spin records"
  ON spin_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all spin records"
  ON spin_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all spin records"
  ON spin_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- history 表策略
CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all history"
  ON history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all history"
  ON history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 迁移完成！
-- ============================================

-- ⚠️ 注意：管理员账号需要在 Supabase Auth 中手动创建
-- 1. 前往 Supabase Dashboard → Authentication → Users
-- 2. 点击 "Add User" → 创建 admin@chileme.com
-- 3. 然后在 SQL Editor 中运行以下命令将其设为管理员：
--
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@chileme.com';
-- ============================================
