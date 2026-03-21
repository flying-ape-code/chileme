import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  img: string;
  promo_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

/**
 * 获取所有商品
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取商品失败:', error.message);
    return [];
  }

  return data || [];
}

/**
 * 获取指定分类的商品
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
 * 添加商品
 */
export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Product; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 更新商品
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * 删除商品
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
}

/**
 * 随机获取商品
 */
export function getRandomProducts(products: Product[], count: number = 6): Product[] {
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 商品分类
 */
export const productCategories = [
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍜' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍽️' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];
