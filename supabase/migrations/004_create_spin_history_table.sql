-- V2.0: 创建用户选择历史记录表

-- 创建 spin_history 表
CREATE TABLE IF NOT EXISTS public.spin_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  category_emoji TEXT NOT NULL,
  winner TEXT NOT NULL,
  winner_emoji TEXT NOT NULL,
  items TEXT[] NOT NULL,
  spin_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_spin_history_user_id ON spin_history(user_id);
CREATE INDEX idx_spin_history_created_at ON spin_history(created_at DESC);
CREATE INDEX idx_spin_history_category ON spin_history(category);
CREATE INDEX idx_spin_history_winner ON spin_history(winner);

-- 启用 RLS
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的历史记录
CREATE POLICY "users_view_own" ON public.spin_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的历史记录
CREATE POLICY "users_insert_own" ON public.spin_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的历史记录
CREATE POLICY "users_delete_own" ON public.spin_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 创建策略：管理员可以查看所有记录
CREATE POLICY "admin_view_all" ON public.spin_history
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- 创建策略：管理员可以删除所有记录
CREATE POLICY "admin_delete_all" ON public.spin_history
  FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- 注释
COMMENT ON TABLE public.spin_history IS '用户选择历史记录表 - V2.0';
COMMENT ON COLUMN public.spin_history.user_id IS '用户 ID';
COMMENT ON COLUMN public.spin_history.category IS '餐类（早餐/午餐/下午茶/晚餐/夜宵）';
COMMENT ON COLUMN public.spin_history.winner IS '选中的食物';
COMMENT ON COLUMN public.spin_history.items IS '候选食物列表';
COMMENT ON COLUMN public.spin_history.spin_count IS '抽取次数';
