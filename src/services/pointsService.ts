/**
 * Issue #41: 积分服务
 * 负责积分查询、积分交易、积分商城
 */

import { supabase } from '../lib/supabaseClient';

// ============================================
// 类型定义
// ============================================

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  used_points: number;
  available_points: number;
  vip_level: number;
  vip_expire_at?: string;
  created_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  type: 'share' | 'invite_register' | 'invite_first_use' | 'daily_checkin' | 'redeem_vip' | 'redeem_item' | 'admin_adjust';
  points: number;
  description?: string;
  related_id?: string;
  created_at: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  points_cost: number;
  type: 'vip_upgrade' | 'vip_extend' | 'coupon' | 'badge' | 'custom';
  reward_value?: string;
  stock: number;
  stock_used: number;
  is_active: boolean;
  sort_order: number;
}

export interface Redemption {
  id: string;
  user_id: string;
  item_id: string;
  points_cost: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  redeemed_at: string;
  completed_at?: string;
  item?: StoreItem;
}

// 积分类型配置
export const POINT_TYPES = {
  share: { label: '分享奖励', icon: '📤', color: 'text-cyan-400' },
  invite_register: { label: '邀请注册', icon: '👥', color: 'text-green-400' },
  invite_first_use: { label: '首次使用', icon: '🎉', color: 'text-yellow-400' },
  daily_checkin: { label: '每日签到', icon: '📅', color: 'text-blue-400' },
  redeem_vip: { label: '兑换VIP', icon: '👑', color: 'text-purple-400' },
  redeem_item: { label: '兑换商品', icon: '🛒', color: 'text-orange-400' },
  admin_adjust: { label: '管理员调整', icon: '⚙️', color: 'text-gray-400' },
};

// VIP 等级配置
export const VIP_LEVELS = {
  0: { name: '普通用户', color: 'text-gray-400', minPoints: 0 },
  1: { name: '铜牌会员', color: 'text-orange-400', minPoints: 500 },
  2: { name: '银牌会员', color: 'text-gray-300', minPoints: 2000 },
  3: { name: '金牌会员', color: 'text-yellow-400', minPoints: 5000 },
  4: { name: '钻石会员', color: 'text-cyan-400', minPoints: 10000 },
};

// ============================================
// 积分查询
// ============================================

/**
 * 获取当前用户积分
 */
export async function getUserPoints(): Promise<UserPoints | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.warn('获取积分失败:', error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.warn('获取积分异常:', err);
    return null;
  }
}

/**
 * 获取积分交易记录
 */
export async function getPointTransactions(
  page: number = 1,
  limit: number = 20
): Promise<{ transactions: PointTransaction[]; total: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { transactions: [], total: 0 };
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.warn('获取积分记录失败:', error.message);
      return { transactions: [], total: 0 };
    }
    
    return {
      transactions: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.warn('获取积分记录异常:', err);
    return { transactions: [], total: 0 };
  }
}

// ============================================
// 积分商城
// ============================================

/**
 * 获取积分商城商品列表
 */
export async function getStoreItems(): Promise<StoreItem[]> {
  try {
    const { data, error } = await supabase
      .from('points_store_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.warn('获取商城商品失败:', error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.warn('获取商城商品异常:', err);
    return [];
  }
}

/**
 * 兑换商品
 */
export async function redeemItem(itemId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: '请先登录' };
    
    // 获取商品信息
    const { data: item, error: itemError } = await supabase
      .from('points_store_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single();
    
    if (itemError || !item) {
      return { success: false, message: '商品不存在' };
    }
    
    // 检查库存
    if (item.stock !== -1 && item.stock_used >= item.stock) {
      return { success: false, message: '库存不足' };
    }
    
    // 检查积分
    const { data: points } = await supabase
      .from('user_points')
      .select('available_points')
      .eq('user_id', user.id)
      .single();
    
    if (!points || points.available_points < item.points_cost) {
      return { success: false, message: '积分不足' };
    }
    
    // 调用 RPC 消耗积分
    const { data: redeemResult, error: redeemError } = await supabase.rpc('redeem_points', {
      p_user_id: user.id,
      p_type: 'redeem_item',
      p_points: item.points_cost,
      p_description: `兑换 ${item.name}`,
      p_related_id: itemId,
    });
    
    if (redeemError || !redeemResult) {
      return { success: false, message: redeemError?.message || '兑换失败' };
    }
    
    // 创建兑换记录
    const { error: redemptionError } = await supabase
      .from('points_redemptions')
      .insert({
        user_id: user.id,
        item_id: itemId,
        points_cost: item.points_cost,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    
    if (redemptionError) {
      console.warn('创建兑换记录失败:', redemptionError.message);
    }
    
    // 更新库存
    if (item.stock !== -1) {
      await supabase
        .from('points_store_items')
        .update({ stock_used: item.stock_used + 1, updated_at: new Date().toISOString() })
        .eq('id', itemId);
    }
    
    // 特殊处理：VIP 兑换
    if (item.type === 'vip_extend' && item.reward_value) {
      const days = parseInt(item.reward_value);
      await extendVip(user.id, days);
    }
    
    return { success: true, message: `成功兑换 ${item.name}！` };
  } catch (err: any) {
    console.warn('兑换商品异常:', err);
    return { success: false, message: err.message || '兑换失败' };
  }
}

/**
 * 延长 VIP 有效期
 */
async function extendVip(userId: string, days: number): Promise<void> {
  try {
    const { data: current } = await supabase
      .from('user_points')
      .select('vip_expire_at, vip_level')
      .eq('user_id', userId)
      .single();
    
    let newExpire: Date;
    
    if (current?.vip_expire_at && new Date(current.vip_expire_at) > new Date()) {
      // 在现有过期时间基础上延长
      newExpire = new Date(current.vip_expire_at);
      newExpire.setDate(newExpire.getDate() + days);
    } else {
      // 从今天开始计算
      newExpire = new Date();
      newExpire.setDate(newExpire.getDate() + days);
    }
    
    // 根据天数确定 VIP 等级
    let vipLevel = 1;
    if (days >= 90) vipLevel = 3;
    else if (days >= 30) vipLevel = 2;
    
    if (current?.vip_level && current.vip_level > vipLevel) {
      vipLevel = current.vip_level;
    }
    
    await supabase
      .from('user_points')
      .update({
        vip_expire_at: newExpire.toISOString(),
        vip_level: vipLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (err) {
    console.warn('延长 VIP 失败:', err);
  }
}

/**
 * 获取我的兑换记录
 */
export async function getMyRedemptions(page: number = 1, limit: number = 10): Promise<{
  redemptions: Redemption[];
  total: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { redemptions: [], total: 0 };
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('points_redemptions')
      .select('*, item:points_store_items(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('redeemed_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.warn('获取兑换记录失败:', error.message);
      return { redemptions: [], total: 0 };
    }
    
    return {
      redemptions: (data || []) as Redemption[],
      total: count || 0,
    };
  } catch (err) {
    console.warn('获取兑换记录异常:', err);
    return { redemptions: [], total: 0 };
  }
}

// ============================================
// 积分获取方式
// ============================================

/**
 * 获取积分获取方式列表
 */
export function getPointWays(): Array<{
  type: string;
  label: string;
  icon: string;
  points: number;
  description: string;
  limit?: string;
}> {
  return [
    {
      type: 'share',
      label: '分享结果',
      icon: '📤',
      points: 10,
      description: '每次分享结果可获得积分',
      limit: '每日上限 50 分',
    },
    {
      type: 'invite_register',
      label: '邀请好友注册',
      icon: '👥',
      points: 50,
      description: '好友通过你的邀请码注册',
    },
    {
      type: 'invite_first_use',
      label: '好友首次使用',
      icon: '🎉',
      points: 20,
      description: '好友首次使用吃了么',
    },
    {
      type: 'daily_checkin',
      label: '每日签到',
      icon: '📅',
      points: 5,
      description: '每天签到领取积分',
      limit: '每日 1 次',
    },
  ];
}

// ============================================
// 积分获取（RPC 调用）
// ============================================

/**
 * 增加积分（调用后端 RPC）
 */
export async function awardPoints(
  type: PointTransaction['type'],
  points: number,
  description?: string,
  relatedId?: string
): Promise<{ success: boolean; availablePoints?: number; message?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: '请先登录' };
    
    const { data, error } = await supabase.rpc('award_points', {
      p_user_id: user.id,
      p_type: type,
      p_points: points,
      p_description: description,
      p_related_id: relatedId,
    });
    
    if (error) {
      console.warn('增加积分失败:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, availablePoints: data };
  } catch (err: any) {
    console.warn('增加积分异常:', err);
    return { success: false, message: err.message || '操作失败' };
  }
}
