// 分享服务 - 处理分享统计、积分、PK 等功能

import { supabase } from './supabaseClient';

export interface ShareRecord {
  id?: string;
  user_id: string;
  platform: string;
  shared_at: string;
  share_type: 'result' | 'pk_invite' | 'pk_accept' | 'link';
  content?: {
    foodName?: string;
    category?: string;
    url?: string;
  };
  points_earned?: number;
}

export interface PKRecord {
  id?: string;
  inviter_id: string;
  participant_id?: string;
  pk_code: string;
  status: 'pending' | 'active' | 'completed';
  inviter_choice?: string;
  participant_choice?: string;
  winner_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface ShareStats {
  total_shares: number;
  shares_by_platform: Record<string, number>;
  total_points: number;
  rank?: number;
}

/**
 * 记录分享事件
 */
export const recordShare = async (shareData: ShareRecord): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('shares')
      .insert([shareData])
      .select()
      .single();

    if (error) {
      console.error('记录分享失败:', error);
      return false;
    }

    // 给用户加积分
    if (shareData.points_earned) {
      await addSharePoints(shareData.user_id, shareData.points_earned);
    }

    return true;
  } catch (error) {
    console.error('记录分享异常:', error);
    return false;
  }
};

/**
 * 添加分享积分
 */
export const addSharePoints = async (userId: string, points: number): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('add_user_points', {
      p_user_id: userId,
      p_points: points
    });

    if (error) {
      console.error('添加积分失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('添加积分异常:', error);
    return false;
  }
};

/**
 * 获取用户分享统计
 */
export const getUserShareStats = async (userId: string): Promise<ShareStats | null> => {
  try {
    // 获取总分享数
    const { count: total_shares } = await supabase
      .from('shares')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 按平台统计
    const { data: platformStats } = await supabase
      .from('shares')
      .select('platform')
      .eq('user_id', userId);

    const shares_by_platform: Record<string, number> = {};
    platformStats?.forEach(share => {
      shares_by_platform[share.platform] = (shares_by_platform[share.platform] || 0) + 1;
    });

    // 获取用户积分
    const { data: userData } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    // 获取排名
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('points', userData?.points || 0);

    return {
      total_shares: total_shares || 0,
      shares_by_platform,
      total_points: userData?.points || 0,
      rank: totalUsers ? totalUsers + 1 : undefined
    };
  } catch (error) {
    console.error('获取分享统计失败:', error);
    return null;
  }
};

/**
 * 创建 PK 邀请
 */
export const createPKInvite = async (inviterId: string, pkCode?: string): Promise<PKRecord | null> => {
  try {
    const code = pkCode || generatePKCode();
    
    const { data, error } = await supabase
      .from('pk_battles')
      .insert([{
        inviter_id: inviterId,
        pk_code: code,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('创建 PK 失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('创建 PK 异常:', error);
    return null;
  }
};

/**
 * 通过 PK 码查找 PK
 */
export const findPKByCode = async (pkCode: string): Promise<PKRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('pk_battles')
      .select('*')
      .eq('pk_code', pkCode)
      .eq('status', 'pending')
      .single();

    if (error) {
      console.error('查找 PK 失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('查找 PK 异常:', error);
    return null;
  }
};

/**
 * 接受 PK 邀请
 */
export const acceptPKInvite = async (
  pkId: string,
  participantId: string,
  participantChoice: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pk_battles')
      .update({
        participant_id: participantId,
        participant_choice: participantChoice,
        status: 'active'
      })
      .eq('id', pkId);

    if (error) {
      console.error('接受 PK 失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('接受 PK 异常:', error);
    return false;
  }
};

/**
 * 确定 PK 结果
 */
export const completePK = async (
  pkId: string,
  winnerId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pk_battles')
      .update({
        winner_id: winnerId,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', pkId);

    if (error) {
      console.error('完成 PK 失败:', error);
      return false;
    }

    // 给获胜者加积分
    await addSharePoints(winnerId, 50);

    return true;
  } catch (error) {
    console.error('完成 PK 异常:', error);
    return false;
  }
};

/**
 * 获取用户的 PK 记录
 */
export const getUserPKRecords = async (userId: string): Promise<PKRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('pk_battles')
      .select('*')
      .or(`inviter_id.eq.${userId},participant_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取 PK 记录失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取 PK 记录异常:', error);
    return [];
  }
};

/**
 * 生成 PK 码
 */
const generatePKCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 获取分享排行榜
 */
export const getShareLeaderboard = async (limit: number = 10): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar, points')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取排行榜失败:', error);
      return [];
    }

    return data?.map((user, index) => ({
      rank: index + 1,
      ...user
    })) || [];
  } catch (error) {
    console.error('获取排行榜异常:', error);
    return [];
  }
};

/**
 * 生成分享链接
 */
export const generateShareLink = (
  foodName: string,
  category: string,
  userId?: string
): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    food: foodName,
    category: category,
    source: 'share'
  });
  
  if (userId) {
    params.set('inviter', userId);
  }
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * 生成 PK 邀请链接
 */
export const generatePKInviteLink = (pkCode: string, inviterId: string): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    pk: pkCode,
    inviter: inviterId,
    action: 'pk'
  });
  
  return `${baseUrl}?${params.toString()}`;
};
