import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  img: string;
  promo_url?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  product?: Product;
}

// 获取所有商品
export const getProducts = async (): Promise<Record<string, Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return {};
    }

    // 按分类分组
    const grouped: Record<string, Product[]> = {
      breakfast: [],
      lunch: [],
      'afternoon-tea': [],
      dinner: [],
      'night-snack': [],
    };

    (data || []).forEach((product) => {
      if (grouped[product.category]) {
        grouped[product.category].push(product);
      }
    });

    return grouped;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {};
  }
};

// 根据分类获取商品
export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// 添加商品
export const addProduct = async (
  category: string,
  productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductResponse> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        category,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, product: data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '添加商品失败',
    };
  }
};

// 更新商品
export const updateProduct = async (
  category: string,
  productId: string,
  productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
): Promise<ProductResponse> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, product: data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '更新商品失败',
    };
  }
};

// 删除商品
export const deleteProduct = async (
  category: string,
  productId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除商品失败',
    };
  }
};
