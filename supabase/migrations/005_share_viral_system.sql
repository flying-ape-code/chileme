-- ============================================
-- V3.0: 分享裂变系统 - 数据库迁移
-- Issue #41: 分享裂变功能
-- ============================================

-- ============================================
-- 1. 邀请系统 (Invitation System)
-- ============================================

-- 邀请码表
CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  used_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_codes_code ON public.invitation_codes(code);
CREATE INDEX idx_invitation_codes_user ON public.invitation_codes(user_id);

-- 邀请记录表
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invitee_email TEXT,
  code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'first_use', 'completed')),
  reward_status VARCHAR(20) DEFAULT 'none' CHECK (reward_status IN ('none', 'inviter_awarded', 'invitee_awarded', 'both_awarded')),
  registered_at TIMESTAMPTZ,
  first_used_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_inviter ON public.invitations(inviter_id);
CREATE INDEX idx_invitations_invitee ON public.invitations(invitee_id);
CREATE INDEX idx_invitations_code ON public.invitations(code);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- ============================================
-- 2. 积分系统 (Points System)
-- ============================================

-- 用户积分表
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  used_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  vip_level INTEGER DEFAULT 0,
  vip_expire_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_points_user ON public.user_points(user_id);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('share', 'invite_register', 'invite_first_use', 'daily_checkin', 'redeem_vip', 'redeem_item', 'admin_adjust')),
  points INTEGER NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON public.point_transactions(type);
CREATE INDEX idx_point_transactions_created ON public.point_transactions(created_at DESC);

-- ============================================
-- 3. 分享事件追踪 (Share Analytics)
-- ============================================

-- 分享事件表
CREATE TABLE IF NOT EXISTS public.share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('result', 'poster', 'invite', 'general')),
  platform VARCHAR(30) NOT NULL,
  target_food_id UUID,
  target_food_name TEXT,
  category VARCHAR(20),
  ref_code VARCHAR(50),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_share_events_user ON public.share_events(user_id);
CREATE INDEX idx_share_events_platform ON public.share_events(platform);
CREATE INDEX idx_share_events_created ON public.share_events(created_at DESC);
CREATE INDEX idx_share_events_ref_code ON public.share_events(ref_code);

-- 分享转化表
CREATE TABLE IF NOT EXISTS public.share_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_event_id UUID REFERENCES public.share_events(id) ON DELETE SET NULL,
  ref_code VARCHAR(50),
  action VARCHAR(20) NOT NULL CHECK (action IN ('click', 'register', 'first_use')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_share_conversions_ref ON public.share_conversions(ref_code);
CREATE INDEX idx_share_conversions_action ON public.share_conversions(action);

-- ============================================
-- 4. 积分商城 (Points Store)
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('vip_upgrade', 'vip_extend', 'coupon', 'badge', 'custom')),
  reward_value TEXT,
  stock INTEGER DEFAULT -1,
  stock_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_store_active ON public.points_store_items(is_active, sort_order);

CREATE TABLE IF NOT EXISTS public.points_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.points_store_items(id),
  points_cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_points_redemptions_user ON public.points_redemptions(user_id);
CREATE INDEX idx_points_redemptions_item ON public.points_redemptions(item_id);

-- ============================================
-- 5. RLS 策略
-- ============================================

ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invitation codes" ON public.invitation_codes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own invitation codes" ON public.invitation_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invitation codes" ON public.invitation_codes
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invitations" ON public.invitations
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Anyone can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (true);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert share events" ON public.share_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own share events" ON public.share_events
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.share_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert conversions" ON public.share_conversions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own conversions" ON public.share_conversions
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.points_store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view store items" ON public.points_store_items
  FOR SELECT USING (is_active = true);

ALTER TABLE public.points_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON public.points_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 6. 自动触发器
-- ============================================

CREATE TRIGGER update_invitation_codes_updated_at
  BEFORE UPDATE ON public.invitation_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_points_store_updated_at
  BEFORE UPDATE ON public.points_store_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. 初始化积分商城商品
-- ============================================

INSERT INTO public.points_store_items (name, description, points_cost, type, reward_value, sort_order) VALUES
  ('VIP 7天体验卡', '兑换7天VIP会员体验', 500, 'vip_extend', '7', 1),
  ('VIP 30天会员', '兑换30天VIP会员', 1800, 'vip_extend', '30', 2),
  ('VIP 90天会员', '兑换90天VIP会员', 4500, 'vip_extend', '90', 3),
  ('专属徽章「美食达人」', '个人资料页展示专属徽章', 300, 'badge', 'food_master', 4),
  ('专属徽章「分享达人」', '个人资料页展示专属徽章', 500, 'badge', 'share_master', 5),
  ('定制转盘主题', '解锁个性化转盘配色方案', 800, 'custom', 'custom_theme', 6);

-- ============================================
-- 8. 创建用户时自动初始化积分记录 & 邀请码
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, used_points, available_points)
  VALUES (NEW.id, 0, 0, 0);
  
  INSERT INTO public.invitation_codes (user_id, code)
  VALUES (NEW.id, upper(substr(md5(NEW.id || now()::text), 1, 8)));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_user_init_points ON public.profiles;
CREATE TRIGGER on_new_user_init_points
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_points();

-- ============================================
-- 9. 积分操作函数 (供 Edge Functions 或 RPC 调用)
-- ============================================

-- 增加积分
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_type VARCHAR,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- 更新用户积分
  UPDATE public.user_points
  SET 
    total_points = total_points + p_points,
    available_points = available_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING available_points INTO v_available;
  
  -- 记录交易
  INSERT INTO public.point_transactions (user_id, type, points, description, related_id)
  VALUES (p_user_id, p_type, p_points, p_description, p_related_id);
  
  RETURN v_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 消耗积分
CREATE OR REPLACE FUNCTION public.redeem_points(
  p_user_id UUID,
  p_type VARCHAR,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT available_points INTO v_available
  FROM public.user_points WHERE user_id = p_user_id;
  
  IF v_available IS NULL OR v_available < p_points THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_points
  SET 
    used_points = used_points + p_points,
    available_points = available_points - p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  INSERT INTO public.point_transactions (user_id, type, points, description, related_id)
  VALUES (p_user_id, p_type, -p_points, p_description, p_related_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 处理邀请注册奖励
CREATE OR REPLACE FUNCTION public.process_invite_register(
  p_invitee_id UUID,
  p_code VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_inviter_id UUID;
  v_invite_record_id UUID;
BEGIN
  -- 查找邀请记录（最新的pending状态）
  SELECT inviter_id, id INTO v_inviter_id, v_invite_record_id
  FROM public.invitations
  WHERE code = p_code AND invitee_id IS NULL AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_inviter_id IS NOT NULL THEN
    -- 更新邀请记录
    UPDATE public.invitations
    SET 
      invitee_id = p_invitee_id,
      status = 'registered',
      registered_at = NOW(),
      reward_status = 'both_awarded'
    WHERE id = v_invite_record_id;
    
    -- 更新邀请码使用计数
    UPDATE public.invitation_codes
    SET used_count = used_count + 1, updated_at = NOW()
    WHERE code = p_code;
    
    -- 邀请人获得注册奖励积分 (50分)
    PERFORM public.award_points(v_inviter_id, 'invite_register', 50, '好友注册奖励', v_invite_record_id);
    
    -- 被邀请人获得注册奖励积分 (30分)
    PERFORM public.award_points(p_invitee_id, 'invite_register', 30, '通过邀请码注册奖励', v_invite_record_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 处理首次使用奖励
CREATE OR REPLACE FUNCTION public.process_first_use_reward(
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_has_reward BOOLEAN;
BEGIN
  -- 检查是否已经获得过首次使用奖励
  SELECT EXISTS(
    SELECT 1 FROM public.point_transactions 
    WHERE user_id = p_user_id AND type = 'invite_first_use'
  ) INTO v_has_reward;
  
  IF NOT v_has_reward THEN
    -- 被邀请人获得首次使用奖励 (20分)
    PERFORM public.award_points(p_user_id, 'invite_first_use', 20, '首次使用奖励');
    
    -- 查找邀请人并给奖励 (20分)
    UPDATE public.invitations
    SET status = 'completed', first_used_at = NOW(), completed_at = NOW()
    WHERE invitee_id = p_user_id AND status = 'registered'
    RETURNING inviter_id INTO v_has_reward;
    
    -- 给邀请人首次使用奖励
    PERFORM public.award_points(
      (SELECT inviter_id FROM public.invitations WHERE invitee_id = p_user_id AND status = 'completed' ORDER BY completed_at DESC LIMIT 1),
      'invite_first_use', 20, '好友首次使用奖励'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.invitation_codes IS '用户专属邀请码';
COMMENT ON TABLE public.invitations IS '邀请关系记录';
COMMENT ON TABLE public.user_points IS '用户积分账户';
COMMENT ON TABLE public.point_transactions IS '积分交易流水';
COMMENT ON TABLE public.share_events IS '分享事件追踪';
COMMENT ON TABLE public.share_conversions IS '分享转化漏斗';
COMMENT ON TABLE public.points_store_items IS '积分商城商品';
COMMENT ON TABLE public.points_redemptions IS '积分兑换记录';
