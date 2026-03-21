/**
 * 商品数据（从 Supabase products 表读取）
 * 不再使用静态 JSON 文件
 */

import { getProductsByCategory, getRandomProducts, productCategories } from './lib/productService';

export { productCategories };

export const mealTypes = productCategories;

/**
 * 获取分类商品（异步）
 */
export const getFoodData = async (category: string) => {
  return await getProductsByCategory(category);
};

/**
 * 随机获取商品（异步）
 */
export const getRandomItems = async (category: string, count: number = 6) => {
  const products = await getProductsByCategory(category);
  return getRandomProducts(products, count);
};

// 兼容旧代码的同步版本（使用缓存）
let cachedData: Record<string, any[]> = {};
let lastFetchTime = 0;

export const loadFoodData = async () => {
  const now = Date.now();
  // 5 分钟内使用缓存
  if (now - lastFetchTime < 5 * 60 * 1000 && Object.keys(cachedData).length > 0) {
    return cachedData;
  }

  const categories = ['breakfast', 'lunch', 'afternoon-tea', 'dinner', 'night-snack'];
  const data: Record<string, any[]> = {};

  for (const category of categories) {
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
