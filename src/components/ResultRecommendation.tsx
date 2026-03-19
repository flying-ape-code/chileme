import React, { useState, useEffect } from 'react';
import { getCoupons, type Coupon } from '../services/meituan-cps';
import CouponCard from './CouponCard';
import { CPS_CONFIG } from '../config/cps';

interface ResultRecommendationProps {
  mealId?: string;
  mealName?: string;
}

export default function ResultRecommendation({ mealId, mealName }: ResultRecommendationProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!CPS_CONFIG.enabled) return;
    
    loadCoupons();
  }, [mealId]);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await getCoupons(undefined, 3);
      if (response.code === 0) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!CPS_CONFIG.enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🎁</span>
        外卖优惠券
      </h2>
      
      <div className="space-y-4">
        {coupons.map(coupon => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            source="result"
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        点击优惠券跳转美团小程序，享受优惠价格
      </p>
    </div>
  );
}
