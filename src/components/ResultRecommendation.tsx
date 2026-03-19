import React, { useEffect, useState } from 'react';
import { CouponCard } from './CouponCard';
import { getCoupons, Coupon } from '../services/meituan-cps';

interface ResultRecommendationProps {
  category: string;
}

export const ResultRecommendation: React.FC<ResultRecommendationProps> = ({ category }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const data = await getCoupons(undefined, 5);
        setCoupons(data);
      } catch (error) {
        console.error('获取优惠券失败:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, [category]);

  if (loading) return <div className="mt-8 pt-6 border-t border-gray-200 text-center py-4 text-gray-500">加载中...</div>;
  if (coupons.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">🎁</span>
        为你推荐附近美食
      </h2>
      <div className="space-y-3">
        {coupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            title={coupon.title}
            amount={coupon.amount}
            threshold={coupon.threshold}
            description={coupon.description}
            couponId={coupon.id}
            source="result_page"
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">点击领取优惠券，下单更优惠 💰</p>
    </div>
  );
};
