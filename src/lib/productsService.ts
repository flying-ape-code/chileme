import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  img: string;
  promo_url?: string | null;
  cps_link?: string | null;
  category: string;
  price_min?: number | null;
  price_max?: number | null;
  rating?: number | null;
  distance?: string | null;
  delivery_time?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * 获取指定分类的商品列表
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取商品失败:', error.message);
    return [];
  }

  return data || [];
}

/**
 * 获取所有分类
 */
export const productCategories = [
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍜' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍽️' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];

/**
 * 随机获取指定数量的商品
 */
export function getRandomProducts(products: Product[], count: number = 6): Product[] {
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
