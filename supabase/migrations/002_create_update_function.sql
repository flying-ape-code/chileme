-- V1.6: 创建自动更新时间戳函数

-- 创建 update_updated_at_column 函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 注释
COMMENT ON FUNCTION public.update_updated_at_column() IS '自动更新 updated_at 字段的触发器函数';
