/**
 * 商品数据（从 Supabase meals 表读取）
 * V2.1: 统一商品数据源 - 后台管理和转盘都从数据库读取
 */

import { supabase } from './lib/supabaseClient';

export interface Meal {
  id: string;
  name: string;
  category: string;
  image_url: string;
  cps_link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export const mealTypes = [
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍜' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍽️' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];

export const productCategories = mealTypes;

/**
 * 获取分类商品（从 meals 表）
 */
export async function getMealsByCategory(category: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from('meals')
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
 * 随机获取商品
 */
export async function getRandomItems(category: string, count: number = 6): Promise<any[]> {
  const meals = await getMealsByCategory(category);
  
  if (meals.length === 0) {
    console.warn(`分类 ${category} 没有商品数据`);
    return [];
  }
  
  const shuffled = [...meals].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return selected.map(meal => ({
    id: meal.id,
    name: meal.name,
    img: meal.image_url,
    promoUrl: meal.cps_link || '',
    weirdName: meal.name,
    weirdEmoji: '🍽️',
    description: meal.cps_link || ''
  }));
}

/**
 * 加载所有数据（缓存）
 */
let cachedData: Record<string, any[]> = {};
let lastFetchTime = 0;

export const loadFoodData = async () => {
  const now = Date.now();
  if (now - lastFetchTime < 5 * 60 * 1000 && Object.keys(cachedData).length > 0) {
    return cachedData;
  }

  const data: Record<string, any[]> = {};
  for (const category of ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack']) {
    const meals = await getMealsByCategory(category);
    data[category] = meals.map(meal => ({
      id: meal.id,
      name: meal.name,
      img: meal.image_url,
      weirdName: meal.name,
      weirdEmoji: '🍽️',
      description: meal.cps_link || ''
    }));
  }

  cachedData = data;
  lastFetchTime = now;
  return data;
};

// 初始加载
loadFoodData();

export const foodData = cachedData;
