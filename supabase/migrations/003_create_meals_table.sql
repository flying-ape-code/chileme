-- V1.6: 创建商品数据表

-- 创建 meals 表
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack')),
  image_url TEXT NOT NULL,
  cps_link TEXT,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_meals_category ON meals(category);
CREATE INDEX idx_meals_active ON meals(is_active);
CREATE INDEX idx_meals_created_at ON meals(created_at DESC);

-- 启用 RLS
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可查看，管理员可管理
CREATE POLICY "public_view" ON public.meals FOR SELECT TO public USING (true);
CREATE POLICY "admin_manage" ON public.meals FOR ALL TO authenticated USING ((auth.jwt()->>'role')::text = 'admin');

-- 创建自动更新时间戳触发器
CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 注释
COMMENT ON TABLE public.meals IS '商品数据表 - V1.6';
