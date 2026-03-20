import React from 'react';
import { jumpToCoupon } from '../services/cps-jump';

interface MealDetailModalProps {
  meal: {
    id: string;
    name: string;
    image_url: string;
    cps_link: string;
    price?: number;
    rating?: number;
    reviewCount?: number;
    description?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MealDetailModal({ meal, isOpen, onClose }: MealDetailModalProps) {
  if (!isOpen || !meal) return null;

  const handleOrderClick = () => {
    jumpToCoupon({
      couponId: meal.id,
      couponLink: meal.cps_link,
      source: 'detail'
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="meal-detail-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 z-10"
        >
          ✕
        </button>

        {/* 商品图片 */}
        <div className="relative">
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-64 object-cover"
          />
          {meal.rating && (
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              ⭐ {meal.rating.toFixed(1)}
              {meal.reviewCount && <span className="text-gray-500 text-xs">({meal.reviewCount})</span>}
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{meal.name}</h2>
          
          {meal.description && (
            <p className="text-gray-600 mb-4">{meal.description}</p>
          )}

          {/* 价格 */}
          {meal.price && (
            <div className="mb-6">
              <span className="text-red-500 font-bold text-2xl">¥{meal.price}起</span>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleOrderClick}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              🎁 去点餐
            </button>
            <button
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-full font-bold hover:border-gray-400 transition-all"
            >
              ❤️ 收藏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
