/**
 * 商品数据（从 Supabase products 表读取）
 * 不再使用静态 JSON 文件
 */

import { supabase } from './lib/supabaseClient';

export interface Product {
  id: string;
  name: string;
  img: string;
  promo_url: string;
  category: string;
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
 * 获取分类商品
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
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
  const products = await getProductsByCategory(category);
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return selected.map(p => ({
    id: p.id,
    name: p.name,
    img: p.img,
    promoUrl: p.promo_url,
    weirdName: p.name,
    weirdEmoji: '🍽️',
    description: p.promo_url
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
    const products = await getProductsByCategory(category);
    data[category] = products.map(p => ({
      name: p.name,
      img: p.img,
      weirdName: p.name,
      weirdEmoji: '🍽️',
      description: p.promo_url
    }));
  }

  cachedData = data;
  lastFetchTime = now;
  return data;
};

// 初始加载
loadFoodData();

export const foodData = cachedData;
