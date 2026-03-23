import React, { useState, useEffect } from 'react';
import { getProductsByCategory, getRandomProducts, type Product } from '../lib/productService';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';

interface ProductGridProps {
  selectedCategory: string;
}

export default function ProductGrid({ selectedCategory }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  // 弹窗状态
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 收藏状态
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('productFavorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  // 保存收藏到 localStorage
  useEffect(() => {
    localStorage.setItem('productFavorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const loadProducts = async () => {
    setIsLoading(true);
    const categoryProducts = await getProductsByCategory(selectedCategory);
    const randomProducts = getRandomProducts(categoryProducts, 6);
    setProducts(randomProducts);
    setCount(categoryProducts.length);
    setIsLoading(false);
  };

  // 打开商品详情弹窗
  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300); // 等待动画结束
  };

  // 切换收藏状态
  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  if (isLoading) {
    return (
      <div className="product-grid-loading text-center py-12">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="product-grid">
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
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* 商品详情弹窗 */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isFavorite={favorites.has(selectedProduct.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* 空状态 */}
      {products.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>暂无商品</p>
        </div>
      )}
    </div>
  );
}
