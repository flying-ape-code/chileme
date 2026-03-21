/**
 * 商品数据（从 Supabase products 表读取）
 * V2.2: 修复商品数据源 - 从 products 表读取（108 条记录）
 */

import { supabase } from './lib/supabaseClient';

export interface Meal {
  id: string;
  name: string;
  category: string;
  img: string;
  promoUrl: string | null;
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
 * 获取分类商品（从 products 表）
 */
export async function getMealsByCategory(category: string): Promise<Meal[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取商品失败:', error.message);
      return [];
    }

    // 防御性检查：确保 data 是数组
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取商品异常:', error);
    return [];
  }
}

/**
 * 随机获取商品
 */
export async function getRandomItems(category: string, count: number = 6): Promise<any[]> {
  try {
    const meals = await getMealsByCategory(category);
    
    // 防御性检查：确保 meals 是有效数组
    if (!Array.isArray(meals) || meals.length === 0) {
      console.warn(`分类 "${category}" 没有商品数据`);
      return [];
    }
    
    const shuffled = [...meals].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    return selected.map(meal => ({
      id: meal.id,
      name: meal.name,
      img: meal.img,
      promoUrl: meal.promo_url || '',
      weirdName: meal.name,
      weirdEmoji: '🍽️',
      description: meal.promo_url || ''
    }));
  } catch (error) {
    console.error('获取随机商品异常:', error);
    return [];
  }
}

/**
 * 加载所有数据（缓存）
 */
let cachedData: Record<string, any[]> = {};
let lastFetchTime = 0;

export const loadFoodData = async () => {
  try {
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
        img: meal.img,
        weirdName: meal.name,
        weirdEmoji: '🍽️',
        description: meal.promo_url || ''
      }));
    }

    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error('加载食物数据异常:', error);
    return cachedData;
  }
};

// 初始加载
loadFoodData();

export const foodData = cachedData;
