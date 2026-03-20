import { supabase } from './supabaseClient';

export interface Meal {
  id: string;
  name: string;
  category: string;
  image_url: string;
  cps_link: string;
  price?: number;
  is_active: boolean;
}

/**
 * 获取指定分类的商品列表
 */
export async function getMealsByCategory(category: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
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
export const mealCategories = [
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍜' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍽️' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];

/**
 * 随机获取指定数量的商品
 */
export function getRandomMeals(meals: Meal[], count: number = 6): Meal[] {
  const shuffled = [...meals].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
