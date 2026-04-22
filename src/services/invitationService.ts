/**
 * Issue #41: 邀请服务
 * 负责邀请码管理、邀请奖励、邀请排行榜
 */

import { supabase } from '../lib/supabaseClient';
import { trackConversion } from './shareService';

// ============================================
// 类型定义
// ============================================

export interface InvitationCode {
  id: string;
  user_id: string;
  code: string;
  used_count: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_email?: string;
  code: string;
  status: 'pending' | 'registered' | 'first_use' | 'completed';
  reward_status: 'none' | 'inviter_awarded' | 'invitee_awarded' | 'both_awarded';
  registered_at?: string;
  first_used_at?: string;
  completed_at?: string;
  created_at: string;
  // 关联数据
  invitee_name?: string;
}

export interface InviteStats {
  totalInvited: number;
  registeredCount: number;
  firstUseCount: number;
  completedCount: number;
  totalPointsEarned: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  invite_count: number;
  avatar?: string;
}

// 积分奖励配置
export const INVITE_REWARDS = {
  INVITER_REGISTER_POINTS: 50,    // 邀请人获得：好友注册
  INVITEE_REGISTER_POINTS: 30,    // 被邀请人获得：注册奖励
  INVITER_FIRST_USE_POINTS: 20,   // 邀请人获得：好友首次使用
  INVITEE_FIRST_USE_POINTS: 20,   // 被邀请人获得：首次使用
};

// ============================================
// 邀请码管理
// ============================================

/**
 * 获取当前用户的邀请码
 */
export async function getMyInviteCode(): Promise<InvitationCode | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.warn('获取邀请码失败:', error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.warn('获取邀请码异常:', err);
    return null;
  }
}

/**
 * 验证邀请码是否存在
 */
export async function validateInviteCode(code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('id, code, used_count, max_uses, is_active')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error || !data) return false;
    
    return data.used_count < data.max_uses;
  } catch (err) {
    return false;
  }
}

/**
 * 获取邀请码对应的用户信息
 */
export async function getInviteCodeOwner(code: string): Promise<{ user_id: string; username: string } | null> {
  try {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('user_id, profiles:profiles(username)')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error || !data) return null;
    
    return {
      user_id: data.user_id,
      username: (data.profiles as any)?.username || '未知用户',
    };
  } catch (err) {
    return null;
  }
}

// ============================================
// 邀请记录
// ============================================

/**
 * 获取我的邀请列表
 */
export async function getMyInvitations(page: number = 1, limit: number = 20): Promise<{
  invitations: Invitation[];
  total: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { invitations: [], total: 0 };
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('invitations')
      .select('*', { count: 'exact' })
      .eq('inviter_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.warn('获取邀请列表失败:', error.message);
      return { invitations: [], total: 0 };
    }
    
    return {
      invitations: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.warn('获取邀请列表异常:', err);
    return { invitations: [], total: 0 };
  }
}

/**
 * 获取邀请统计
 */
export async function getInviteStats(): Promise<InviteStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { totalInvited: 0, registeredCount: 0, firstUseCount: 0, completedCount: 0, totalPointsEarned: 0 };
    }
    
    const { data, error } = await supabase
      .from('invitations')
      .select('status, reward_status')
      .eq('inviter_id', user.id);
    
    if (error) {
      console.warn('获取邀请统计失败:', error.message);
      return { totalInvited: 0, registeredCount: 0, firstUseCount: 0, completedCount: 0, totalPointsEarned: 0 };
    }
    
    const invitations = data || [];
    
    return {
      totalInvited: invitations.length,
      registeredCount: invitations.filter(i => i.status === 'registered' || i.status === 'first_use' || i.status === 'completed').length,
      firstUseCount: invitations.filter(i => i.status === 'first_use' || i.status === 'completed').length,
      completedCount: invitations.filter(i => i.status === 'completed').length,
      totalPointsEarned: invitations.filter(i => i.reward_status === 'inviter_awarded' || i.reward_status === 'both_awarded').length * INVITE_REWARDS.INVITER_REGISTER_POINTS,
    };
  } catch (err) {
    console.warn('获取邀请统计异常:', err);
    return { totalInvited: 0, registeredCount: 0, firstUseCount: 0, completedCount: 0, totalPointsEarned: 0 };
  }
}

// ============================================
// 邀请奖励处理
// ============================================

/**
 * 处理新用户使用邀请码注册
 * 调用后端 RPC 函数处理奖励
 */
export async function processInviteRegistration(
  inviteeId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('process_invite_register', {
      p_invitee_id: inviteeId,
      p_code: code.toUpperCase(),
    });
    
    if (error) {
      console.warn('处理邀请注册失败:', error.message);
      return { success: false, message: error.message };
    }
    
    // 记录转化
    await trackConversion(code.toUpperCase(), 'register', inviteeId);
    
    return { success: true, message: '邀请奖励已发放！' };
  } catch (err: any) {
    console.warn('处理邀请注册异常:', err);
    return { success: false, message: err.message || '处理失败' };
  }
}

/**
 * 处理首次使用奖励
 */
export async function processFirstUseReward(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('process_first_use_reward', {
      p_user_id: userId,
    });
    
    if (error) {
      console.warn('处理首次使用奖励失败:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: '首次使用奖励已发放！' };
  } catch (err: any) {
    console.warn('处理首次使用奖励异常:', err);
    return { success: false, message: err.message || '处理失败' };
  }
}

// ============================================
// 邀请排行榜
// ============================================

/**
 * 获取邀请排行榜
 */
export async function getInviteLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('inviter_id, profiles:profiles(username)')
      .in('status', ['registered', 'first_use', 'completed']);
    
    if (error) {
      console.warn('获取排行榜失败:', error.message);
      return [];
    }
    
    // 统计每个邀请人的邀请数
    const countMap = new Map<string, { count: number; username: string }>();
    
    for (const inv of (data || [])) {
      const inviterId = inv.inviter_id;
      const username = (inv.profiles as any)?.username || '未知用户';
      
      if (!countMap.has(inviterId)) {
        countMap.set(inviterId, { count: 0, username });
      }
      countMap.get(inviterId)!.count++;
    }
    
    // 转换为数组并排序
    const leaderboard: LeaderboardEntry[] = Array.from(countMap.entries())
      .map(([user_id, { count, username }]) => ({
        user_id,
        username,
        invite_count: count,
      }))
      .sort((a, b) => b.invite_count - a.invite_count)
      .slice(0, limit);
    
    return leaderboard;
  } catch (err) {
    console.warn('获取排行榜异常:', err);
    return [];
  }
}
