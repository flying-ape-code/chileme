-- Migration: User Preferences + Product Tags
-- Issue: #48
-- Date: 2026-04-04

-- 1. 用户喜好表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type VARCHAR(50) NOT NULL, -- 'diet', 'taste', 'ingredient', 'avoid'
  preference_value VARCHAR(100) NOT NULL,
  weight FLOAT DEFAULT 1.0, -- 0=忌口，0.3=不喜欢，1=一般，2=喜欢
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_type, preference_value)
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);

-- RLS 策略
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的喜好
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的喜好
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的喜好
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以删除自己的喜好
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- 2. 商品标签字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 标签索引 (GIN 用于数组查询)
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- 3. 更新函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_preferences IS '用户用餐喜好设置';
COMMENT ON COLUMN user_preferences.preference_type IS '喜好类型：diet=饮食类型，taste=口味，ingredient=食材，avoid=忌口';
COMMENT ON COLUMN user_preferences.weight IS '权重：0=忌口，0.3=不喜欢，1=一般，2=喜欢';
COMMENT ON COLUMN products.tags IS '商品标签数组，如：[\"肉食\", \"辣\", \"牛肉\", \"川菜\"]';
