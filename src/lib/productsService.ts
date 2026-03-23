import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  img: string;
  promoUrl: string | null;
  cpsLink: string | null;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  rating: number | null;
  distance: string | null;
  deliveryTime: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取指定分类的商品列表
 * 仅返回 isActive=true 的商品
 */
export async function getProductsByCategory(
  category: string,
  options: {
    active?: boolean;
    limit?: number;
    includeInactive?: boolean;
  } = {}
): Promise<Product[]> {
  const { active = true, limit = 100, includeInactive = false } = options;

  let query = supabase
    .from('products')
    .select('*')
    .eq('category', category);

  // 除非明确指定，否则只返回活跃商品
  if (!includeInactive) {
    query = query.eq('is_active', active);
  }

  // 按排序权重和创建时间排序
  query = query
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('获取商品失败:', error.message);
    return [];
  }

  return data || [];
}

/**
 * 获取单个商品详情
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('获取商品详情失败:', error.message);
    return null;
  }

  return data;
}

/**
 * 随机获取指定数量的商品
 */
export async function getRandomProducts(
  category: string,
  count: number = 6
): Promise<Product[]> {
  const allProducts = await getProductsByCategory(category, { active: true, limit: 100 });
  
  if (allProducts.length === 0) {
    return [];
  }

  // Fisher-Yates 洗牌算法
  const shuffled = [...allProducts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * 创建商品
 */
export async function createProduct(product: Partial<Product>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('products').insert([
      {
        name: product.name,
        img: product.img,
        promoUrl: product.promoUrl || null,
        cpsLink: product.cpsLink || null,
        category: product.category,
        priceMin: product.priceMin || null,
        priceMax: product.priceMax || null,
        rating: product.rating || 0,
        distance: product.distance || null,
        deliveryTime: product.deliveryTime || null,
        isActive: product.isActive ?? true,
        sortOrder: product.sortOrder ?? 0
      }
    ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 更新商品
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 删除商品（软删除：设置 isActive=false）
 */
export async function deleteProduct(
  id: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    let error;
    
    if (hardDelete) {
      // 硬删除：从数据库删除
      const result = await supabase.from('products').delete().eq('id', id);
      error = result.error;
    } else {
      // 软删除：设置 isActive=false
      const result = await supabase
        .from('products')
        .update({ isActive: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      error = result.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 批量导入商品
 */
export async function importProducts(
  products: Partial<Product>[]
): Promise<{ success: boolean; inserted: number; error?: string }> {
  try {
    const { data, error } = await supabase.from('products').insert(products);

    if (error) {
      return { success: false, inserted: 0, error: error.message };
    }

    return { success: true, inserted: data?.length || 0 };
  } catch (err: any) {
    return { success: false, inserted: 0, error: err.message };
  }
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
 * 获取分类统计
 */
export async function getCategoryStats(): Promise<
  Array<{ category: string; count: number; activeCount: number }>
> {
  const stats = [];
  
  for (const category of productCategories) {
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.id);

    const { count: activeCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.id)
      .eq('is_active', true);

    stats.push({
      category: category.id,
      count: totalCount || 0,
      activeCount: activeCount || 0
    });
  }

  return stats;
}

/**
 * 记录商品点击
 */
export async function trackClick(productId: string): Promise<void> {
  await supabase.rpc('increment_click_count', { product_id: productId });
}

/**
 * 记录商品转化
 */
export async function trackConversion(productId: string): Promise<void> {
  await supabase.rpc('increment_conversion_count', { product_id: productId });
}
