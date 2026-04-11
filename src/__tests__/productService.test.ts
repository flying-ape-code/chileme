/**
 * 商品服务模块单元测试
 * @module productService.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

import { getProducts, getProductsByCategory, addProduct, updateProduct, deleteProduct, getRandomProducts } from '../lib/productService';
import { supabase } from '../lib/supabaseClient';

describe('商品服务 - getProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取所有商品', async () => {
    const mockProducts = [
      { id: '1', name: '商品 A', img: 'a.jpg', promo_url: 'http://a.com', category: 'lunch' },
      { id: '2', name: '商品 B', img: 'b.jpg', promo_url: 'http://b.com', category: 'dinner' },
    ];

    vi.mocked(supabase.from().select().order).mockResolvedValue({ data: mockProducts, error: null });

    const result = await getProducts();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('商品 A');
  });

  it('应该返回空数组当查询失败', async () => {
    vi.mocked(supabase.from().select().order).mockResolvedValue({ data: null, error: { message: 'Error' } });

    const result = await getProducts();

    expect(result).toEqual([]);
  });
});

describe('商品服务 - getProductsByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取分类商品', async () => {
    const mockProducts = [
      { id: '1', name: '早餐 A', category: 'breakfast' },
      { id: '2', name: '早餐 B', category: 'breakfast' },
    ];

    vi.mocked(supabase.from().select().eq().order).mockResolvedValue({ data: mockProducts, error: null });

    const result = await getProductsByCategory('breakfast');

    expect(result).toHaveLength(2);
  });

  it('应该返回空数组当分类无商品', async () => {
    vi.mocked(supabase.from().select().eq().order).mockResolvedValue({ data: [], error: null });

    const result = await getProductsByCategory('empty-category');

    expect(result).toEqual([]);
  });
});

describe('商品服务 - addProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功添加商品', async () => {
    const mockProduct = {
      id: 'new-123',
      name: '新商品',
      img: 'new.jpg',
      promo_url: 'http://new.com',
      category: 'lunch',
    };

    vi.mocked(supabase.from().insert().select().single).mockResolvedValue({ data: mockProduct, error: null });

    const result = await addProduct({
      name: '新商品',
      img: 'new.jpg',
      promo_url: 'http://new.com',
      category: 'lunch',
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('新商品');
  });

  it('应该处理添加失败', async () => {
    vi.mocked(supabase.from().insert().select().single).mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

    const result = await addProduct({
      name: '失败商品',
      img: 'fail.jpg',
      promo_url: 'http://fail.com',
      category: 'dinner',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Insert failed');
  });
});

describe('商品服务 - updateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功更新商品', async () => {
    const mockUpdated = {
      id: 'prod-123',
      name: '已更新商品',
      img: 'updated.jpg',
      promo_url: 'http://updated.com',
      category: 'lunch',
    };

    vi.mocked(supabase.from().update().eq().select().single).mockResolvedValue({ data: mockUpdated, error: null });

    const result = await updateProduct('prod-123', { name: '已更新商品' });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('已更新商品');
  });

  it('应该处理更新失败', async () => {
    vi.mocked(supabase.from().update().eq().select().single).mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const result = await updateProduct('prod-123', { name: '无效更新' });

    expect(result.success).toBe(false);
  });
});

describe('商品服务 - deleteProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功删除商品', async () => {
    vi.mocked(supabase.from().delete().eq).mockResolvedValue({ error: null });

    const result = await deleteProduct('prod-123');

    expect(result).toBe(true);
  });

  it('应该返回 false 当删除失败', async () => {
    vi.mocked(supabase.from().delete().eq).mockResolvedValue({ error: { message: 'Delete failed' } });

    const result = await deleteProduct('prod-123');

    expect(result).toBe(false);
  });
});

describe('商品服务 - getRandomProducts', () => {
  it('应该随机返回指定数量的商品', () => {
    const products = [
      { id: '1', name: '商品 1', img: '1.jpg', promo_url: 'http://1.com', category: 'lunch', created_at: '', updated_at: '' },
      { id: '2', name: '商品 2', img: '2.jpg', promo_url: 'http://2.com', category: 'lunch', created_at: '', updated_at: '' },
      { id: '3', name: '商品 3', img: '3.jpg', promo_url: 'http://3.com', category: 'lunch', created_at: '', updated_at: '' },
      { id: '4', name: '商品 4', img: '4.jpg', promo_url: 'http://4.com', category: 'lunch', created_at: '', updated_at: '' },
      { id: '5', name: '商品 5', img: '5.jpg', promo_url: 'http://5.com', category: 'lunch', created_at: '', updated_at: '' },
      { id: '6', name: '商品 6', img: '6.jpg', promo_url: 'http://6.com', category: 'lunch', created_at: '', updated_at: '' },
    ];

    const result = getRandomProducts(products, 3);

    expect(result).toHaveLength(3);
    expect(result.every(p => products.includes(p))).toBe(true);
  });

  it('应该返回所有商品当请求数量超过总数', () => {
    const products = [
      { id: '1', name: '商品 1', img: '1.jpg', promo_url: 'http://1.com', category: 'lunch', created_at: '', updated_at: '' },
      { id: '2', name: '商品 2', img: '2.jpg', promo_url: 'http://2.com', category: 'lunch', created_at: '', updated_at: '' },
    ];

    const result = getRandomProducts(products, 10);

    expect(result).toHaveLength(2);
  });

  it('应该使用默认 count 6', () => {
    const products = Array(10).fill(null).map((_, i) => ({
      id: String(i),
      name: `商品${i}`,
      img: `${i}.jpg`,
      promo_url: `http://${i}.com`,
      category: 'lunch',
      created_at: '',
      updated_at: '',
    }));

    const result = getRandomProducts(products);

    expect(result).toHaveLength(6);
  });
});
