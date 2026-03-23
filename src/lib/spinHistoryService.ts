import { supabase } from './supabaseClient';

export interface SpinHistoryRecord {
  id: string;
  user_id: string;
  category: string;
  category_emoji: string;
  winner: string;
  winner_emoji: string;
  items: string[];
  spin_count: number;
  created_at: string;
}

export interface SpinHistoryStats {
  totalSpins: number;
  thisWeekSpins: number;
  todaySpins: number;
  mostFrequent: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  weeklyData: Array<{
    date: string;
    count: number;
    categories: Record<string, number>;
  }>;
}

export interface SpinHistoryResponse {
  success: boolean;
  message?: string;
  record?: SpinHistoryRecord;
  records?: SpinHistoryRecord[];
  stats?: SpinHistoryStats;
}

// 添加历史记录
export const addSpinHistory = async (
  userId: string,
  category: string,
  categoryEmoji: string,
  winner: string,
  winnerEmoji: string,
  items: string[],
  spinCount: number = 1
): Promise<SpinHistoryResponse> => {
  try {
    const { data, error } = await supabase
      .from('spin_history')
      .insert({
        user_id: userId,
        category,
        category_emoji: categoryEmoji,
        winner,
        winner_emoji: winnerEmoji,
        items,
        spin_count: spinCount,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, record: data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '添加历史记录失败',
    };
  }
};

// 获取用户的历史记录
export const getUserSpinHistory = async (
  userId: string,
  limit: number = 50
): Promise<SpinHistoryResponse> => {
  try {
    const { data, error } = await supabase
      .from('spin_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, records: data || [] };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取历史记录失败',
    };
  }
};

// 删除单条历史记录
export const deleteSpinHistoryRecord = async (
  recordId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('spin_history')
      .delete()
      .eq('id', recordId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除历史记录失败',
    };
  }
};

// 清空所有历史记录（用户自己的）
export const clearAllSpinHistory = async (
  userId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('spin_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '清空历史记录失败',
    };
  }
};

// 获取统计信息
export const getSpinHistoryStats = async (
  userId: string
): Promise<SpinHistoryResponse> => {
  try {
    // 获取所有历史记录
    const { data: allRecords, error } = await supabase
      .from('spin_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, message: error.message };
    }

    const records = allRecords || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 基础统计
    const totalSpins = records.length;
    const todaySpins = records.filter(
      (r) => new Date(r.created_at) >= today
    ).length;
    const thisWeekSpins = records.filter(
      (r) => new Date(r.created_at) >= weekAgo
    ).length;

    // 最常选食物
    const mostFrequent: Record<string, number> = {};
    records.forEach((record) => {
      mostFrequent[record.winner] = (mostFrequent[record.winner] || 0) + 1;
    });

    // 餐类分布
    const categoryBreakdown: Record<string, number> = {};
    records.forEach((record) => {
      const key = `${record.category_emoji} ${record.category}`;
      categoryBreakdown[key] = (categoryBreakdown[key] || 0) + 1;
    });

    // 本周每日数据
    const weeklyData: Array<{
      date: string;
      count: number;
      categories: Record<string, number>;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const dayRecords = records.filter((r) => {
        const rDate = new Date(r.created_at);
        return rDate >= date && rDate < nextDate;
      });

      const categories: Record<string, number> = {};
      dayRecords.forEach((r) => {
        categories[r.category] = (categories[r.category] || 0) + 1;
      });

      weeklyData.push({
        date: dateStr,
        count: dayRecords.length,
        categories,
      });
    }

    const stats: SpinHistoryStats = {
      totalSpins,
      thisWeekSpins,
      todaySpins,
      mostFrequent,
      categoryBreakdown,
      weeklyData,
    };

    return { success: true, stats };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取统计信息失败',
    };
  }
};
