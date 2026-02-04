// 商品数据管理工具
const STORAGE_KEY = 'chileme_products';

// 默认商品数据（初始化用）
const defaultProducts = {
  breakfast: [],
  lunch: [],
  'afternoon-tea': [],
  dinner: [],
  'night-snack': []
};

// 从 localStorage 获取商品数据
export const getProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // 第一次使用，初始化空数据
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return defaultProducts;
  }
};

// 保存商品数据到 localStorage
export const saveProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return { success: true };
  } catch (error) {
    console.error('Error saving products:', error);
    return { success: false, message: '保存失败' };
  }
};

// 添加商品
export const addProduct = (category, product) => {
  const products = getProducts();
  
  if (!products[category]) {
    products[category] = [];
  }
  
  const newProduct = {
    id: `${category}-${Date.now()}`,
    name: product.name,
    img: product.img,
    promoUrl: product.promoUrl || '',
    createdAt: new Date().toISOString()
  };
  
  products[category].push(newProduct);
  return saveProducts(products);
};

// 更新商品
export const updateProduct = (category, productId, updatedData) => {
  const products = getProducts();
  
  if (!products[category]) {
    return { success: false, message: '分类不存在' };
  }
  
  const index = products[category].findIndex(p => p.id === productId);
  if (index === -1) {
    return { success: false, message: '商品不存在' };
  }
  
  products[category][index] = {
    ...products[category][index],
    ...updatedData
  };
  
  return saveProducts(products);
};

// 删除商品
export const deleteProduct = (category, productId) => {
  const products = getProducts();
  
  if (!products[category]) {
    return { success: false, message: '分类不存在' };
  }
  
  products[category] = products[category].filter(p => p.id !== productId);
  return saveProducts(products);
};

// 获取某个分类的商品
export const getProductsByCategory = (category) => {
  const products = getProducts();
  return products[category] || [];
};

// 导出商品数据（用于备份）
export const exportProducts = () => {
  const products = getProducts();
  return JSON.stringify(products, null, 2);
};

// 导入商品数据
export const importProducts = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    const result = saveProducts(data);
    return result;
  } catch {
    return { success: false, message: '数据格式错误' };
  }
};
