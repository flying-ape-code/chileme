import React from 'react';
import { Coupon } from '../services/meituan-cps';
import { jumpToCoupon } from '../services/cps-jump';

interface CouponCardProps {
  coupon: Coupon;
  source?: 'result' | 'detail' | 'list';
}

export default function CouponCard({ coupon, source = 'list' }: CouponCardProps) {
  const handleClick = () => {
    jumpToCoupon({
      couponId: coupon.id,
      couponLink: coupon.link,
      source,
    });
  };

  return (
    <div
      onClick={handleClick}
      className="coupon-card cursor-pointer bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:border-orange-400 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* 优惠券图标 */}
        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
          ¥{coupon.amount}
        </div>

        {/* 优惠券信息 */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">{coupon.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>满{coupon.threshold}可用</span>
            <span>•</span>
            <span>有效期至{new Date(coupon.expireTime).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        {/* 立即使用按钮 */}
        <button className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors">
          立即使用
        </button>
      </div>
    </div>
  );
}
