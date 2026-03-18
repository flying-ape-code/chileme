-- ============================================
-- 创建用户反馈系统数据表
-- ============================================

-- 1. 创建 feedbacks 表
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'complaint', 'other')),
  content TEXT NOT NULL,
  contact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  admin_reply TEXT,
  replied_at TIMESTAMP,
  replied_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- 2. 创建 feedback_images 表
CREATE TABLE IF NOT EXISTS public.feedback_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedback_images_feedback_id ON feedback_images(feedback_id);

-- 3. 启用 RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_images ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略

-- feedbacks 表策略
-- 用户可以查看自己的反馈
CREATE POLICY "users_view_own"
  ON public.feedbacks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户可以创建自己的反馈
CREATE POLICY "users_create_own"
  ON public.feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的反馈（未回复前）
CREATE POLICY "users_update_own"
  ON public.feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- 管理员查看所有反馈
CREATE POLICY "admins_view_all"
  ON public.feedbacks FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- feedback_images 表策略
-- 查看关联的反馈图片
CREATE POLICY "view_images"
  ON public.feedback_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_images.feedback_id
      AND (f.user_id = auth.uid() OR (auth.jwt()->>'role')::text = 'admin')
    )
  );

-- 上传图片
CREATE POLICY "insert_images"
  ON public.feedback_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_images.feedback_id
      AND f.user_id = auth.uid()
    )
  );

-- 管理员管理图片
CREATE POLICY "admins_manage_images"
  ON public.feedback_images FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- 5. 创建自动更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 验证
-- ============================================
SELECT '✅ Tables created' as status;
SELECT COUNT(*)::text || ' policies created' as status FROM pg_policies WHERE tablename IN ('feedbacks', 'feedback_images');
