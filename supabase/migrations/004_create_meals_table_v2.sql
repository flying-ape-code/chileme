-- V2.1: 统一商品数据源 - meals 表
-- Issue: #14

-- 创建 meals 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack')),
  image_url TEXT,
  cps_link TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  distance VARCHAR(50),
  delivery_time VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
CREATE INDEX IF NOT EXISTS idx_meals_active ON meals(is_active);
CREATE INDEX IF NOT EXISTS idx_meals_sort ON meals(sort_order);

-- 启用 RLS
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "public_view" ON public.meals;
DROP POLICY IF EXISTS "admin_manage" ON public.meals;

-- 创建策略：所有人可查看活跃商品，管理员可管理所有
CREATE POLICY "public_view_active" ON public.meals 
  FOR SELECT 
  TO public 
  USING (is_active = true);

CREATE POLICY "admin_all" ON public.meals 
  FOR ALL 
  TO authenticated 
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- 创建自动更新时间戳触发器
DROP TRIGGER IF EXISTS update_meals_updated_at ON public.meals;
CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 注释
COMMENT ON TABLE public.meals IS '商品数据表 - V2.1 统一数据源';
COMMENT ON COLUMN public.meals.name IS '商品名称';
COMMENT ON COLUMN public.meals.category IS '分类：breakfast/lunch/afternoon-tea/dinner/night-snack';
COMMENT ON COLUMN public.meals.image_url IS '商品图片 URL';
COMMENT ON COLUMN public.meals.cps_link IS 'CPS 推广链接';
COMMENT ON COLUMN public.meals.price_min IS '最低价格';
COMMENT ON COLUMN public.meals.price_max IS '最高价格';
COMMENT ON COLUMN public.meals.rating IS '评分（0-5）';
COMMENT ON COLUMN public.meals.distance IS '距离（如 1.2km）';
COMMENT ON COLUMN public.meals.delivery_time IS '配送时间（如 30 分钟）';
COMMENT ON COLUMN public.meals.is_active IS '是否上架';
COMMENT ON COLUMN public.meals.sort_order IS '排序权重（数字越小越靠前）';
