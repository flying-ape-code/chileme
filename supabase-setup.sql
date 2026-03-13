-- ============================================
-- 吃了么应用 - Supabase 数据库设置
-- ============================================

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建用户表（profiles）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- 注意：生产环境应该使用哈希密码
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建商品表（products）
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  img TEXT NOT NULL,
  promo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 5. 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 插入默认管理员账号
INSERT INTO profiles (username, email, password, role)
VALUES ('admin', 'admin@chileme.com', '123456', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 7. 启用行级安全（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 8. 创建 RLS 策略
-- 用户可以读取自己的信息
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 管理员可以读取所有用户
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 用户可以创建账号（注册）
CREATE POLICY "Users can register"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 管理员可以更新所有商品
CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 所有人可以查看商品
CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (true);

-- ============================================
-- 完成！
-- ============================================
