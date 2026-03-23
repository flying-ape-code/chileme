/**
 * 商品数据（从 products 表读取）
 * V3.0: 统一商品数据源 - 从 products 表读取
 */

import { supabase } from './lib/supabaseClient';

export interface Product {
  id: string;
  name: string;
  category: string;
  img?: string;
  promoUrl?: string | null;
  cpsLink?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  distance?: string;
  deliveryTime?: string;
  createdAt: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const productTypes = [
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍜' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍽️' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];

// 向后兼容：mealTypes 别名
export const mealTypes = productTypes;
export const productCategories = productTypes;

/**
 * 获取分类商品（从 products 表）
 * V3.0: 统一数据源，仅返回 isActive=true 的商品
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
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

    // 防御性检查：确保 data 是数组
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取商品异常:', error);
    return [];
  }
}

/**
 * 随机获取商品
 * V3.0: 从 products 表读取，支持 isActive 过滤
 */
export async function getRandomItems(category: string, count: number = 6): Promise<any[]> {
  try {
    const products = await getProductsByCategory(category);
    
    // 防御性检查：确保 products 是有效数组
    if (!Array.isArray(products) || products.length === 0) {
      console.warn(`分类 "${category}" 没有商品数据`);
      return [];
    }
    
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    return selected.map(product => ({
      id: product.id,
      name: product.name,
      img: product.img,
      promoUrl: product.cpsLink || product.promoUrl || '',
      price: product.priceMin || product.priceMax,
      rating: product.rating,
      distance: product.distance,
      deliveryTime: product.deliveryTime,
      weirdName: product.name,
      weirdEmoji: '🍽️',
      description: product.cpsLink || product.promoUrl || ''
    }));
  } catch (error) {
    console.error('获取随机商品异常:', error);
    return [];
  }
}

/**
 * 加载所有数据（缓存）
 * V3.0: 从 products 表读取，5 分钟缓存
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
      const products = await getProductsByCategory(category);
      data[category] = products.map(product => ({
        id: product.id,
        name: product.name,
        img: product.img,
        promoUrl: product.cpsLink || product.promoUrl || '',
        price: product.priceMin || product.priceMax,
        rating: product.rating,
        distance: product.distance,
        deliveryTime: product.deliveryTime,
        weirdName: product.name,
        weirdEmoji: '🍽️',
        description: product.cpsLink || product.promoUrl || '',
        is_active: product.isActive,
        sort_order: product.sortOrder
      }));
    }

    cachedData = data;
    lastFetchTime = now;
    return cachedData;
  } catch (error) {
    console.error('加载食物数据异常:', error);
    return cachedData;
  }
};

// 初始加载
loadFoodData();

export const foodData = cachedData;
