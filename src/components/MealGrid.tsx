import React, { useState, useEffect } from 'react';
import { getProductsByCategory, getRandomProducts, type Product } from '../lib/productsService';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';

interface MealGridProps {
  selectedCategory: string;
}

export default function MealGrid({ selectedCategory }: MealGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setIsLoading(true);
    const categoryProducts = await getProductsByCategory(selectedCategory);
    const randomProducts = getRandomProducts(categoryProducts, 6);
    setProducts(randomProducts);
    setCount(categoryProducts.length);
    setIsLoading(false);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleOrderClick = (product: Product) => {
    console.log('Order clicked:', product);
    // 这里可以添加订单追踪逻辑
  };

  const handleFavorite = (productId: string) => {
    console.log('Favorite toggled:', productId);
    // TODO: 实现收藏功能（保存到数据库或 localStorage）
  };

  if (isLoading) {
    return (
      <div className="meal-grid-loading text-center py-12">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="meal-grid">
      {/* 分类信息 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {selectedCategory === 'breakfast' && '🌅 早餐'}
          {selectedCategory === 'lunch' && '🍜 午餐'}
          {selectedCategory === 'afternoon-tea' && '☕ 下午茶'}
          {selectedCategory === 'dinner' && '🍽️ 晚餐'}
          {selectedCategory === 'night-snack' && '🌙 夜宵'}
        </h2>
        <span className="text-cyber-cyan/60 text-sm">
          共 {count} 个商品
        </span>
      </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={handleProductClick}
            onOrderClick={handleOrderClick}
          />
        ))}
      </div>

      {/* 商品详情弹窗 */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFavorite={handleFavorite}
      />

      {/* 空状态 */}
      {meals.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>暂无商品</p>
        </div>
      )}
    </div>
  );
}
