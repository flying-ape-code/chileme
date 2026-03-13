-- 禁用邮箱确认要求
-- 这个脚本会修改 Supabase Auth 设置，允许用户无需邮箱确认即可登录

-- 方式 1: 禁用所有用户的邮箱确认要求（需要超级管理员权限）
-- 注意：这只能在 Supabase Dashboard 的 Authentication Settings 中手动设置

-- 方式 2: 批量确认所有已注册用户的邮箱
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 方式 3: 创建一个触发器，自动确认新注册用户的邮箱
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 自动确认邮箱
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;

  -- 插入或更新 profile
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证管理员邮箱已确认
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ 已确认'
    ELSE '❌ 未确认'
  END AS email_status
FROM auth.users
WHERE email = 'admin@chileme.com';
