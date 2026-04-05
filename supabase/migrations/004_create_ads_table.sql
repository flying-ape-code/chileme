-- 创建广告表
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT '广告',
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ads_enabled ON ads(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority);
CREATE INDEX IF NOT EXISTS idx_ads_time_range ON ads(start_at, end_at);

-- 添加 RLS 策略
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- 允许公开读取启用的广告
CREATE POLICY "Allow public read access to enabled ads"
  ON ads FOR SELECT
  USING (is_enabled = true);

-- 允许管理员管理广告（需要 auth 角色）
CREATE POLICY "Allow authenticated users to manage ads"
  ON ads FOR ALL
  USING (auth.role() = 'authenticated');

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
