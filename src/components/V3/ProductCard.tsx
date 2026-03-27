// V3.0 ProductCard 组件
import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  cpsLink?: string;
  category?: string;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
  onFavorite?: (product: Product) => void;
  isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuy,
  onFavorite,
  isFavorite = false,
}) => {
  const discount = product.discount || (
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0
  );

  return (
    <Card hoverable className="overflow-hidden">
      {/* 商品图片 */}
      <div className="relative h-48 bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* 折扣标签 */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
        
        {/* 收藏按钮 */}
        <button
          onClick={() => onFavorite?.(product)}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-all"
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        {/* 分类标签 */}
        {product.category && (
          <span className="text-xs text-[#2E86AB] font-medium bg-blue-50 px-2 py-0.5 rounded">
            {product.category}
          </span>
        )}
        
        {/* 商品名称 */}
        <h3 className="mt-2 text-base font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* 价格 */}
        <div className="mt-3 flex items-baseline">
          <span className="text-xl font-bold text-[#FF6B35]">
            ¥{product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              ¥{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* 购买按钮 */}
        <Button
          className="w-full mt-3"
          size="md"
          onClick={() => onBuy?.(product)}
        >
          立即购买
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
