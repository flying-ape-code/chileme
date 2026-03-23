-- 分享功能数据库表结构

-- 分享记录表
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_type VARCHAR(50) NOT NULL DEFAULT 'result',
  content JSONB,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PK 对战表
CREATE TABLE IF NOT EXISTS pk_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pk_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  inviter_choice VARCHAR(255),
  participant_choice VARCHAR(255),
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'completed'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_shared_at ON shares(shared_at);
CREATE INDEX IF NOT EXISTS idx_pk_battles_code ON pk_battles(pk_code);
CREATE INDEX IF NOT EXISTS idx_pk_battles_inviter ON pk_battles(inviter_id);
CREATE INDEX IF NOT EXISTS idx_pk_battles_participant ON pk_battles(participant_id);
CREATE INDEX IF NOT EXISTS idx_pk_battles_status ON pk_battles(status);

-- 添加积分到 users 表（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0;

-- 创建添加积分的函数
CREATE OR REPLACE FUNCTION add_user_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points + p_points,
      total_shares = total_shares + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 创建分享触发器（自动增加分享次数）
CREATE OR REPLACE FUNCTION increment_share_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET total_shares = total_shares + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_share ON shares;
CREATE TRIGGER trigger_increment_share
  AFTER INSERT ON shares
  FOR EACH ROW
  EXECUTE FUNCTION increment_share_count();

-- 行级安全策略
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE pk_battles ENABLE ROW LEVEL SECURITY;

-- shares 表策略
CREATE POLICY "用户可以查看自己的分享记录"
  ON shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的分享记录"
  ON shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- pk_battles 表策略
CREATE POLICY "用户可以查看自己相关的 PK"
  ON pk_battles FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = participant_id);

CREATE POLICY "用户可以创建 PK"
  ON pk_battles FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "用户可以更新自己相关的 PK"
  ON pk_battles FOR UPDATE
  USING (auth.uid() = inviter_id OR auth.uid() = participant_id);

-- 插入测试数据（可选）
-- INSERT INTO shares (user_id, platform, share_type, content, points_earned)
-- VALUES 
--   ('test-user-id', 'wechat', 'result', '{"foodName": "火锅", "category": "午餐"}', 10),
--   ('test-user-id', 'weibo', 'result', '{"foodName": "烧烤", "category": "晚餐"}', 10);
