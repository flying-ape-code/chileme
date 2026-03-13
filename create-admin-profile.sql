-- ============================================
-- 创建管理员 Profile（绕过 RLS）
-- ============================================

-- 1. 临时禁用 RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. 插入管理员 profile（如果还没有）
-- 注意：这里需要使用正确的 UUID
-- 由于我们无法直接获取 auth.users 的 UUID，
-- 需要先查询一下

-- 方式 A：通过邮箱查找
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 从 auth.users 表获取 admin 的 UUID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@chileme.com'
  LIMIT 1;

  -- 如果找到了用户，创建或更新 profile
  IF v_user_id IS NOT NULL THEN
    INSERT INTO profiles (id, username, email, role)
    VALUES (v_user_id, 'admin', 'admin@chileme.com', 'admin')
    ON CONFLICT (id) DO UPDATE
      SET role = 'admin',
          username = 'admin',
          updated_at = NOW();

    RAISE NOTICE '✅ 管理员 profile 创建/更新成功！UUID: %', v_user_id;
  ELSE
    RAISE EXCEPTION '❌ 未找到 admin 用户，请先在 Supabase Auth 中创建用户';
  END IF;
END $$;

-- 3. 查询验证
SELECT id, username, email, role, created_at
FROM profiles
WHERE role = 'admin';

-- 4. 重新启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 完成！
-- ============================================
