import { supabase } from './supabaseClient';

export interface HistoryRecord {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  productId?: string;
  productName?: string;
  productImage?: string;
  category?: string;
  createdAt: string;
}

export interface HistoryStats {
  totalCount: number;
  thisWeekCount: number;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    count: number;
  }>;
}

/**
 * 记录用户选择历史
 */
export async function recordSelection(
  userId: string,
  product: {
    id: string;
    name: string;
    img?: string;
    category: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('history').insert({
      user_id: userId,
      action: 'selection',
      details: JSON.stringify({
        productId: product.id,
        productName: product.name,
        productImage: product.img,
        category: product.category,
        timestamp: new Date().toISOString()
      })
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 获取用户历史记录
 */
export async function getUserHistory(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<HistoryRecord[]> {
  const {
    limit = 50,
    offset = 0,
    category,
    startDate,
    endDate
  } = options;

  let query = supabase
    .from('history')
    .select('*')
    .eq('user_id', userId)
    .eq('action', 'selection')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // 分类筛选
  if (category) {
    // 需要在 details JSON 中筛选，这里先获取所有再过滤
    // 更好的方式是在数据库中添加 category 字段
  }

  // 日期筛选
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('获取历史记录失败:', error.message);
    return [];
  }

  // 解析 details JSON
  return (data || []).map(record => {
    try {
      const details = record.details ? JSON.parse(record.details) : {};
      return {
        ...record,
        productId: details.productId,
        productName: details.productName,
        productImage: details.productImage,
        category: details.category
      };
    } catch {
      return {
        ...record,
        productId: null,
        productName: null,
        productImage: null,
        category: null
      };
    }
  });
}

/**
 * 删除单条历史记录
 */
export async function deleteHistoryRecord(
  recordId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabase.from('history').delete().eq('id', recordId);
    
    // 如果提供了 userId，添加权限验证
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 清空所有历史记录
 */
export async function clearAllHistory(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 获取统计数据
 */
export async function getHistoryStats(
  userId: string
): Promise<HistoryStats | null> {
  try {
    // 获取所有历史记录
    const { data: allHistory, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'selection');

    if (error) {
      console.error('获取统计数据失败:', error.message);
      return null;
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 解析所有记录
    const parsedHistory = allHistory.map(record => {
      try {
        const details = record.details ? JSON.parse(record.details) : {};
        return {
          ...record,
          details,
          parsedDate: new Date(record.created_at)
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // 计算总数
    const totalCount = parsedHistory.length;

    // 本周数量
    const thisWeekCount = parsedHistory.filter(
      record => record.parsedDate >= weekAgo
    ).length;

    // 分类统计
    const categoryMap = new Map<string, number>();
    parsedHistory.forEach(record => {
      const category = record.details.category || 'unknown';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoryStats = Array.from(categoryMap.entries()).map(
      ([category, count]) => ({
        category,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
      })
    ).sort((a, b) => b.count - a.count);

    // 热门商品统计
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      productImage?: string;
      count: number;
    }>();

    parsedHistory.forEach(record => {
      const { productId, productName, productImage } = record.details;
      if (productId) {
        const existing = productMap.get(productId);
        if (existing) {
          existing.count++;
        } else {
          productMap.set(productId, {
            productId,
            productName,
            productImage,
            count: 1
          });
        }
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCount,
      thisWeekCount,
      categoryStats,
      topProducts
    };
  } catch (err: any) {
    console.error('统计计算失败:', err.message);
    return null;
  }
}

/**
 * 获取所有历史记录（管理员）
 */
export async function getAllHistory(
  limit: number = 100
): Promise<{ success: boolean; records?: HistoryRecord[]; error?: string }> {
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
      return { success: false, error: error.message };
    }

    return { success: true, records: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 本地存储（未登录用户）
 */
const STORAGE_KEY = 'chileme_history';

export function recordSelectionLocal(
  product: {
    id: string;
    name: string;
    img?: string;
    category: string;
  }
): void {
  try {
    const history = getHistoryLocal();
    const newRecord: HistoryRecord = {
      id: `local_${Date.now()}`,
      userId: 'local',
      action: 'selection',
      details: JSON.stringify({
        productId: product.id,
        productName: product.name,
        productImage: product.img,
        category: product.category,
        timestamp: new Date().toISOString()
      }),
      productId: product.id,
      productName: product.name,
      productImage: product.img,
      category: product.category,
      createdAt: new Date().toISOString()
    };

    // 只保留最近 100 条
    history.unshift(newRecord);
    if (history.length > 100) {
      history.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('本地记录失败:', err);
  }
}

export function getHistoryLocal(limit: number = 50): HistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const history = JSON.parse(data);
    return history.slice(0, limit);
  } catch (err) {
    console.error('获取本地历史失败:', err);
    return [];
  }
}

export function deleteHistoryLocal(recordId: string): void {
  try {
    const history = getHistoryLocal();
    const filtered = history.filter(r => r.id !== recordId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('删除本地历史失败:', err);
  }
}

export function clearHistoryLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('清空本地历史失败:', err);
  }
}
