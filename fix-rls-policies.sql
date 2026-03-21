-- ============================================
-- 修复 Supabase RLS 权限问题 - Issue #18
-- 允许管理员读写所有反馈
-- 角色存储在 profiles 表中，不是 auth.users
-- ============================================

-- 1. 删除旧的 admin 策略
DROP POLICY IF EXISTS "admins_view_all" ON public.feedbacks;
DROP POLICY IF EXISTS "admins_manage_all_feedbacks" ON public.feedbacks;

-- 2. 创建新的管理员策略 - 允许管理员完全访问所有反馈
-- 注意：角色存储在 profiles 表中
CREATE POLICY "admins_manage_all_feedbacks"
  ON public.feedbacks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. 确保普通用户的策略仍然存在
-- 用户可以查看自己的反馈
DROP POLICY IF EXISTS "users_view_own" ON public.feedbacks;
CREATE POLICY "users_view_own"
  ON public.feedbacks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户可以创建自己的反馈
DROP POLICY IF EXISTS "users_create_own" ON public.feedbacks;
CREATE POLICY "users_create_own"
  ON public.feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的反馈（未回复前）
DROP POLICY IF EXISTS "users_update_own" ON public.feedbacks;
CREATE POLICY "users_update_own"
  ON public.feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- 4. 修复 feedback_images 的管理员策略
DROP POLICY IF EXISTS "admins_manage_images" ON public.feedback_images;
DROP POLICY IF EXISTS "admins_manage_all_images" ON public.feedback_images;
CREATE POLICY "admins_manage_all_images"
  ON public.feedback_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. 验证策略
SELECT '✅ RLS policies updated' as status;
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename IN ('feedbacks', 'feedback_images')
ORDER BY tablename, policyname;
