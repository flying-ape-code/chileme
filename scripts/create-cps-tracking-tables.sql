-- CPS 点击追踪表
-- 用于记录用户点击 CPS 链接的事件

CREATE TABLE IF NOT EXISTS cps_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255),
  category VARCHAR(50),
  source VARCHAR(50) DEFAULT 'unknown', -- 'result', 'detail', 'list', 'card'
  platform VARCHAR(50) DEFAULT 'h5', -- 'h5', 'miniprogram', 'wechat'
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_cps_clicks_product_id ON cps_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_cps_clicks_clicked_at ON cps_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_cps_clicks_category ON cps_clicks(category);

-- 添加商品点击计数字段到 meals 表（如果不存在）
ALTER TABLE meals ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS cps_link VARCHAR(500);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS cps_updated_at TIMESTAMP WITH TIME ZONE;

-- 创建增加点击计数的函数
CREATE OR REPLACE FUNCTION increment_cps_click_count(product_id_param VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE meals
  SET click_count = click_count + 1,
      updated_at = NOW()
  WHERE name = product_id_param; -- 使用商品名称匹配
  
  -- 如果没有匹配到，尝试使用 cps_link 匹配
  IF NOT FOUND THEN
    UPDATE meals
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE cps_link LIKE '%' || product_id_param || '%';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建增加转化计数的函数
CREATE OR REPLACE FUNCTION increment_cps_conversion_count(product_id_param VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE meals
  SET conversion_count = conversion_count + 1,
      updated_at = NOW()
  WHERE name = product_id_param;
  
  IF NOT FOUND THEN
    UPDATE meals
    SET conversion_count = conversion_count + 1,
        updated_at = NOW()
    WHERE cps_link LIKE '%' || product_id_param || '%';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建视图：CPS 点击统计（按商品）
CREATE OR REPLACE VIEW cps_click_stats AS
SELECT
  m.name AS product_name,
  m.category,
  m.cps_link,
  m.click_count,
  m.conversion_count,
  COUNT(c.id) AS total_clicks,
  COUNT(DISTINCT c.user_id) AS unique_users,
  MAX(c.clicked_at) AS last_clicked_at
FROM meals m
LEFT JOIN cps_clicks c ON m.name = c.product_id
GROUP BY m.id, m.name, m.category, m.cps_link, m.click_count, m.conversion_count
ORDER BY total_clicks DESC;

-- 创建视图：CPS 点击统计（按日期）
CREATE OR REPLACE VIEW cps_daily_stats AS
SELECT
  DATE(clicked_at) AS click_date,
  COUNT(*) AS total_clicks,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT product_id) AS unique_products
FROM cps_clicks
GROUP BY DATE(clicked_at)
ORDER BY click_date DESC;

-- 添加行级安全策略（RLS）
ALTER TABLE cps_clicks ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入点击记录（用于追踪）
CREATE POLICY "Allow anonymous insert clicks" ON cps_clicks
  FOR INSERT
  WITH CHECK (true);

-- 只允许管理员查询点击数据
CREATE POLICY "Allow admin select clicks" ON cps_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 注释说明
COMMENT ON TABLE cps_clicks IS 'CPS 点击追踪表，记录用户点击美团联盟推广链接的事件';
COMMENT ON COLUMN cps_clicks.source IS '点击来源：result(结果页), detail(详情页), list(列表页), card(卡片)';
COMMENT ON COLUMN cps_clicks.platform IS '访问平台：h5(网页), miniprogram(小程序), wechat(微信)';
