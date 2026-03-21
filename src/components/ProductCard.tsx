import React from 'react';
import { Product } from '../lib/productService';

interface ProductCardProps {
  product: Product;
  onOrderClick?: (product: Product) => void;
}

export default function ProductCard({ product, onOrderClick }: ProductCardProps) {
  const handleOrderClick = () => {
    if (product.promo_url && onOrderClick) {
      onOrderClick(product);
    } else if (product.promo_url) {
      window.open(product.promo_url, '_blank');
    }
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* 商品图片 */}
      <div className="relative">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=商品图片';
          }}
        />
        {/* CPS 标签 */}
        {product.promo_url && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            🎁 领券
          </div>
        )}
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
        
        {/* 价格和 CPS 按钮 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-red-500 font-bold text-lg">¥15 起</span>
          {product.promo_url && (
            <button
              onClick={handleOrderClick}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              🎁 去点餐
            </button>
          )}
        </div>

        {/* 配送信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>📍 1.2km</span>
          <span>•</span>
          <span>⏱️ 30 分钟</span>
          <span>•</span>
          <span>⭐ 4.8</span>
        </div>
      </div>
    </div>
  );
}
