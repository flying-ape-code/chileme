-- ============================================
-- 创建管理员账号的 RPC 函数
-- ============================================

-- 1. 创建 RPC 函数
CREATE OR REPLACE FUNCTION create_admin_user(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- 使用 auth.uid() 无法直接创建用户
  -- 这个函数主要用于更新已存在用户的权限

  -- 如果需要创建新用户，建议使用：
  -- 1. Supabase 仪表板的 Authentication 页面
  -- 2. 前端注册页面
  -- 3. scripts/create-admin.js 脚本

  -- 更新指定邮箱的用户为管理员
  UPDATE profiles
  SET role = 'admin'
  WHERE email = p_email
  RETURNING * INTO v_result;

  IF v_result IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', '用户已设置为管理员',
      'user', v_result
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', '用户不存在，请先注册'
    );
  END IF;
END;
$$;

-- 2. 使用方法：
-- SELECT create_admin_user('admin', 'admin@chileme.com', '123456');

-- ============================================
-- 注意：这个函数只能更新已存在用户的权限
-- 如果用户不存在，需要先通过其他方式注册
-- ============================================
