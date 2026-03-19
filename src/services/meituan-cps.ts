import { CPS_CONFIG, MEITUAN_API_BASE } from '../config/cps';
import { generateSign, getTimestamp, getNonce } from '../utils/meituan-sign';

export interface Coupon {
  id: string;
  title: string;
  amount: number;
  threshold: number;
  description: string;
  imageUrl: string;
  link: string;
  expireTime: string;
  platform: 'meituan';
}

export interface CouponListResponse {
  code: number;
  message: string;
  data: Coupon[];
}

/**
 * 获取优惠券列表
 */
export async function getCoupons(
  categoryId?: string,
  limit: number = 10
): Promise<CouponListResponse> {
  const timestamp = getTimestamp();
  const nonce = getNonce();
  
  const params = {
    appkey: CPS_CONFIG.appkey,
    timestamp,
    nonce,
    positionId: CPS_CONFIG.positionId,
    channelId: CPS_CONFIG.channelId,
    categoryId: categoryId || '',
    limit,
  };
  
  const sign = generateSign(params, CPS_CONFIG.secret);
  
  const url = `${MEITUAN_API_BASE}/coupon/get?${new URLSearchParams({
    ...params,
    sign,
  }).toString()}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取优惠券失败:', error);
    return { code: -1, message: '网络错误', data: [] };
  }
}

/**
 * 获取优惠券详情
 */
export async function getCouponDetail(couponId: string): Promise<Coupon | null> {
  const coupons = await getCoupons();
  return coupons.data.find(c => c.id === couponId) || null;
}
