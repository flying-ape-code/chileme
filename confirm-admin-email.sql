-- ============================================
-- 确认管理员账号
-- ============================================

-- 1. 查询管理员账号信息
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@chileme.com'
LIMIT 1;

-- 2. 直接更新 auth.users 表，设置邮箱为已确认
-- 注意：这需要 service_role key，通常建议通过 Supabase Dashboard 操作

-- 更新邮箱确认时间
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@chileme.com';

-- 验证更新
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@chileme.com'
LIMIT 1;

-- ============================================
-- 完成！
-- ============================================
