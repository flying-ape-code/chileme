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
