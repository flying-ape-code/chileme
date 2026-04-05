import { supabase } from '../lib/supabaseClient';

export interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  is_enabled: boolean;
  priority: number;
  start_at?: string;
  end_at?: string;
}

/**
 * 获取当前有效的广告列表
 * 按优先级排序，返回第一个启用的广告
 */
export async function fetchActiveAd(): Promise<Ad | null> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_enabled', true)
      .lte('start_at', now)
      .gte('end_at', now)
      .order('priority', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch ad:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching ad:', err);
    return null;
  }
}

/**
 * 获取所有启用的广告（用于管理后台）
 */
export async function fetchAllEnabledAds(): Promise<Ad[]> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_enabled', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Failed to fetch ads:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching ads:', err);
    return [];
  }
}

/**
 * 检查广告是否在有效期内
 */
export function isAdValid(ad: Ad): boolean {
  const now = new Date();
  
  if (ad.start_at) {
    const startDate = new Date(ad.start_at);
    if (now < startDate) return false;
  }
  
  if (ad.end_at) {
    const endDate = new Date(ad.end_at);
    if (now > endDate) return false;
  }
  
  return ad.is_enabled;
}

/**
 * 创建新广告
 */
export async function createAd(ad: Omit<Ad, 'id'>): Promise<Ad | null> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .insert([ad])
      .select()
      .single();

    if (error) {
      console.error('Failed to create ad:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error creating ad:', err);
    return null;
  }
}

/**
 * 更新广告
 */
export async function updateAd(id: string, updates: Partial<Ad>): Promise<Ad | null> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update ad:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error updating ad:', err);
    return null;
  }
}

/**
 * 删除广告
 */
export async function deleteAd(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete ad:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting ad:', err);
    return false;
  }
}

/**
 * 获取所有广告（包括禁用的，用于管理后台）
 */
export async function fetchAllAds(): Promise<Ad[]> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Failed to fetch all ads:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching all ads:', err);
    return [];
  }
}
