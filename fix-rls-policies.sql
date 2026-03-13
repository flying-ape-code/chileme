-- ============================================
-- 修复 RLS 策略的 UUID 类型错误
-- ============================================

-- 1. 删除所有旧的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can register" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
DROP POLICY IF EXISTS "Everyone can view products" ON products;

-- 2. 重新创建正确的 RLS 策略

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

-- 管理员可以管理所有商品
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
