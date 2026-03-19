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

export async function getCoupons(categoryId?: string, limit: number = 10): Promise<Coupon[]> {
  const timestamp = getTimestamp();
  const nonce = getNonce();
  
  const params = {
    appkey: CPS_CONFIG.appkey,
    position_id: CPS_CONFIG.positionId,
    channel_id: CPS_CONFIG.channelId,
    category_id: categoryId || '',
    limit: limit.toString(),
    timestamp: timestamp.toString(),
    nonce,
  };
  
  const sign = generateSign(params, CPS_CONFIG.secret);
  
  try {
    const response = await fetch(
      `${MEITUAN_API_BASE}/v2/coupon/list?${new URLSearchParams({ ...params, sign })}`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data.map((item: any) => ({ ...item, platform: 'meituan' as const }));
    }
    return [];
  } catch (error) {
    console.error('获取优惠券失败:', error);
    return [];
  }
}
