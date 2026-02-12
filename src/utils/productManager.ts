// 商品管理工具

// 商品类别
export const MEAL_CATEGORIES = [
  { id: 'breakfast', name: '早餐', emoji: '🌅' },
  { id: 'lunch', name: '午餐', emoji: '🍽️' },
  { id: 'afternoon-tea', name: '下午茶', emoji: '☕' },
  { id: 'dinner', name: '晚餐', emoji: '🍲' },
  { id: 'night-snack', name: '夜宵', emoji: '🌙' }
];

export interface Product {
  id: string;
  category: string;
  name: string;
  img: string;
  promoUrl: string;
  crawledAt?: string;
}

// 存储键
const STORAGE_KEY = 'chileme_products';

// 从 localStorage 加载商品数据
export const loadProducts = (): Record<string, Product[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载商品数据失败：', error);
  }
  return {};
};

// 保存商品数据到 localStorage
export const saveProducts = (products: Record<string, Product[]>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('保存商品数据失败：', error);
  }
};

// 获取指定类别的商品
export const getProductsByCategory = (category: string): Product[] => {
  const products = loadProducts();
  return products[category] || [];
};

// 添加商品
export const addProduct = (category: string, product: Omit<Product, 'id'>): Product => {
  const products = loadProducts();
  const newProduct: Product = {
    ...product,
    id: `${category}-${Date.now()}`
  };

  if (!products[category]) {
    products[category] = [];
  }

  products[category].push(newProduct);
  saveProducts(products);

  return newProduct;
};

// 更新商品
export const updateProduct = (category: string, productId: string, updates: Partial<Product>): boolean => {
  const products = loadProducts();
  const categoryProducts = products[category];

  if (!categoryProducts) return false;

  const index = categoryProducts.findIndex(p => p.id === productId);
  if (index === -1) return false;

  products[category][index] = { ...categoryProducts[index], ...updates };
  saveProducts(products);

  return true;
};

// 删除商品
export const deleteProduct = (category: string, productId: string): boolean => {
  const products = loadProducts();
  const categoryProducts = products[category];

  if (!categoryProducts) return false;

  const initialLength = categoryProducts.length;
  products[category] = categoryProducts.filter(p => p.id !== productId);

  if (products[category].length === initialLength) return false;

  saveProducts(products);
  return true;
};
