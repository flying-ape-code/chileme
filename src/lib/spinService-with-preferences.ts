// 转盘服务 - 支持用户喜好权重
import { supabase } from './supabaseClient';
import { UserPreference, WEIGHT_CONFIG } from '../types/preferences';

interface Product {
  id: string;
  name: string;
  tags?: string[];
  category: string;
}

interface WeightedProduct {
  product: Product;
  weight: number;
}

/**
 * 计算商品权重
 */
export function calculateWeight(
  product: Product,
  preferences: UserPreference[]
): number {
  let weight = 1.0;

  const productTags = product.tags || [];

  for (const pref of preferences) {
    // 忌口商品直接排除
    if (pref.preference_type === 'avoid' || pref.weight === 0) {
      if (productTags.includes(pref.preference_value)) {
        return 0;
      }
    }

    // 喜欢的食材增加权重
    if (pref.preference_type === 'ingredient' && pref.weight > 1) {
      if (productTags.includes(pref.preference_value)) {
        weight *= WEIGHT_CONFIG.like;
      }
    }

    // 不喜欢的食材降低权重
    if (pref.preference_type === 'ingredient' && pref.weight < 1 && pref.weight > 0) {
      if (productTags.includes(pref.preference_value)) {
        weight *= WEIGHT_CONFIG.dislike;
      }
    }
  }

  return weight;
}

/**
 * 获取用户喜好
 */
export async function getUserPreferences(userId: string): Promise<UserPreference[]> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('获取喜好失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 根据喜好筛选商品池
 */
export async function getFilteredProducts(
  category: string,
  preferences: UserPreference[]
): Promise<WeightedProduct[]> {
  // 获取该分类所有商品
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true);

  if (error) {
    console.error('获取商品失败:', error);
    return [];
  }

  // 计算权重并过滤
  const weightedProducts: WeightedProduct[] = [];

  for (const product of products || []) {
    const weight = calculateWeight(product, preferences);
    
    // 权重>0 才加入商品池
    if (weight > 0) {
      weightedProducts.push({
        product,
        weight,
      });
    }
  }

  // 如果商品太少，提示用户
  if (weightedProducts.length < 3) {
    console.warn('筛选后商品不足 3 个，建议放宽喜好设置');
  }

  return weightedProducts;
}

/**
 * 加权随机选择
 */
export function weightedRandomSelect(weightedProducts: WeightedProduct[]): Product | null {
  if (weightedProducts.length === 0) return null;

  // 计算总权重
  const totalWeight = weightedProducts.reduce((sum, p) => sum + p.weight, 0);

  // 随机数
  let random = Math.random() * totalWeight;

  // 选择商品
  for (const { product, weight } of weightedProducts) {
    random -= weight;
    if (random <= 0) {
      return product;
    }
  }

  //  fallback
  return weightedProducts[weightedProducts.length - 1].product;
}

/**
 * 执行转盘（带喜好）
 */
export async function spinWithPreferences(
  userId: string,
  category: string
): Promise<Product | null> {
  // 获取用户喜好
  const preferences = await getUserPreferences(userId);

  // 无喜好设置，使用普通转盘
  if (preferences.length === 0) {
    // TODO: 调用原有转盘逻辑
    return null;
  }

  // 获取加权商品池
  const weightedProducts = await getFilteredProducts(category, preferences);

  if (weightedProducts.length === 0) {
    console.error('没有可用商品，请检查喜好设置');
    return null;
  }

  // 加权随机选择
  return weightedRandomSelect(weightedProducts);
}
