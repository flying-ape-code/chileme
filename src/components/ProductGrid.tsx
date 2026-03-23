import React, { useState, useEffect } from 'react';
import { getProductsByCategory, getRandomProducts, type Product } from '../lib/productService';
import ProductCard from './ProductCard';

interface ProductGridProps {
  selectedCategory: string;
}

export default function ProductGrid({ selectedCategory }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setIsTransitioning(true);
    setIsLoading(true);
    
    try {
      const categoryProducts = await getProductsByCategory(selectedCategory);
      const randomProducts = getRandomProducts(categoryProducts, 6);
      
      // 添加淡入动画延迟
      setTimeout(() => {
        setProducts(randomProducts);
        setCount(categoryProducts.length);
        setIsLoading(false);
        setIsTransitioning(false);
      }, 200);
    } catch (error) {
      console.error('加载商品失败:', error);
      setProducts([]);
      setCount(0);
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  const getCategoryInfo = () => {
    switch (selectedCategory) {
      case 'breakfast': return { emoji: '🌅', name: '早餐' };
      case 'lunch': return { emoji: '🍜', name: '午餐' };
      case 'afternoon-tea': return { emoji: '☕', name: '下午茶' };
      case 'dinner': return { emoji: '🍽️', name: '晚餐' };
      case 'night-snack': return { emoji: '🌙', name: '夜宵' };
      default: return { emoji: '🍽️', name: '美食' };
    }
  };

  const categoryInfo = getCategoryInfo();

  if (isLoading) {
    return (
      <div className="product-grid-loading text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
        <div className="text-gray-400 font-mono text-sm">加载商品数据...</div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {/* 分类信息 */}
      <div className="mb-6 flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">{categoryInfo.emoji}</span>
          <span>{categoryInfo.name}</span>
        </h2>
        <span className="text-cyber-cyan/60 text-sm font-mono">
          共 <span className="text-cyber-cyan font-bold">{count}</span> 个商品
        </span>
      </div>

      {/* 商品网格 */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {products.length === 0 && (
        <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-400 text-lg mb-2">暂无商品</p>
          <p className="text-gray-500 text-sm">该分类下还没有商品，请稍后再来</p>
        </div>
      )}
    </div>
  );
}
