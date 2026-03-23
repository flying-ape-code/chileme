import React from 'react';
import { Product } from '../lib/productService';
import { jumpToCoupon } from '../services/cps-jump';

interface ProductCardProps {
  product: Product;
  onOrderClick?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({ product, onOrderClick, onProductClick }: ProductCardProps) {
  const handleCouponClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.promo_url) {
      jumpToCoupon({
        couponId: product.id,
        couponLink: product.promo_url,
        source: 'list'
      });
    }
  };

  const handleOrderClick = () => {
    if (product.promo_url && onOrderClick) {
      onOrderClick(product);
    } else if (product.promo_url) {
      window.open(product.promo_url, '_blank');
    }
  };

  // 格式化价格显示
  const formatPrice = (price?: number) => {
    if (!price) return '¥15 起';
    return `¥${price}起`;
  };

  // 格式化评分显示
  const formatRating = (rating?: number) => {
    if (!rating) return null;
    return rating.toFixed(1);
  };

  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮，不触发卡片点击
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (onProductClick) {
      onProductClick(product);
    } else if (onOrderClick) {
      handleOrderClick();
    }
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={handleClick}>
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
        {/* 评分标签 */}
        {product.rating && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
            ⭐ {formatRating(product.rating)}
          </div>
        )}
        {/* CPS 标签 */}
        {product.promo_url && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
            🎁 领券
          </div>
        )}
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        {/* 商品名称 */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={product.name}>
          {product.name}
        </h3>
        
        {/* 价格和配送信息 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-red-500 font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          {(product.distance || product.delivery_time) && (
            <span className="text-gray-500 text-xs">
              {product.distance && <span>{product.distance}</span>}
              {product.distance && product.delivery_time && <span> | </span>}
              {product.delivery_time && <span>{product.delivery_time}</span>}
            </span>
          )}
        </div>

        {/* CPS 领券按钮 */}
        {product.promo_url && (
          <button
            onClick={handleCouponClick}
            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-full font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            🎁 领券购买
            {product.price && (
              <span className="text-xs opacity-90">
                满{Math.ceil(product.price * 2)}减{Math.ceil(product.price * 0.5)}
              </span>
            )}
          </button>
        )}

        {/* 配送信息（无 CPS 时显示） */}
        {!product.promo_url && (product.distance || product.delivery_time || product.rating) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            {product.distance && (
              <span className="flex items-center gap-1">
                📍 {product.distance}
              </span>
            )}
            {product.delivery_time && (
              <span className="flex items-center gap-1">
                ⏱️ {product.delivery_time}
              </span>
            )}
            {product.rating && (
              <span className="flex items-center gap-1">
                ⭐ {formatRating(product.rating)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
