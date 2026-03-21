import React from 'react';
import { Product } from '../lib/productService';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleOrderClick = () => {
    if (product.promo_url) {
      window.open(product.promo_url, '_blank');
    }
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
        
        {/* CPS 按钮 */}
        {product.promo_url && (
          <button
            onClick={handleOrderClick}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            🎁 去点餐
          </button>
        )}
      </div>
    </div>
  );
}
