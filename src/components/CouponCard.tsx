import React from 'react';
import { jumpToMeituan } from '../services/cps-jump';

interface CouponCardProps {
  title: string;
  amount: number;
  threshold: number;
  description?: string;
  imageUrl?: string;
  couponId?: string;
  source?: 'result_page' | 'home_banner' | 'coupon_list';
}

export const CouponCard: React.FC<CouponCardProps> = ({
  title, amount, threshold, description, couponId, source = 'result_page',
}) => {
  const handleClick = () => jumpToMeituan(source, couponId);

  return (
    <div
      className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 cursor-pointer transform hover:scale-105 transition-all shadow-lg"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🟡</span>
            <h3 className="text-white font-bold text-lg">{title}</h3>
          </div>
          {description && <p className="text-white/90 text-sm mb-2">{description}</p>}
          <p className="text-white/70 text-xs">满 ¥{threshold} 可用</p>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-4xl">¥{amount}</div>
          <div className="text-white/90 text-sm font-medium">立即领取</div>
        </div>
      </div>
    </div>
  );
};
