import React, { useEffect, useCallback } from 'react';
import { Product } from '../lib/productService';
import { jumpToCoupon } from '../services/cps-jump';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite
}: ProductDetailModalProps) {
  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // 点击背景关闭
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // 滑动关闭（移动端）
  useEffect(() => {
    if (!isOpen) return;

    let touchStartY = 0;
    let touchCurrentY = 0;
    const modalContent = document.querySelector('.modal-content');

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = (e as TouchEvent).touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchCurrentY = (e as TouchEvent).touches[0].clientY;
      const diff = touchCurrentY - touchStartY;
      
      // 向下滑动超过 100px 关闭
      if (diff > 100 && modalContent) {
        (modalContent as HTMLElement).style.transform = `translateY(${diff}px)`;
        (modalContent as HTMLElement).style.opacity = `${1 - diff / 500}`;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchCurrentY - touchStartY;
      
      if (diff > 150) {
        // 滑动距离足够，关闭弹窗
        onClose();
      } else if (modalContent) {
        // 恢复原位
        (modalContent as HTMLElement).style.transform = '';
        (modalContent as HTMLElement).style.opacity = '';
      }
      
      touchStartY = 0;
      touchCurrentY = 0;
    };

    if (modalContent) {
      modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
      modalContent.addEventListener('touchmove', handleTouchMove, { passive: true });
      modalContent.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (modalContent) {
        modalContent.removeEventListener('touchstart', handleTouchStart);
        modalContent.removeEventListener('touchmove', handleTouchMove);
        modalContent.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose]);

  // 去点餐
  const handleOrderClick = () => {
    if (!product) return;
    
    jumpToCoupon({
      couponId: product.id,
      couponLink: product.promo_url,
      source: 'detail'
    });
  };

  // 收藏/取消收藏
  const handleFavoriteClick = () => {
    if (!product) return;
    onToggleFavorite(product.id);
  };

  if (!isOpen || !product) return null;

  // 模拟评分和评论数（实际应从 API 获取）
  const rating = 4.8;
  const reviewCount = Math.floor(Math.random() * 500) + 50;

  return (
    <div
      className="product-detail-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="modal-content bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 z-10 transition-all duration-200 shadow-lg"
          aria-label="关闭"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 商品大图 */}
        <div className="relative">
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-72 object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=商品图片';
            }}
          />
          
          {/* CPS 标签 */}
          {product.promo_url && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              🎁 领券优惠
            </div>
          )}
          
          {/* 评分徽章 */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <span className="text-yellow-500 font-bold text-lg">⭐ {rating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({reviewCount}条评论)</span>
          </div>
        </div>

        {/* 商品信息 */}
        <div className="p-6">
          {/* 商品名称 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h2>
          
          {/* 商品描述 */}
          {product.name && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              精选优质食材，美味可口，值得信赖的选择。
            </p>
          )}

          {/* 价格区间 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <div className="flex items-baseline gap-2">
              <span className="text-red-500 font-bold text-3xl">¥15</span>
              <span className="text-gray-500 text-sm">起</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600 text-sm">价格区间 ¥15-¥80</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleOrderClick}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-full font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              🎁 去点餐
            </button>
            <button
              onClick={handleFavoriteClick}
              className={`px-6 py-3.5 rounded-full font-bold text-lg border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                isFavorite
                  ? 'bg-red-50 border-red-500 text-red-500'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
            </button>
          </div>

          {/* 配送信息 */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                1.2km
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                30 分钟
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                4.8 分
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
