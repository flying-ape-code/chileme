import React, { useEffect, useRef } from 'react';
import { jumpToCoupon } from '../services/cps-jump';
import { observeImpression } from '../services/cps-tracking';

interface MealCardProps {
  id: string;
  name: string;
  image_url: string;
  cps_link: string;
  price?: number;
  rating?: number;
  distance?: string;
  deliveryTime?: string;
  category: string;
}

export default function MealCard({
  id,
  name,
  image_url,
  cps_link,
  price,
  rating,
  distance,
  deliveryTime,
  category
}: MealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 曝光追踪
  useEffect(() => {
    if (!cardRef.current) return;
    
    // 使用 Intersection Observer 自动追踪曝光
    const unobserve = observeImpression(cardRef.current, id, 'list');
    
    return () => {
      unobserve();
    };
  }, [id]);

  const handleCouponClick = () => {
    jumpToCoupon({
      couponId: id,
      couponLink: cps_link,
      source: 'list'
    });
  };

  return (
    <div ref={cardRef} className="meal-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* 商品图片 */}
      <div className="relative">
        <img
          src={image_url}
          alt={name}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=商品图片';
          }}
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-bold">
            ⭐ {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{name}</h3>
        
        {/* 价格和信息 */}
        <div className="flex items-center justify-between mb-3">
          {price && (
            <span className="text-red-500 font-bold text-lg">
              ¥{price}起
            </span>
          )}
          {(distance || deliveryTime) && (
            <span className="text-gray-500 text-xs">
              {distance && <span>{distance}</span>}
              {distance && deliveryTime && <span> | </span>}
              {deliveryTime && <span>{deliveryTime}</span>}
            </span>
          )}
        </div>

        {/* CPS 领券按钮 */}
        {cps_link && (
          <button
            onClick={handleCouponClick}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center gap-2"
          >
            🎁 领券购买
          </button>
        )}
      </div>
    </div>
  );
}
