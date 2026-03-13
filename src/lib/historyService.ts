import { supabase } from './supabaseClient';

export interface HistoryRecord {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface HistoryRecordResponse {
  success: boolean;
  message?: string;
  record?: HistoryRecord;
  records?: HistoryRecord[];
}

// 创建历史记录
export const createHistoryRecord = async (
  userId: string,
  action: string,
  details?: string
): Promise<HistoryRecordResponse> => {
  try {
    const { data, error } = await supabase
      .from('history')
      .insert({
        user_id: userId,
        action,
        details,
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
      message: error.message || '创建历史记录失败',
    };
  }
};

// 获取用户的历史记录
export const getUserHistory = async (
  userId: string,
  limit: number = 50
): Promise<HistoryRecordResponse> => {
  try {
    const { data, error } = await supabase
      .from('history')
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

// 获取所有历史记录（仅管理员）
export const getAllHistory = async (
  limit: number = 100
): Promise<HistoryRecordResponse> => {
  try {
    const { data, error } = await supabase
      .from('history')
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
      message: error.message || '获取所有历史记录失败',
    };
  }
};

// 删除历史记录（仅管理员）
export const deleteHistoryRecord = async (
  recordId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('history')
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

// 获取操作统计
export const getHistoryStats = async (userId?: string): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
} | null> => {
  try {
    let query = supabase.from('history').select('action');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return null;
    }

    const totalActions = data?.length || 0;
    const actionsByType: Record<string, number> = {};

    data?.forEach((record) => {
      const action = record.action || 'unknown';
      actionsByType[action] = (actionsByType[action] || 0) + 1;
    });

    return { totalActions, actionsByType };
  } catch (error) {
    console.error('Error getting history stats:', error);
    return null;
  }
};
