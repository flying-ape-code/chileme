-- ============================================
-- 通过 SQL 创建管理员账号
-- ============================================

-- 1. 在 Supabase Auth 中创建用户
-- 使用 auth.uid() 和 auth.users 表的操作

-- 插入用户到 auth.users 表
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- instance_id
  gen_random_uuid(), -- 自动生成 UUID
  'authenticated',
  'authenticated',
  'admin@chileme.com',
  crypt('123456', gen_salt('bf')), -- 加密密码
  NOW(),
  '{"username": "admin", "role": "admin"}'::jsonb,
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb
);

-- 注意：上面的方法可能不起作用，因为 Supabase Auth 有额外的验证
-- ============================================
