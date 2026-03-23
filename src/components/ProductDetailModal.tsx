import React, { useState, useEffect } from 'react';
import { Product } from '../lib/productsService';
import { jumpToCoupon } from '../../services/cps-jump';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: (productId: string) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onFavorite
}: ProductDetailModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 键盘 ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      // 这里可以从 localStorage 检查收藏状态
      // const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      // setIsFavorite(favorites.includes(product?.id));
    }
  }, [isOpen, product]);

  const handleFavoriteClick = () => {
    if (onFavorite && product) {
      setIsFavorite(!isFavorite);
      onFavorite(product.id);
    }
  };

  const handleOrderClick = () => {
    if (product?.promo_url) {
      jumpToCoupon({
        couponId: product.id,
        couponLink: product.promo_url,
        source: 'detail'
      });
    }
  };

  const handleCouponClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product?.promo_url) {
      jumpToCoupon({
        couponId: product.id,
        couponLink: product.promo_url,
        source: 'detail-coupon'
      });
    }
  };

  if (!isOpen || !product) return null;

  // 格式化价格
  const formatPrice = (price?: number) => {
    if (!price) return '价格面议';
    return `¥${price}`;
  };

  // 格式化评分
  const formatRating = (rating?: number) => {
    if (!rating) return '暂无评分';
    return rating.toFixed(1);
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 弹窗容器 */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* 弹窗内容 */}
        <div
          className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 shadow-lg"
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 商品图片 */}
          <div className="relative bg-gray-100">
            <div className="aspect-w-16 aspect-h-9 sm:aspect-h-10">
              <img
                src={product.img}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=商品图片';
                  setImageLoaded(true);
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>

            {/* 评分标签 */}
            {product.rating && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                ⭐ {formatRating(product.rating)}
              </div>
            )}

            {/* 分类标签 */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {product.category === 'breakfast' && '🌅 早餐'}
              {product.category === 'lunch' && '🍜 午餐'}
              {product.category === 'afternoon-tea' && '☕ 下午茶'}
              {product.category === 'dinner' && '🍽️ 晚餐'}
              {product.category === 'night-snack' && '🌙 夜宵'}
            </div>
          </div>

          {/* 商品信息 */}
          <div className="p-6">
            {/* 标题和收藏 */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900 flex-1">
                {product.name}
              </h2>
              <button
                onClick={handleFavoriteClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isFavorite
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                aria-label={isFavorite ? '取消收藏' : '收藏商品'}
              >
                <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* 价格 */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-500">
                  {product.priceMin && product.priceMax
                    ? `¥${product.priceMin} - ¥${product.priceMax}`
                    : formatPrice(product.priceMin)}
                </span>
                {product.priceMax && (
                  <span className="text-gray-400 text-sm">价格区间</span>
                )}
              </div>
            </div>

            {/* 配送信息 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {product.distance && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">📍</div>
                  <div className="text-sm font-medium text-gray-700">{product.distance}</div>
                  <div className="text-xs text-gray-500">配送距离</div>
                </div>
              )}
              {product.delivery_time && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-sm font-medium text-gray-700">{product.delivery_time}</div>
                  <div className="text-xs text-gray-500">配送时间</div>
                </div>
              )}
              {product.rating && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-sm font-medium text-gray-700">{formatRating(product.rating)}</div>
                  <div className="text-xs text-gray-500">评分</div>
                </div>
              )}
            </div>

            {/* CPS 优惠券信息 */}
            {product.promo_url && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎁</span>
                  <span className="font-bold text-orange-700">限时优惠</span>
                </div>
                <p className="text-sm text-orange-600 mb-3">
                  领取优惠券，享受超值折扣！
                </p>
                <button
                  onClick={handleCouponClick}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-base hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-98"
                >
                  🎫 立即领券
                </button>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {product.promo_url ? (
                <button
                  onClick={handleOrderClick}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3.5 rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-98"
                >
                  🛒 去点餐
                </button>
              ) : (
                <button
                  className="flex-1 bg-gray-200 text-gray-500 py-3.5 rounded-xl font-bold text-lg cursor-not-allowed"
                  disabled
                >
                  暂时无法点餐
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端滑动关闭指示器 */}
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 sm:hidden z-50">
        <div className="w-12 h-1 bg-gray-400/50 rounded-full" />
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
