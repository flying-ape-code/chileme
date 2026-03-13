import { supabase } from './supabaseClient';

export interface SpinRecord {
  id: string;
  user_id: string;
  result: string;
  points: number;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface SpinRecordResponse {
  success: boolean;
  message?: string;
  record?: SpinRecord;
  records?: SpinRecord[];
}

// 创建抽奖记录
export const createSpinRecord = async (
  userId: string,
  result: string,
  points: number
): Promise<SpinRecordResponse> => {
  try {
    const { data, error } = await supabase
      .from('spin_records')
      .insert({
        user_id: userId,
        result,
        points,
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
      message: error.message || '创建抽奖记录失败',
    };
  }
};

// 获取用户的抽奖记录
export const getUserSpinRecords = async (
  userId: string,
  limit: number = 50
): Promise<SpinRecordResponse> => {
  try {
    const { data, error } = await supabase
      .from('spin_records')
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
      message: error.message || '获取抽奖记录失败',
    };
  }
};

// 获取所有抽奖记录（仅管理员）
export const getAllSpinRecords = async (
  limit: number = 100
): Promise<SpinRecordResponse> => {
  try {
    const { data, error } = await supabase
      .from('spin_records')
      .select(`
        *,
        user:profiles (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, records: data || [] };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取所有抽奖记录失败',
    };
  }
};

// 获取抽奖统计信息
export const getSpinStats = async (userId?: string): Promise<{
  totalSpins: number;
  totalPoints: number;
  averagePoints: number;
} | null> => {
  try {
    let query = supabase.from('spin_records').select('points');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return null;
    }

    const totalSpins = data?.length || 0;
    const totalPoints = data?.reduce((sum, r) => sum + (r.points || 0), 0) || 0;
    const averagePoints = totalSpins > 0 ? Math.round(totalPoints / totalSpins) : 0;

    return { totalSpins, totalPoints, averagePoints };
  } catch (error) {
    console.error('Error getting spin stats:', error);
    return null;
  }
};

// 删除抽奖记录（仅管理员）
export const deleteSpinRecord = async (
  recordId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('spin_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除抽奖记录失败',
    };
  }
};
