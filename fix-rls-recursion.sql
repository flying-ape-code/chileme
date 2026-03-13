-- ============================================
-- 修复 RLS 策略 - 避免无限递归
-- ============================================

-- 1. 删除所有旧的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
DROP POLICY IF EXISTS "Everyone can view products" ON products;

-- 2. 重新创建正确的 RLS 策略（避免在 profiles 表中查询 profiles）

-- profiles 表策略
-- 使用 auth.uid() 直接比较，不查询 profiles 表
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 对于管理员查看所有用户，我们需要使用 auth.uid() = id AND role = 'admin'
-- 但这样还是会在 profiles 表中查询，所以我们需要改变策略
-- 方案：让所有人都可以查看 profiles，但在应用层过滤
CREATE POLICY "All users can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile only"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- products 表策略
CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (
    -- 直接使用 auth.uid() 查询用户的 role
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (true);

-- ============================================
-- 完成！
-- ============================================

-- 验证策略
SELECT policyname, tablename, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'products');
